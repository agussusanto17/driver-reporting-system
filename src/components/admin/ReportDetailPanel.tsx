"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Loader2 } from "lucide-react";
import type { ReportSummary } from "@/types";

const ReportMap = dynamic(() => import("@/components/admin/ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50 text-sm text-gray-400 gap-2">
      <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> Memuat peta...
    </div>
  ),
});

function photoUrl(f: string) {
  const rel = f.replace(/\\/g, "/").replace(/^.*\/uploads/, "/uploads");
  return `/api/uploads${rel.replace("/uploads", "")}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface Props {
  report: ReportSummary;
  onClose: () => void;
}

export default function ReportDetailPanel({ report, onClose }: Props) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const isPickup = report.reportType === "PICKUP";
  const photos = report.photos;

  return (
    <div className="fixed inset-0 z-2000 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative ml-auto w-full max-w-2xl bg-white h-full flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 shrink-0">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-xs font-bold px-2 py-0.5 ${isPickup ? "bg-blue-50 text-info" : "bg-green-50 text-success"}`}>
                {isPickup ? "PICKUP" : "DROP"}
              </span>
              <span className="text-xs text-gray-400">{fmtDate(report.createdAt)}</span>
            </div>
            <p className="text-base font-bold text-gray-900 truncate">
              {report.originCity} → {report.destinationCity}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Info */}
          <div className="px-5 py-4 border-b border-gray-100 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Driver</p>
              <p className="text-sm font-semibold text-gray-900">{report.user.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Nopol</p>
              <p className="text-sm font-semibold text-gray-900">{report.vehicle.plateNumber}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400 mb-0.5">Lokasi GPS</p>
              <p className="text-sm font-medium text-gray-700">
                {report.locationName ?? `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                {report.accuracy != null && ` · ±${Math.round(report.accuracy)}m`}
              </p>
            </div>
            {report.notes && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Catatan</p>
                <p className="text-sm text-gray-700">{report.notes}</p>
              </div>
            )}
          </div>

          {/* Foto */}
          {photos.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="flex items-center justify-between px-5 py-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Foto Muatan</p>
                <span className="text-xs text-gray-400">{photoIdx + 1} / {photos.length}</span>
              </div>
              <div className="relative bg-gray-100 aspect-video">
                <img
                  src={photoUrl(photos[photoIdx].filePath)}
                  alt={`Foto ${photoIdx + 1}`}
                  className="w-full h-full object-contain"
                />
                {photos.length > 1 && (
                  <>
                    <button onClick={() => setPhotoIdx(i => Math.max(0, i - 1))} disabled={photoIdx === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white flex items-center justify-center disabled:opacity-30">
                      <ChevronLeft size={18} strokeWidth={2} />
                    </button>
                    <button onClick={() => setPhotoIdx(i => Math.min(photos.length - 1, i + 1))} disabled={photoIdx === photos.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white flex items-center justify-center disabled:opacity-30">
                      <ChevronRight size={18} strokeWidth={2} />
                    </button>
                  </>
                )}
              </div>
              {photos.length > 1 && (
                <div className="flex gap-1 p-2 bg-gray-50 overflow-x-auto">
                  {photos.map((p, i) => (
                    <button key={p.id} onClick={() => setPhotoIdx(i)}
                      className={`shrink-0 w-12 h-12 overflow-hidden border-2 transition-colors ${i === photoIdx ? "border-accent" : "border-transparent"}`}>
                      <img src={photoUrl(p.filePath)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Peta */}
          <div className="border-b border-gray-100">
            <p className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              Lokasi di Peta
            </p>
            <div className="h-52">
              <ReportMap reports={[report]} />
            </div>
          </div>

          {/* Google Maps */}
          <div className="px-5 py-4">
            <a href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-10 bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <MapPin size={15} strokeWidth={1.5} className="text-accent" />
              Buka di Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
