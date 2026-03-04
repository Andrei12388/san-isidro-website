'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Save, MapPinned } from 'lucide-react';
import { toast } from 'sonner';

interface EventLocationSetterProps {
  eventId: number;
  currentLocation?: {
    address: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  };
  onLocationUpdated?: () => void;
}

export default function EventLocationSetter({
  eventId,
  currentLocation,
  onLocationUpdated,
}: EventLocationSetterProps) {
  const [address, setAddress] = useState(currentLocation?.address || '');
  const [latitude, setLatitude] = useState(currentLocation?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(currentLocation?.longitude?.toString() || '');
  const [radius, setRadius] = useState(currentLocation?.radius?.toString() || '100');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (currentLocation) {
      setAddress(currentLocation.address || '');
      setLatitude(currentLocation.latitude?.toString() || '');
      setLongitude(currentLocation.longitude?.toString() || '');
      setRadius(currentLocation.radius?.toString() || '100');
    }
  }, [currentLocation]);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    toast.info('Getting your current location...');

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        toast.success('Location coordinates captured!');
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        toast.error(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const saveLocation = async () => {
    if (!latitude || !longitude) {
      toast.error('Please set latitude and longitude coordinates');
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const rad = parseFloat(radius);

    if (isNaN(lat) || isNaN(lon) || isNaN(rad)) {
      toast.error('Invalid coordinate or radius values');
      return;
    }

    if (lat < -90 || lat > 90) {
      toast.error('Latitude must be between -90 and 90');
      return;
    }

    if (lon < -180 || lon > 180) {
      toast.error('Longitude must be between -180 and 180');
      return;
    }

    if (rad <= 0) {
      toast.error('Radius must be greater than 0');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/postgre/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: address,
          locationLatitude: lat,
          locationLongitude: lon,
          locationRadius: rad,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event location');
      }

      toast.success('Event location coordinates saved successfully!');
      if (onLocationUpdated) {
        onLocationUpdated();
      }
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location coordinates');
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = () => {
    if (latitude && longitude) {
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, '_blank');
    } else {
      toast.info('Set coordinates first to view on map');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Event Location Coordinates
        </CardTitle>
        <CardDescription>
          Set the GPS coordinates and verification radius for this event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Location Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g., Church Main Hall, Manila"
          />
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="14.599512"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="120.984222"
            />
          </div>
        </div>

        {/* Radius */}
        <div className="space-y-2">
          <Label htmlFor="radius">Verification Radius (meters)</Label>
          <Input
            id="radius"
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            placeholder="100"
          />
          <p className="text-xs text-muted-foreground">
            Users must be within this distance to mark attendance
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="flex-1"
          >
            <MapPinned className="mr-2 h-4 w-4" />
            {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={openGoogleMaps}
            disabled={!latitude || !longitude}
          >
            <MapPin className="mr-2 h-4 w-4" />
            View on Map
          </Button>
        </div>

        <Button onClick={saveLocation} disabled={loading} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Location Coordinates'}
        </Button>

        {/* Helper Info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p><strong>How to set location:</strong></p>
          <p>1. Use "Use Current Location" if you're at the event venue</p>
          <p>2. Or manually enter coordinates from Google Maps:</p>
          <p className="ml-4">• Open Google Maps → Right-click location → Copy coordinates</p>
          <p className="ml-4">• Paste into Latitude/Longitude fields</p>
          <p>3. Set radius (recommended: 50-200 meters)</p>
          <p>4. Click Save to update event</p>
        </div>
      </CardContent>
    </Card>
  );
}
