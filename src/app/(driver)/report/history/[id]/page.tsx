"use client";

import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Package, PackageCheck, MapPin,
  Truck, Clock, FileText, Loader2, AlertTriangle,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import type { ReportSummary } from "@/types";

function photoUrl(filePath: string) {
  const rel = filePath.replace(/\\/g, "/").replace(/^.*\/uploads/, "/uploads");
  return `/api/uploads${rel.replace("/uploads", "")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long", day: "2-digit",
    month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function ReportDetailPage() {
  const { data: session, status: authStatus } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetch(`/api/reports/${id}`)
        .then((r) => {
          if (!r.ok) throw new Error("Laporan tidak ditemukan");
          return r.json();
        })
        .then(setReport)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [authStatus, id]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!session) redirect("/login");

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <header className="sticky top-0 z-40 bg-primary px-4 pt-10 pb-5 flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ArrowLeft size={20} strokeWidth={1.5} className="text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">Detail Laporan</h1>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-danger text-sm p-4 w-full">
            <AlertTriangle size={16} strokeWidth={1.5} className="shrink-0 mt-0.5" />
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const isPickup = report.reportType === "PICKUP";
  const photos = report.photos;
  const mapsUrl = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-primary px-4 pt-10 pb-5 flex items-center gap-3">
        <button onClick={() => router.back()} className="shrink-0">
          <ArrowLeft size={20} strokeWidth={1.5} className="text-white" />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Detail Laporan</h1>
          <p className="text-white/60 text-xs">{formatDate(report.createdAt)}</p>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 space-y-3">

        {/* ── Badge tipe ── */}
        <div className={`flex items-center gap-2 px-4 py-3 border ${
          isPickup ? "bg-blue-50 border-blue-100" : "bg-green-50 border-green-100"
        }`}>
          {isPickup
            ? <Package size={18} strokeWidth={1.5} className="text-info" />
            : <PackageCheck size={18} strokeWidth={1.5} className="text-success" />
          }
          <span className={`font-semibold text-sm ${isPickup ? "text-info" : "text-success"}`}>
            {isPickup ? "PICKUP" : "DROP"}
          </span>
        </div>

        {/* ── Info laporan ── */}
        <div className="bg-white border border-gray-200 px-4">
          <InfoRow
            icon={<Truck size={15} strokeWidth={1.5} />}
            label="Nopol"
            value={report.vehicle.plateNumber}
          />
          <InfoRow
            icon={<Package size={15} strokeWidth={1.5} />}
            label="Rute"
            value={`${report.originCity} → ${report.destinationCity}`}
          />
          <InfoRow
            icon={<Clock size={15} strokeWidth={1.5} />}
            label="Waktu"
            value={formatDate(report.createdAt)}
          />
          <InfoRow
            icon={<MapPin size={15} strokeWidth={1.5} />}
            label="Lokasi GPS"
            value={report.locationName ?? `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}
          />
          {report.notes && (
            <InfoRow
              icon={<FileText size={15} strokeWidth={1.5} />}
              label="Catatan"
              value={report.notes}
            />
          )}
        </div>

        {/* ── Foto muatan ── */}
        {photos.length > 0 && (
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Foto Muatan</p>
              <span className="text-xs text-gray-400">{photoIndex + 1} / {photos.length}</span>
            </div>

            {/* Main photo */}
            <div className="relative aspect-video bg-gray-100">
              <img
                src={photoUrl(photos[photoIndex].filePath)}
                alt={`Foto ${photoIndex + 1}`}
                className="w-full h-full object-contain"
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setPhotoIndex((i) => Math.max(0, i - 1))}
                    disabled={photoIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronLeft size={18} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => setPhotoIndex((i) => Math.min(photos.length - 1, i + 1))}
                    disabled={photoIndex === photos.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronRight size={18} strokeWidth={2} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="flex gap-1 p-2 bg-gray-50 overflow-x-auto">
                {photos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setPhotoIndex(i)}
                    className={`shrink-0 w-14 h-14 overflow-hidden border-2 transition-colors ${
                      i === photoIndex ? "border-accent" : "border-transparent"
                    }`}
                  >
                    <img
                      src={photoUrl(p.filePath)}
                      alt={`Thumb ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Buka di Google Maps ── */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-11 bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <MapPin size={15} strokeWidth={1.5} className="text-accent" />
          Lihat Lokasi di Google Maps
        </a>

        <div className="h-2" />
      </div>
    </div>
  );
}
