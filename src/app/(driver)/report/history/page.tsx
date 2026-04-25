"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Clock, Package, PackageCheck, ChevronRight,
  Loader2, MapPin, AlertTriangle, Search, X,
} from "lucide-react";
import type { ReportSummary, ReportsResponse } from "@/types";

type FilterType = "ALL" | "PICKUP" | "DROP";

function photoUrl(filePath: string) {
  const rel = filePath.replace(/\\/g, "/").replace(/^.*\/uploads/, "/uploads");
  return `/api/uploads${rel.replace("/uploads", "")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 p-4 animate-pulse flex items-start gap-3">
      <div className="w-16 h-16 bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-gray-200 w-16" />
        <div className="h-4 bg-gray-200 w-40" />
        <div className="h-3 bg-gray-200 w-28" />
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
      <div className="bg-white border border-gray-200 hover:border-accent transition-colors flex items-stretch">
        <div className={`w-1 shrink-0 ${isPickup ? "bg-info" : "bg-success"}`} />

        <div className="w-16 h-16 shrink-0 bg-gray-100 self-center ml-3 my-3 overflow-hidden">
          {thumb ? (
            <img src={photoUrl(thumb.filePath)} alt="foto" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {isPickup
                ? <Package size={22} strokeWidth={1.5} className="text-gray-300" />
                : <PackageCheck size={22} strokeWidth={1.5} className="text-gray-300" />
              }
            </div>
          )}
        </div>

        <div className="flex-1 px-3 py-3 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-[10px] font-semibold px-2 py-0.5 ${
              isPickup ? "bg-blue-50 text-info" : "bg-green-50 text-success"
            }`}>
              {isPickup ? "PICKUP" : "DROP"}
            </span>
            <span className="text-[10px] text-gray-400 shrink-0">{formatDate(report.createdAt)}</span>
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
    </Link>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ReportHistoryPage() {
  const { data: session, status: authStatus } = useSession();

  const [reports, setReports]       = useState<ReportSummary[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]           = useState("");

  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState<FilterType>("ALL");

  const searchRef = useRef<HTMLInputElement>(null);
  const LIMIT = 20;

  async function fetchReports(p: number, type: FilterType, append = false) {
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (type !== "ALL") params.set("reportType", type);

      const res = await fetch(`/api/reports?${params}`);
      if (!res.ok) throw new Error();
      const data: ReportsResponse = await res.json();
      setReports((prev) => append ? [...prev, ...data.reports] : data.reports);
      setTotal(data.total);
    } catch {
      setError("Gagal memuat laporan. Coba lagi.");
    }
  }

  // Fetch awal & saat filter berubah
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    setLoading(true);
    setPage(1);
    setError("");
    fetchReports(1, filter).finally(() => setLoading(false));
  }, [authStatus, filter]);

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    await fetchReports(next, filter, true);
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

  // Client-side search filter
  const filtered = search.trim()
    ? reports.filter((r) => {
        const q = search.toLowerCase();
        return (
          r.originCity.toLowerCase().includes(q) ||
          r.destinationCity.toLowerCase().includes(q)
        );
      })
    : reports;

  const filterLabels: { value: FilterType; label: string }[] = [
    { value: "ALL",    label: "Semua"  },
    { value: "PICKUP", label: "Pickup" },
    { value: "DROP",   label: "Drop"   },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-primary px-4 pt-10 pb-4">

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white px-3 h-11">
          <Search size={16} strokeWidth={1.5} className="text-gray-400 shrink-0" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kota asal atau tujuan..."
            className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => { setSearch(""); searchRef.current?.focus(); }}>
              <X size={15} strokeWidth={1.5} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mt-3">
          {filterLabels.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 h-8 text-xs font-semibold transition-colors ${
                filter === value
                  ? "bg-accent text-white"
                  : "bg-white/20 text-white/80 hover:bg-white/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 px-4 py-4 space-y-2">

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-danger text-sm p-3">
            <AlertTriangle size={15} strokeWidth={1.5} className="shrink-0" />
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white border border-gray-200 p-10 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 bg-gray-100 flex items-center justify-center">
              <Clock size={28} strokeWidth={1.5} className="text-gray-300" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {search ? "Tidak ditemukan" : "Belum ada laporan"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search
                  ? `Tidak ada laporan untuk "${search}"`
                  : "Laporan yang kamu kirim akan muncul di sini"}
              </p>
            </div>
            {!search && (
              <Link href="/report/new" className="mt-1 h-10 px-5 bg-accent text-white text-sm font-semibold flex items-center">
                Buat Laporan Pertama
              </Link>
            )}
          </div>
        )}

        {!loading && filtered.map((r) => <ReportCard key={r.id} report={r} />)}

        {!loading && !search && reports.length < total && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full h-11 bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
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
