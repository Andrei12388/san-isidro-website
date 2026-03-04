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

export default function CheckInSection() {
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

    if (!locationVerified && !faceVerified) {
      toast.error('Please verify your location or face first');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/event-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          eventId: selectedEventId,
          timeIn: new Date().toISOString(),
          isPresent: true,
          location,
          faceImage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit attendance');
      }

      toast.success('Attendance recorded successfully!');
      
      // Reset states
      setLocationVerified(false);
      setFaceVerified(false);
      setLocation(null);
      setFaceImage(null);
    } catch (error) {
      console.error('Error submitting attendance:', error);
      toast.error('Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = locationVerified || faceVerified;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
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
                  {eventsLoading ? (
                    <SelectItem value="loading" disabled>Loading events...</SelectItem>
                  ) : Array.isArray(events) && events.length > 0 ? (
                    events.map((event) => (
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
                    ))
                  ) : (
                    <SelectItem value="no-events" disabled>No events available</SelectItem>
                  )}
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

          {/* Verification Methods */}
          {selectedEventId && (
            <Tabs defaultValue="location" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Geolocation
                </TabsTrigger>
                <TabsTrigger value="face" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Face Recognition
                </TabsTrigger>
              </TabsList>

              <TabsContent value="location" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Location Verification</CardTitle>
                    <CardDescription>
                      Verify your location matches the event location
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GeolocationAttendance
                      eventId={parseInt(selectedEventId)}
                      eventTitle={selectedEvent?.title}
                      accessToken={access_token}
                      onLocationVerified={handleLocationVerified}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="face" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Face Recognition</CardTitle>
                    <CardDescription>
                      Use facial recognition to verify your identity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FacialRecognition
                      eventId={parseInt(selectedEventId)}
                      eventTitle={selectedEvent?.title}
                      userId={userId || 0}
                      onFaceVerified={handleFaceVerified}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Location Verified:</span>
                <Badge variant={locationVerified ? 'default' : 'secondary'}>
                  {locationVerified ? 'Verified ✓' : 'Not Verified'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Face Verified:</span>
                <Badge variant={faceVerified ? 'default' : 'secondary'}>
                  {faceVerified ? 'Verified ✓' : 'Not Verified'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            onClick={submitAttendance}
            disabled={!canSubmit || submitting}
            size="lg"
            className="w-full"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {submitting ? 'Submitting...' : 'Submit Attendance'}
          </Button>
        </div>
      </div>
    </div>
  );
}
