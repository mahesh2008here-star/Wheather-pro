/**
 * Multi-Tier Universal Location Detector Service
 * Tier 1: HTML5 High-Accuracy GPS Geolocation with permission check
 * Tier 2: Free IP-Based Geolocation Fallback (ipapi.co / ip-api.com)
 * Tier 3: Default Location Fallback
 */

import { LocationInfo } from '../types/weather';
import { reverseGeocode } from './weatherApi';
import { DEFAULT_LOCATIONS } from '../config/env';

/**
 * Get current user location using GPS Geolocation or IP Geolocation
 */
export async function detectUserLocation(): Promise<LocationInfo> {
  // Tier 1: Attempt HTML5 GPS Geolocation
  if (typeof window !== 'undefined' && navigator.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;
      const loc = await reverseGeocode(latitude, longitude);
      return loc;
    } catch (gpsErr) {
      console.warn('GPS Geolocation unavailable or permission denied, using IP fallback:', gpsErr);
    }
  }

  // Tier 2: Attempt Free IP-based Geolocation (ipapi.co)
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          id: `ip_loc_${Date.now()}`,
          name: data.city || data.region || 'Detected Location',
          region: data.region || '',
          country: data.country_name || '',
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          isCurrent: true,
        };
      }
    }
  } catch (ipErr) {
    console.warn('IP Geolocation tier 1 error:', ipErr);
  }

  // Tier 2b: Secondary IP Geolocation service (ip-api.com)
  try {
    const res2 = await fetch('http://ip-api.com/json/');
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.lat && data2.lon) {
        return {
          id: `ip_loc2_${Date.now()}`,
          name: data2.city || data2.regionName || 'Detected Location',
          region: data2.regionName || '',
          country: data2.country || '',
          latitude: Number(data2.lat),
          longitude: Number(data2.lon),
          isCurrent: true,
        };
      }
    }
  } catch (ipErr2) {
    console.warn('IP Geolocation tier 2 error:', ipErr2);
  }

  // Tier 3: Fallback default
  return DEFAULT_LOCATIONS[0];
}
