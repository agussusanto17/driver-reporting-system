"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import {
  Truck, Package, PackageCheck, ChevronRight,
  AlertTriangle, Loader2, CheckCircle,
} from "lucide-react";
import { useGps } from "@/hooks/useGps";
import { GpsBanner } from "@/components/driver/GpsBanner";
import { PhotoUpload, type PhotoFile } from "@/components/driver/PhotoUpload";

// ── Success screen ─────────────────────────────────────────────────────────────
function SuccessScreen({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center">
      <div className="w-16 h-16 bg-green-50 flex items-center justify-center mb-5">
        <CheckCircle size={40} strokeWidth={1.5} className="text-success" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Laporan Terkirim!</h2>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        Data laporan, foto, dan koordinat GPS berhasil disimpan.
      </p>
      <button
        onClick={onNew}
        className="w-full h-12 bg-accent text-white font-semibold text-sm hover:bg-accent-600 transition-colors"
      >
        Buat Laporan Baru
      </button>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function NewReportPage() {
  const { data: session, status: authStatus } = useSession();
  const { status: gpsStatus, position, isBlocked: gpsBlocked } = useGps();

  // Form state
  const [reportType, setReportType] = useState<"PICKUP" | "DROP">("PICKUP");
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<PhotoFile[]>([]);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (authStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!session) redirect("/login");

  if (submitted) {
    return (
      <SuccessScreen
        onNew={() => {
          setSubmitted(false);
          setReportType("PICKUP");
          setOriginCity("");
          setDestinationCity("");
          setNotes("");
          setPhotos([]);
          setError("");
        }}
      />
    );
  }

  const canSubmit =
    !gpsBlocked &&
    !submitting &&
    photos.length > 0 &&
    originCity.trim().length > 0 &&
    destinationCity.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !position) return;

    if (!session.user.vehicleId) {
      setError("Akun Anda belum memiliki kendaraan. Hubungi admin.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("reportType", reportType);
      fd.append("originCity", originCity.trim());
      fd.append("destinationCity", destinationCity.trim());
      fd.append("vehicleId", session.user.vehicleId);
      fd.append("latitude", String(position.lat));
      fd.append("longitude", String(position.lng));
      fd.append("locationName", position.locationName);
      fd.append("accuracy", String(position.accuracy));
      if (notes.trim()) fd.append("notes", notes.trim());
      photos.forEach((p) => fd.append("photos", p.file));

      const res = await fetch("/api/reports", { method: "POST", body: fd });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal mengirim laporan");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">

      {/* ── Header ── */}
      <header className="bg-primary px-4 pt-10 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs font-medium mb-0.5">Selamat datang</p>
            <h1 className="text-white font-bold text-lg leading-tight">{session.user.name}</h1>
          </div>
          <div className="flex items-center gap-2 bg-primary-600 px-3 py-1.5">
            <Truck size={14} strokeWidth={1.5} className="text-accent" />
            <span className="text-white text-xs font-semibold">
              {session.user.plateNumber ?? "—"}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-5 space-y-4">

        {/* ── GPS Banner ── */}
        <GpsBanner status={gpsStatus} position={position} />

        {/* ── Tipe Laporan ── */}
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
          <p className="px-4 pt-4 pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Tipe Laporan
          </p>
          <div className="flex border-t border-gray-200">
            <button
              type="button"
              onClick={() => setReportType("PICKUP")}
              className={`flex-1 flex items-center justify-center gap-2 h-14 text-sm font-semibold transition-colors ${
                reportType === "PICKUP"
                  ? "bg-info text-white"
                  : "bg-white text-gray-400 hover:bg-gray-50"
              }`}
            >
              <Package size={18} strokeWidth={1.5} />
              Pickup
            </button>
            <div className="w-px bg-gray-200" />
            <button
              type="button"
              onClick={() => setReportType("DROP")}
              className={`flex-1 flex items-center justify-center gap-2 h-14 text-sm font-semibold transition-colors ${
                reportType === "DROP"
                  ? "bg-success text-white"
                  : "bg-white text-gray-400 hover:bg-gray-50"
              }`}
            >
              <PackageCheck size={18} strokeWidth={1.5} />
              Drop
            </button>
          </div>
        </div>

        {/* ── Rute ── */}
        <div className="bg-white border border-gray-200 shadow-sm">
          <p className="px-4 pt-4 pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Rute Pengiriman
          </p>
          <div className="px-4 pb-4 border-t border-gray-200 pt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Kota Asal <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                placeholder="Contoh: Surabaya"
                className="w-full h-11 px-3 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <div className="flex-1 h-px bg-gray-200" />
              <ChevronRight size={14} strokeWidth={1.5} className="text-gray-400" />
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Kota Tujuan <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                placeholder="Contoh: Semarang"
                className="w-full h-11 px-3 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ── Foto Muatan ── */}
        <div className="bg-white border border-gray-200 shadow-sm">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Foto Muatan <span className="text-danger font-normal normal-case text-xs">* wajib</span>
            </p>
            <span className="text-xs text-gray-400">{photos.length} / 5</span>
          </div>
          <div className="px-4 pb-4 border-t border-gray-200 pt-4">
            <PhotoUpload photos={photos} onChange={setPhotos} maxPhotos={5} />
          </div>
        </div>

        {/* ── Catatan ── */}
        <div className="bg-white border border-gray-200 shadow-sm">
          <p className="px-4 pt-4 pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Catatan{" "}
            <span className="font-normal normal-case text-gray-400">(opsional)</span>
          </p>
          <div className="px-4 pb-4 border-t border-gray-200 pt-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan jika diperlukan..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-danger text-sm p-3">
            <AlertTriangle size={16} strokeWidth={1.5} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Submit ── */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full h-12 bg-accent text-white font-semibold text-sm hover:bg-accent-600 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              Mengirim laporan...
            </span>
          ) : gpsStatus === "denied" ? (
            "GPS tidak aktif — Aktifkan GPS dulu"
          ) : gpsStatus === "loading" ? (
            "Mendapatkan lokasi GPS..."
          ) : (
            "Kirim Laporan"
          )}
        </button>

        <div className="h-2" />
      </div>
    </div>
  );
}
