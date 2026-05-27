import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Location {
  lat: number;
  lng: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser'); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setLocation(coords);
        setError(null);
        
        // Sync real-time location to backend
        api.patch('/technician/me/location', coords).catch(() => {
           console.warn('Silent sync failure: Failed to update live location to backend.');
        });
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, error };
};
