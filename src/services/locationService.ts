/**
 * Genuine Device Location Service
 * Multi-Platform support:
 * 1. Capacitor Geolocation (Native Android / iOS via FusedLocationProviderClient)
 * 2. W3C Geolocation API (Modern Mobile Web / Desktop HTTPS)
 * 
 * Strict Guarantees:
 * - NO fake/hardcoded city fallbacks (Karwar, San Francisco, etc.)
 * - NO IP-based geolocation masquerading as GPS
 * - Real GPS coordinates reverse-geocoded to locality/region/country
 * - Foreground location only
 * - Clear diagnostics for permission denied, timeout, and disabled location services
 */

import { Capacitor } from '@capacitor/core';
import { Geolocation, Position, PermissionStatus as CapPermissionStatus } from '@capacitor/geolocation';
import { LocationInfo } from '../types/weather';
import { reverseGeocode } from './weatherApi';

export interface LocationDetectionResult {
  location: LocationInfo;
  accuracyMeters: number;
  isApproximate: boolean;
}

export type LocationPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export class LocationServiceError extends Error {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED' | 'NETWORK_ERROR';
  isPermanentDenial: boolean;

  constructor(
    code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED' | 'NETWORK_ERROR',
    message: string,
    isPermanentDenial = false
  ) {
    super(message);
    this.name = 'LocationServiceError';
    this.code = code;
    this.isPermanentDenial = isPermanentDenial;
  }
}

/**
 * Check existing permission status without triggering a prompt
 */
export async function checkLocationPermission(): Promise<LocationPermissionState> {
  // 1. Capacitor Native check
  if (Capacitor.isNativePlatform()) {
    try {
      const status: CapPermissionStatus = await Geolocation.checkPermissions();
      if (status.location === 'granted') return 'granted';
      if (status.location === 'denied') return 'denied';
      return 'prompt';
    } catch {
      // Fall through to browser permissions if Capacitor plugin fails
    }
  }

  // 2. Browser Permissions API
  if (typeof navigator !== 'undefined' && 'permissions' in navigator && navigator.permissions?.query) {
    try {
      const perm = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      if (perm.state === 'granted') return 'granted';
      if (perm.state === 'denied') return 'denied';
      return 'prompt';
    } catch {
      // Some browsers don't support geolocation in permissions.query
    }
  }

  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    return 'prompt';
  }

  return 'unsupported';
}

/**
 * Request location permission explicitly
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await Geolocation.requestPermissions({
        permissions: ['location']
      });
      return res.location === 'granted';
    } catch (e) {
      console.warn('Capacitor permission request failed:', e);
    }
  }

  // For web, requesting permission is implicitly triggered by the first getCurrentPosition call.
  return true;
}

/**
 * Retrieve fresh, accurate GPS position from device
 */
async function getDevicePosition(timeoutMs = 12000): Promise<{ lat: number; lon: number; accuracy: number }> {
  // Check if geolocation is supported
  const isCapacitor = Capacitor.isNativePlatform();
  const hasWebGeo = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  if (!isCapacitor && !hasWebGeo) {
    throw new LocationServiceError(
      'UNSUPPORTED',
      'Geolocation is not supported by this device or browser.'
    );
  }

  // Helper for Capacitor Geolocation
  if (isCapacitor) {
    try {
      const capPos: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0, // Enforce fresh fix, never use stale cached position
      });

      return {
        lat: capPos.coords.latitude,
        lon: capPos.coords.longitude,
        accuracy: capPos.coords.accuracy,
      };
    } catch (capErr: any) {
      const msg = capErr?.message?.toLowerCase() || '';
      if (msg.includes('denied') || msg.includes('permission')) {
        throw new LocationServiceError(
          'PERMISSION_DENIED',
          'Location permission was denied. Please allow location access in Android app settings.',
          true
        );
      }
      if (msg.includes('disabled') || msg.includes('provider') || msg.includes('services')) {
        throw new LocationServiceError(
          'POSITION_UNAVAILABLE',
          'Device location service (GPS) is turned off. Please turn on Location in Android settings.'
        );
      }
      // If native high-accuracy timed out, retry with normal accuracy
      try {
        const fallbackPos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 0,
        });
        return {
          lat: fallbackPos.coords.latitude,
          lon: fallbackPos.coords.longitude,
          accuracy: fallbackPos.coords.accuracy,
        };
      } catch {
        // Fall back to web geolocation below
      }
    }
  }

  // W3C Geolocation implementation with fallback ladder
  return new Promise<{ lat: number; lon: number; accuracy: number }>((resolve, reject) => {
    let resolved = false;

    // First attempt: High accuracy (GPS / Fine Location)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (resolved) return;
        resolved = true;
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        if (resolved) return;

        // If permission denied, fail immediately with clear instructions
        if (err.code === err.PERMISSION_DENIED) {
          resolved = true;
          reject(new LocationServiceError(
            'PERMISSION_DENIED',
            'Location access was denied. Please enable location permissions in your browser or device settings, or search for your city manually.',
            true
          ));
          return;
        }

        // If timeout or position unavailable on high accuracy, retry once with coarse/approximate
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            if (resolved) return;
            resolved = true;
            resolve({
              lat: fallbackPos.coords.latitude,
              lon: fallbackPos.coords.longitude,
              accuracy: fallbackPos.coords.accuracy,
            });
          },
          (fallbackErr) => {
            if (resolved) return;
            resolved = true;
            if (fallbackErr.code === fallbackErr.PERMISSION_DENIED) {
              reject(new LocationServiceError(
                'PERMISSION_DENIED',
                'Location access was denied. Please allow location access to load local weather.',
                true
              ));
            } else if (fallbackErr.code === fallbackErr.TIMEOUT) {
              reject(new LocationServiceError(
                'TIMEOUT',
                'GPS location request timed out. Please check your signal and try again.'
              ));
            } else {
              reject(new LocationServiceError(
                'POSITION_UNAVAILABLE',
                'Location telemetry unavailable. Please check that GPS/Location is turned on.'
              ));
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 0,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0, // Never accept stale cached location
      }
    );
  });
}

/**
 * Detect user's genuine current location using device GPS/FusedLocation.
 * Throws LocationServiceError if retrieval fails.
 * NEVER returns hardcoded fallbacks (Karwar, San Francisco, etc.) as current location!
 */
export async function detectUserLocation(): Promise<LocationDetectionResult> {
  const { lat, lon, accuracy } = await getDevicePosition();

  // Validate coordinates
  if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon) || (lat === 0 && lon === 0)) {
    throw new LocationServiceError(
      'POSITION_UNAVAILABLE',
      'Device returned invalid GPS coordinates.'
    );
  }

  // Reject excessively inaccurate fixes (> 50,000 meters)
  if (accuracy > 50000) {
    throw new LocationServiceError(
      'POSITION_UNAVAILABLE',
      'GPS position fix accuracy is too low. Please move to an area with clear sky view.'
    );
  }

  const isApproximate = accuracy > 2000;

  // Real reverse geocode of genuine device coordinates
  const locationInfo = await reverseGeocode(lat, lon);
  locationInfo.isCurrent = true;

  return {
    location: locationInfo,
    accuracyMeters: Math.round(accuracy),
    isApproximate,
  };
}
