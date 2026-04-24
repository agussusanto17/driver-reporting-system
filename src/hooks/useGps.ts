"use client";

import { useEffect, useRef, useState } from "react";

export type GpsStatus = "loading" | "active" | "low-accuracy" | "denied";

export interface GpsPosition {
  lat: number;
  lng: number;
  accuracy: number;
  locationName: string;
}

export function useGps() {
  const [status, setStatus] = useState<GpsStatus>("loading");
  const [position, setPosition] = useState<GpsPosition | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const geocodingRef = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }

    async function reverseGeocode(lat: number, lng: number): Promise<string> {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { "Accept-Language": "id" } }
        );
        const data = await res.json();
        if (data.display_name) {
          return data.display_name.split(",").slice(0, 3).join(",").trim();
        }
      } catch {}
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setStatus(accuracy <= 100 ? "active" : "low-accuracy");

        // Only re-geocode if not already fetching
        if (!geocodingRef.current) {
          geocodingRef.current = true;
          const locationName = await reverseGeocode(latitude, longitude);
          geocodingRef.current = false;
          setPosition({ lat: latitude, lng: longitude, accuracy, locationName });
        } else {
          setPosition((prev) =>
            prev ? { ...prev, lat: latitude, lng: longitude, accuracy } : null
          );
        }
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const isBlocked = status === "loading" || status === "denied";

  return { status, position, isBlocked };
}
