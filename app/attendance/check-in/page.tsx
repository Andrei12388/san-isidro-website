'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GeolocationAttendance from '@/components/attendance/GeolocationAttendance';
import FacialRecognition from '@/components/attendance/FacialRecognition';
import { MapPin, Camera, CheckCircle2, Calendar, MapPinIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface Event {
  id: number;
  title: string;
  description?: string;
  location: string;
  start: string;
  end: string;
  isRegular: boolean;
  recurrence?: string;
}

export default function CheckInPage() {
  const { id: userId, name, email, access_token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [locationVerified, setLocationVerified] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      const event = events.find((e) => e.id.toString() === selectedEventId);
      setSelectedEvent(event || null);
    }
  }, [selectedEventId, events]);

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await fetch('/api/postgre/events?allowRegistration=true');
      const result = await response.json();
      
      // API returns { data: [...] }
      const eventsArray = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
      setEvents(eventsArray);
      
      // Auto-select first event if available
      if (eventsArray.length > 0) {
        setSelectedEventId(eventsArray[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]); // Set empty array on error
      toast.error('Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  };

  const handleLocationVerified = (loc: { latitude: number; longitude: number }) => {
    setLocationVerified(true);
    setLocation(loc);
  };

  const handleFaceVerified = (imageData: string) => {
    setFaceVerified(true);
    setFaceImage(imageData);
  };

  const submitAttendance = async () => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    if (!selectedEventId) {
      toast.error('Please select an event');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/event-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          eventId: parseInt(selectedEventId),
          timeIn: new Date().toISOString(),
          isPresent: true,
          // Include location data if available
          ...(location && {
            metadata: {
              location,
              verificationMethod: faceVerified ? 'face-and-location' : 'location-only',
            },
          }),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit attendance');
      }

      toast.success('Attendance recorded successfully!');
      
      // Reset states
      setTimeout(() => {
        setLocationVerified(false);
        setFaceVerified(false);
        setLocation(null);
        setFaceImage(null);
      }, 3000);
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast.error('Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = locationVerified || faceVerified;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Check-In</h1>
        <p className="text-muted-foreground">
          Verify your attendance using location or facial recognition
        </p>
      </div>

      {/* Event Selection */}
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Event
            </CardTitle>
            <CardDescription>Choose the event you want to check in to</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(events) && events.map((event) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{event.title}</span>
                      {event.isRegular && (
                        <Badge variant="secondary" className="text-xs">
                          {event.recurrence}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedEvent && (
              <div className="mt-4 p-4 border rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" />
                    {selectedEvent.location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span>{format(new Date(selectedEvent.start), 'PPp')}</span>
                </div>
                {selectedEvent.isRegular && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recurrence:</span>
                    <Badge variant="secondary">{selectedEvent.recurrence}</Badge>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {locationVerified ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Verified</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Not verified</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Face Recognition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {faceVerified ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Verified</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Not verified</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Methods */}
        <Tabs defaultValue="location" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="location" className="gap-2" disabled={!selectedEventId}>
              <MapPin className="h-4 w-4" />
              Location
            </TabsTrigger>
            <TabsTrigger value="face" className="gap-2" disabled={!selectedEventId}>
              <Camera className="h-4 w-4" />
              Face Recognition
            </TabsTrigger>
          </TabsList>

          <TabsContent value="location" className="space-y-4">
            {selectedEvent ? (
              <GeolocationAttendance
                eventId={parseInt(selectedEventId)}
                eventTitle={selectedEvent.title}
                accessToken={access_token}
                onLocationVerified={handleLocationVerified}
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Please select an event first
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="face" className="space-y-4">
            {selectedEvent ? (
              <FacialRecognition
                eventId={parseInt(selectedEventId)}
                eventTitle={selectedEvent.title}
                userId={userId || 0}
                onFaceVerified={handleFaceVerified}
                requireLiveness={true}
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Please select an event first
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={submitAttendance}
              disabled={!canSubmit || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? 'Recording Attendance...' : 'Submit Attendance'}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              {!canSubmit
                ? 'Please verify using either location or face recognition'
                : 'Click to record your attendance'}
            </p>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div className="flex gap-2">
              <span className="font-semibold">1.</span>
              <span>Choose verification method: Location or Face Recognition</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">2.</span>
              <span>Complete the verification process</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">3.</span>
              <span>Click Submit Attendance to record your presence</span>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
              <p className="text-xs">
                💡 <strong>Tip:</strong> For maximum security, you can verify using both methods!
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
