'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAuth } from '@/context/fetchAuth';

interface GeolocationAttendanceProps {
  eventId: number;
  eventTitle?: string;
  accessToken?: string | null;
  onLocationVerified?: (location: { latitude: number; longitude: number }) => void;
}

export default function GeolocationAttendance({
  eventId,
  eventTitle,
  accessToken,
  onLocationVerified,
}: GeolocationAttendanceProps) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'verified' | 'failed'>('idle');
  const [distance, setDistance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eventLocation, setEventLocation] = useState<{
    latitude: number;
    longitude: number;
    radius: number;
    address: string;
  } | null>(null);

  // Fetch event location on mount
  useEffect(() => {
    const fetchEventLocation = async () => {
      try {
        let response;
        if (accessToken) {
          response = await fetchAuth(`/api/postgre/events/${eventId}`, accessToken, {
            method: 'GET',
          });
        } else {
          response = await fetch(`/api/postgre/events/${eventId}`);
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch event: ${response.status}`);
        }
        
        const result = await response.json();
        const event = result.data;
        
        if (event && event.locationLatitude && event.locationLongitude) {
          setEventLocation({
            latitude: event.locationLatitude,
            longitude: event.locationLongitude,
            radius: event.locationRadius || 100,
            address: event.location,
          });
          console.log('✅ Event location loaded:', {
            lat: event.locationLatitude,
            lng: event.locationLongitude,
            radius: event.locationRadius || 100,
          });
        } else {
          // Default location if not set
          setEventLocation({
            latitude: 14.5995, // Manila, Philippines
            longitude: 120.9842,
            radius: 100,
            address: event.location || 'TBD',
          });
          toast.warning('Event location coordinates not set. Using default location.');
        }
      } catch (error) {
        console.error('❌ Error fetching event location:', error);
        setError(`Failed to load event location: ${error instanceof Error ? error.message : 'Unknown error'}`);
        toast.error('Failed to load event location. Please check your connection.');
      }
    };
    
    fetchEventLocation();
  }, [eventId, accessToken]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const getCurrentLocation = () => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          let errorMessage = 'Unable to retrieve your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const verifyLocation = async () => {
    if (!eventLocation) {
      toast.error('Event location not configured');
      return;
    }

    try {
      setLoading(true);
      setLocationStatus('checking');
      setError(null);

      toast.info('Getting your location...');
      const position = await getCurrentLocation();

      const userLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setLocation(userLocation);

      // Calculate distance from allowed location
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        eventLocation.latitude,
        eventLocation.longitude
      );

      setDistance(dist);

      // Check if within radius
      if (dist <= eventLocation.radius) {
        setLocationStatus('verified');
        toast.success(`Location verified! You are ${Math.round(dist)}m from the event location.`);
        
        if (onLocationVerified) {
          onLocationVerified(userLocation);
        }
      } else {
        setLocationStatus('failed');
        toast.error(
          `You are ${Math.round(dist)}m away. You must be within ${eventLocation.radius}m to mark attendance.`
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      setLocationStatus('failed');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (locationStatus) {
      case 'checking':
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Checking Location...
          </Badge>
        );
      case 'verified':
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Location Verified
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Verification Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Verification
            </CardTitle>
            <CardDescription>
              {eventTitle
                ? `Verify your location for ${eventTitle}`
                : 'Verify you are at the event location'}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Info */}
        {location && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Location:</span>
              <span className="font-mono">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </span>
            </div>
            {distance !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance from Event:</span>
                <span className={distance <= (eventLocation?.radius || 100) ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {Math.round(distance)}m {distance <= (eventLocation?.radius || 100) && '✓'}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Required Radius:</span>
              <span>{eventLocation?.radius || 100}m</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={verifyLocation}
          disabled={loading || locationStatus === 'verified'}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying Location...
            </>
          ) : locationStatus === 'verified' ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Location Verified
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Verify My Location
            </>
          )}
        </Button>

        {/* Info Note */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>ℹ️ This feature requires location permission.</p>
          <p>🔒 Your location is only used for attendance verification.</p>
          <p>📍 You must be within {eventLocation?.radius || 100}m of the event location.</p>
          {eventLocation && eventLocation.address && (
            <p>📍 Event location: {eventLocation.address}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
