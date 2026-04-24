"use client";

import { MapPin, MapPinOff, AlertTriangle, Loader2 } from "lucide-react";
import type { GpsStatus, GpsPosition } from "@/hooks/useGps";

interface GpsBannerProps {
  status: GpsStatus;
  position: GpsPosition | null;
}

export function GpsBanner({ status, position }: GpsBannerProps) {
  if (status === "loading") {
    return (
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 text-info text-sm">
        <Loader2 size={16} strokeWidth={1.5} className="animate-spin shrink-0" />
        <span className="font-medium">Mendapatkan lokasi GPS...</span>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 text-danger text-sm">
        <MapPinOff size={16} strokeWidth={1.5} className="shrink-0" />
        <span className="font-medium">
          GPS tidak aktif — Aktifkan lokasi di pengaturan HP Anda
        </span>
      </div>
    );
  }

  const isLow = status === "low-accuracy";

  return (
    <div className="space-y-0">
      <div
        className={`flex items-center gap-3 p-3 text-sm border ${
          isLow
            ? "bg-yellow-50 border-yellow-100 text-warning"
            : "bg-green-50 border-green-100 text-success"
        }`}
      >
        {isLow ? (
          <AlertTriangle size={16} strokeWidth={1.5} className="shrink-0" />
        ) : (
          <MapPin size={16} strokeWidth={1.5} className="shrink-0" />
        )}
        <span className="font-medium">
          {isLow
            ? `Akurasi GPS rendah (±${Math.round(position?.accuracy ?? 0)}m) — laporan tetap bisa dikirim`
            : `GPS aktif (±${Math.round(position?.accuracy ?? 0)}m)`}
        </span>
      </div>
      {position && (
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-t-0 border-gray-200 text-xs text-gray-500">
          <MapPin size={11} strokeWidth={1.5} className="shrink-0" />
          <span className="truncate">{position.locationName}</span>
        </div>
      )}
    </div>
  );
}
