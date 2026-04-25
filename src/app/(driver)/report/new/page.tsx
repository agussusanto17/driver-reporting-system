"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Truck, Package, PackageCheck, ChevronRight,
  AlertTriangle, Loader2, CheckCircle, RotateCcw,
  PlusCircle, ArrowRight, ChevronDown, X, ArrowLeft,
} from "lucide-react";
import { useGps } from "@/hooks/useGps";
import { GpsBanner } from "@/components/driver/GpsBanner";
import { PhotoUpload, type PhotoFile } from "@/components/driver/PhotoUpload";
import type { ReportSummary, Vehicle } from "@/types";

type Screen = "choosing" | "form";

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

// ── Success screen ─────────────────────────────────────────────────────────────
function SuccessScreen({
  destinationCity,
  onNew,
  onContinue,
}: {
  destinationCity: string;
  onNew: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center">
      <div className="w-16 h-16 bg-green-50 flex items-center justify-center mb-5">
        <CheckCircle size={40} strokeWidth={1.5} className="text-success" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Laporan Terkirim!</h2>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        Data laporan, foto, dan koordinat GPS berhasil disimpan.
      </p>
      <div className="w-full space-y-3">
        {destinationCity && (
          <button
            onClick={onContinue}
            className="w-full h-12 bg-accent text-white font-semibold text-sm hover:bg-accent-600 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} strokeWidth={1.5} />
            Lanjutkan dari {destinationCity}
          </button>
        )}
        <button
          onClick={onNew}
          className="w-full h-12 bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle size={16} strokeWidth={1.5} />
          Laporan Baru
        </button>
      </div>
    </div>
  );
}

// ── Choosing screen ────────────────────────────────────────────────────────────
function ChoosingScreen({
  lastReport,
  onContinue,
  onNew,
}: {
  lastReport: ReportSummary;
  onContinue: () => void;
  onNew: () => void;
}) {
  const isPickup = lastReport.reportType === "PICKUP";
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-primary px-4 pt-10 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="shrink-0">
            <ArrowLeft size={20} strokeWidth={1.5} className="text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg">Buat Laporan</h1>
            <p className="text-white/60 text-xs">Pilih jenis laporan</p>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-5 space-y-3">

        {/* Lanjutkan perjalanan */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full bg-white border-2 border-accent text-left p-4 hover:bg-accent-100 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-accent uppercase tracking-wide">
                  Lanjutkan Perjalanan
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
                <span className="text-gray-500 font-normal">dari</span>
                {lastReport.destinationCity}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                <span className={`px-1.5 py-0.5 font-medium ${isPickup ? "bg-blue-50 text-info" : "bg-green-50 text-success"}`}>
                  {isPickup ? "PICKUP" : "DROP"}
                </span>
                <span>{lastReport.originCity} → {lastReport.destinationCity}</span>
                <span>·</span>
                <span>{formatDate(lastReport.createdAt)}</span>
              </div>
            </div>
            <ArrowRight size={20} strokeWidth={1.5} className="text-accent shrink-0 mt-1" />
          </div>
          <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            Kota asal akan diisi otomatis: <strong>{lastReport.destinationCity}</strong>
          </p>
        </button>

        {/* Laporan baru */}
        <button
          type="button"
          onClick={onNew}
          className="w-full bg-white border border-gray-200 text-left p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-0.5">Laporan Baru</p>
              <p className="text-xs text-gray-400">Isi kota asal dari awal</p>
            </div>
            <PlusCircle size={20} strokeWidth={1.5} className="text-gray-400 shrink-0" />
          </div>
        </button>

      </div>
    </div>
  );
}

// ── Vehicle picker modal ───────────────────────────────────────────────────────
function VehiclePicker({
  vehicles,
  selected,
  onSelect,
  onClose,
}: {
  vehicles: Vehicle[];
  selected: Vehicle | null;
  onSelect: (v: Vehicle) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/40">
      <div className="bg-white max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-900">Pilih Kendaraan</p>
          <button onClick={onClose}>
            <X size={20} strokeWidth={1.5} className="text-gray-400" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {vehicles.map((v) => {
            const isActive = selected?.id === v.id;
            return (
              <button
                key={v.id}
                onClick={() => { onSelect(v); onClose(); }}
                className={`w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-100 text-left transition-colors ${
                  isActive ? "bg-accent-100" : "hover:bg-gray-50"
                }`}
              >
                <div>
                  <p className={`text-sm font-semibold ${isActive ? "text-accent" : "text-gray-900"}`}>
                    {v.plateNumber}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{v.type}</p>
                </div>
                {isActive && (
                  <span className="text-[10px] font-bold text-accent bg-accent-100 px-2 py-0.5">
                    AKTIF
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Report form ────────────────────────────────────────────────────────────────
function ReportForm({
  session,
  initialOrigin,
  onSubmitSuccess,
  onBack,
}: {
  session: { user: { name: string; plateNumber?: string | null; vehicleId?: string | null } };
  initialOrigin: string;
  onSubmitSuccess: (destination: string) => void;
  onBack?: () => void;
}) {
  const { status: gpsStatus, position, isBlocked: gpsBlocked } = useGps();

  const [reportType, setReportType] = useState<"PICKUP" | "DROP">("PICKUP");
  const [originCity, setOriginCity] = useState(initialOrigin);
  const [destinationCity, setDestinationCity] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Vehicle state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    fetch("/api/vehicles")
      .then((r) => r.ok ? r.json() : [])
      .then((data: Vehicle[]) => {
        setVehicles(data);
        // Default: kendaraan dari profil driver
        const defaultV = data.find((v) => v.id === session.user.vehicleId) ?? data[0] ?? null;
        setSelectedVehicle(defaultV);
      })
      .catch(() => {});
  }, [session.user.vehicleId]);

  const canSubmit =
    !gpsBlocked &&
    !submitting &&
    !!selectedVehicle &&
    photos.length > 0 &&
    originCity.trim().length > 0 &&
    destinationCity.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !position) return;
    if (!selectedVehicle) {
      setError("Pilih kendaraan terlebih dahulu.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("reportType", reportType);
      fd.append("originCity", originCity.trim());
      fd.append("destinationCity", destinationCity.trim());
      fd.append("vehicleId", selectedVehicle.id);
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
      onSubmitSuccess(destinationCity.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {showPicker && (
        <VehiclePicker
          vehicles={vehicles}
          selected={selectedVehicle}
          onSelect={setSelectedVehicle}
          onClose={() => setShowPicker(false)}
        />
      )}

      <header className="sticky top-0 z-40 bg-primary px-4 pt-10 pb-5">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-white/70 text-xs mb-3">
            <ArrowLeft size={16} strokeWidth={1.5} />
            Kembali
          </button>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs font-medium mb-0.5">Selamat datang</p>
            <h1 className="text-white font-bold text-lg leading-tight">{session.user.name}</h1>
          </div>
          <button
            type="button"
            onClick={() => vehicles.length > 1 && setShowPicker(true)}
            className="flex items-center gap-1.5 bg-primary-600 px-3 py-1.5"
          >
            <Truck size={14} strokeWidth={1.5} className="text-accent" />
            <span className="text-white text-xs font-semibold">
              {selectedVehicle?.plateNumber ?? "—"}
            </span>
            {vehicles.length > 1 && (
              <ChevronDown size={12} strokeWidth={2} className="text-white/60" />
            )}
          </button>
        </div>
        {selectedVehicle && selectedVehicle.id !== session.user.vehicleId && (
          <p className="text-accent text-xs mt-2 font-medium">
            ⚠ Kendaraan diganti dari profil — {selectedVehicle.plateNumber}
          </p>
        )}
      </header>

      <div className="flex-1 px-4 py-5 space-y-4">
        <GpsBanner status={gpsStatus} position={position} />

        {/* Tipe */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          <p className="px-4 pt-4 pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Tipe Laporan
          </p>
          <div className="flex border-t border-gray-200">
            <button type="button" onClick={() => setReportType("PICKUP")}
              className={`flex-1 flex items-center justify-center gap-2 h-14 text-sm font-semibold transition-colors ${reportType === "PICKUP" ? "bg-info text-white" : "bg-white text-gray-400 hover:bg-gray-50"}`}>
              <Package size={18} strokeWidth={1.5} />
              Pickup
            </button>
            <div className="w-px bg-gray-200" />
            <button type="button" onClick={() => setReportType("DROP")}
              className={`flex-1 flex items-center justify-center gap-2 h-14 text-sm font-semibold transition-colors ${reportType === "DROP" ? "bg-success text-white" : "bg-white text-gray-400 hover:bg-gray-50"}`}>
              <PackageCheck size={18} strokeWidth={1.5} />
              Drop
            </button>
          </div>
        </div>

        {/* Rute */}
        <div className="bg-white border border-gray-200">
          <p className="px-4 pt-4 pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Rute Pengiriman
          </p>
          <div className="px-4 pb-4 border-t border-gray-200 pt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-600">
                  Kota Asal <span className="text-danger">*</span>
                </label>
                {initialOrigin && originCity === initialOrigin && (
                  <span className="text-[10px] font-medium text-accent bg-accent-100 px-2 py-0.5">
                    Auto-filled
                  </span>
                )}
              </div>
              <input
                type="text"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                placeholder="Contoh: Surabaya"
                className="w-full h-11 px-3 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex items-center gap-3">
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

        {/* Foto */}
        <div className="bg-white border border-gray-200">
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

        {/* Catatan */}
        <div className="bg-white border border-gray-200">
          <p className="px-4 pt-4 pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Catatan <span className="font-normal normal-case text-gray-400">(opsional)</span>
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

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-danger text-sm p-3">
            <AlertTriangle size={16} strokeWidth={1.5} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button type="button" onClick={handleSubmit} disabled={!canSubmit}
          className="w-full h-12 bg-accent text-white font-semibold text-sm hover:bg-accent-600 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed">
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              Mengirim laporan...
            </span>
          ) : gpsStatus === "denied" ? "GPS tidak aktif — Aktifkan GPS dulu"
            : gpsStatus === "loading" ? "Mendapatkan lokasi GPS..."
            : "Kirim Laporan"}
        </button>

        <div className="h-2" />
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function NewReportPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [screen, setScreen] = useState<Screen>("choosing");
  const [lastReport, setLastReport] = useState<ReportSummary | null>(null);
  const [loadingLast, setLoadingLast] = useState(true);
  const [initialOrigin, setInitialOrigin] = useState("");

  // Success state
  const [submitted, setSubmitted] = useState(false);
  const [lastDestination, setLastDestination] = useState("");

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/reports?limit=1")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const last = data?.reports?.[0] ?? null;
        setLastReport(last);
        // Kalau belum ada laporan sebelumnya, langsung ke form kosong
        if (!last) {
          setScreen("form");
          setInitialOrigin("");
        }
      })
      .catch(() => setScreen("form"))
      .finally(() => setLoadingLast(false));
  }, [authStatus]);

  if (authStatus === "loading" || loadingLast) {
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
        destinationCity={lastDestination}
        onContinue={() => {
          setInitialOrigin(lastDestination);
          setSubmitted(false);
          setScreen("form");
        }}
        onNew={() => {
          setInitialOrigin("");
          setSubmitted(false);
          setScreen("form");
        }}
      />
    );
  }

  if (screen === "choosing" && lastReport) {
    return (
      <ChoosingScreen
        lastReport={lastReport}
        onContinue={() => {
          setInitialOrigin(lastReport.destinationCity);
          setScreen("form");
        }}
        onNew={() => {
          setInitialOrigin("");
          setScreen("form");
        }}
      />
    );
  }

  return (
    <ReportForm
      session={session}
      initialOrigin={initialOrigin}
      onSubmitSuccess={(dest) => {
        setLastDestination(dest);
        setSubmitted(true);
      }}
      onBack={() => screen === "form" && lastReport ? setScreen("choosing") : router.back()}
    />
  );
}
