"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock, Package, PackageCheck, ChevronRight,
  Loader2, MapPin, AlertTriangle,
} from "lucide-react";
import type { ReportSummary, ReportsResponse } from "@/types";

function photoUrl(filePath: string) {
  const rel = filePath.replace(/\\/g, "/").replace(/^.*\/uploads/, "/uploads");
  return `/api/uploads${rel.replace("/uploads", "")}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Skeleton card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 shadow-sm p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 w-20" />
          <div className="h-3 bg-gray-200 w-40" />
          <div className="h-3 bg-gray-200 w-32" />
        </div>
      </div>
    </div>
  );
}

// ── Report card ────────────────────────────────────────────────────────────────
function ReportCard({ report }: { report: ReportSummary }) {
  const isPickup = report.reportType === "PICKUP";
  const thumb = report.photos[0];

  return (
    <Link href={`/report/history/${report.id}`}>
      <div className="bg-white border border-gray-200 shadow-sm hover:border-accent transition-colors">
        <div className="flex items-stretch">
          {/* Left accent bar */}
          <div className={`w-1 shrink-0 ${isPickup ? "bg-info" : "bg-success"}`} />

          {/* Thumbnail */}
          <div className="w-16 h-16 shrink-0 bg-gray-100 self-center ml-3 my-3 overflow-hidden">
            {thumb ? (
              <img
                src={photoUrl(thumb.filePath)}
                alt="foto"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {isPickup
                  ? <Package size={22} strokeWidth={1.5} className="text-gray-300" />
                  : <PackageCheck size={22} strokeWidth={1.5} className="text-gray-300" />
                }
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 px-3 py-3 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`text-[10px] font-semibold px-2 py-0.5 ${
                isPickup ? "bg-blue-50 text-info" : "bg-green-50 text-success"
              }`}>
                {isPickup ? "PICKUP" : "DROP"}
              </span>
              <span className="text-[10px] text-gray-400 shrink-0">
                {formatDate(report.createdAt)}
              </span>
            </div>

            <p className="text-sm font-semibold text-gray-900 truncate">
              {report.originCity} → {report.destinationCity}
            </p>

            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={10} strokeWidth={1.5} className="text-gray-400 shrink-0" />
              <p className="text-xs text-gray-400 truncate">
                {report.locationName ?? `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center pr-3">
            <ChevronRight size={16} strokeWidth={1.5} className="text-gray-300" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ReportHistoryPage() {
  const { data: session, status: authStatus } = useSession();

  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const LIMIT = 20;

  async function fetchReports(p: number, append = false) {
    try {
      const res = await fetch(`/api/reports?page=${p}&limit=${LIMIT}`);
      if (!res.ok) throw new Error("Gagal memuat laporan");
      const data: ReportsResponse = await res.json();
      setReports((prev) => append ? [...prev, ...data.reports] : data.reports);
      setTotal(data.total);
    } catch {
      setError("Gagal memuat laporan. Coba lagi.");
    }
  }

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchReports(1).finally(() => setLoading(false));
    }
  }, [authStatus]);

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    await fetchReports(next, true);
    setPage(next);
    setLoadingMore(false);
  };

  if (authStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!session) redirect("/login");

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">

      {/* ── Header ── */}
      <header className="bg-primary px-4 pt-10 pb-5">
        <h1 className="text-white font-bold text-lg">Riwayat Laporan</h1>
        <p className="text-white/60 text-xs mt-0.5">
          {total > 0 ? `${total} laporan tercatat` : "Semua laporan yang pernah dikirim"}
        </p>
      </header>

      <div className="flex-1 px-4 py-4 space-y-2">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-danger text-sm p-3">
            <AlertTriangle size={15} strokeWidth={1.5} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && reports.length === 0 && (
          <div className="bg-white border border-gray-200 shadow-sm p-10 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 bg-gray-100 flex items-center justify-center">
              <Clock size={28} strokeWidth={1.5} className="text-gray-300" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Belum ada laporan</p>
              <p className="text-xs text-gray-400 mt-1">
                Laporan yang kamu kirim akan muncul di sini
              </p>
            </div>
            <Link
              href="/report/new"
              className="mt-1 h-10 px-5 bg-accent text-white text-sm font-semibold flex items-center"
            >
              Buat Laporan Pertama
            </Link>
          </div>
        )}

        {/* Report list */}
        {!loading && reports.map((r) => <ReportCard key={r.id} report={r} />)}

        {/* Load more */}
        {!loading && reports.length < total && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full h-11 bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loadingMore
              ? <><Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> Memuat...</>
              : `Muat lebih banyak (${total - reports.length} tersisa)`
            }
          </button>
        )}

        <div className="h-2" />
      </div>
    </div>
  );
}
