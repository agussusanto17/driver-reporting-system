"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Package, PackageCheck, MapPin, RefreshCw, ChevronRight,
  Loader2, Truck, User, Clock, FileText, Filter, X,
  Map, Users, TrendingUp,
} from "lucide-react";
import type { ReportSummary, ReportsResponse } from "@/types";
import ReportDetailPanel from "@/components/admin/ReportDetailPanel";

const ReportMap = dynamic(() => import("@/components/admin/ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400 text-sm gap-2">
      <Loader2 size={16} strokeWidth={1.5} className="animate-spin" /> Memuat peta...
    </div>
  ),
});

// ── Types ──────────────────────────────────────────────────────────────────────
interface Driver { id: string; name: string; vehicle: { plateNumber: string } | null }
type TypeFilter = "ALL" | "PICKUP" | "DROP";

// ── Helpers ────────────────────────────────────────────────────────────────────
function photoUrl(filePath: string) {
  const rel = filePath.replace(/\\/g, "/").replace(/^.*\/uploads/, "/uploads");
  return `/api/uploads${rel.replace("/uploads", "")}`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}
function isNew(iso: string) {
  return Date.now() - new Date(iso).getTime() < 30 * 60 * 1000;
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent = false }: {
  label: string; value: number | string; icon: React.ReactNode; accent?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 px-5 py-4 flex items-center gap-4">
      <div className={`w-11 h-11 flex items-center justify-center shrink-0 ${accent ? "bg-accent-100" : "bg-gray-100"}`}>
        <div className={accent ? "text-accent" : "text-gray-400"}>{icon}</div>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-0.5">{label}</p>
        <p className={`text-2xl font-bold leading-none ${accent ? "text-accent" : "text-gray-900"}`}>{value}</p>
      </div>
    </div>
  );
}

// ── Report card (compact for feed) ────────────────────────────────────────────
function ReportCard({ report, onSelect }: { report: ReportSummary; onSelect: (r: ReportSummary) => void }) {
  const isPickup = report.reportType === "PICKUP";
  const thumb = report.photos[0];
  const fresh = isNew(report.createdAt);

  return (
    <button type="button" onClick={() => onSelect(report)} className="w-full text-left">
      <div className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${fresh ? "border-l-2 border-l-accent" : ""}`}>
        {/* Thumb */}
        <div className="w-14 h-14 shrink-0 bg-gray-100 overflow-hidden">
          {thumb
            ? <img src={photoUrl(thumb.filePath)} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
                {isPickup
                  ? <Package size={18} strokeWidth={1.5} className="text-gray-300" />
                  : <PackageCheck size={18} strokeWidth={1.5} className="text-gray-300" />
                }
              </div>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {fresh && <span className="text-[10px] font-bold bg-accent text-white px-1.5 py-0.5">BARU</span>}
            <span className={`text-[10px] font-bold px-2 py-0.5 ${isPickup ? "bg-blue-50 text-info" : "bg-green-50 text-success"}`}>
              {isPickup ? "PICKUP" : "DROP"}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 truncate">
            {report.originCity} → {report.destinationCity}
          </p>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
            <span className="flex items-center gap-1"><User size={11} strokeWidth={1.5} />{report.user.name}</span>
            <span className="flex items-center gap-1"><Truck size={11} strokeWidth={1.5} />{report.vehicle.plateNumber}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(report.createdAt)}</p>
        </div>

        <ChevronRight size={16} strokeWidth={1.5} className="text-gray-300 shrink-0" />
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 bg-gray-200 w-16" />
        <div className="h-3 bg-gray-200 w-32" />
        <div className="h-2.5 bg-gray-200 w-24" />
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [reports, setReports]           = useState<ReportSummary[]>([]);
  const [todayReports, setTodayReports] = useState<ReportSummary[]>([]);
  const [selected, setSelected]         = useState<ReportSummary | null>(null);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [refreshing, setRefreshing]     = useState(false);
  const [lastRefresh, setLastRefresh]   = useState<Date>(new Date());

  const [countToday, setCountToday]     = useState(0);
  const [countWeek, setCountWeek]       = useState(0);
  const [countTotal, setCountTotal]     = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);

  const [typeFilter, setTypeFilter]     = useState<TypeFilter>("ALL");
  const [driverFilter, setDriverFilter] = useState("");
  const [plateFilter, setPlateFilter]   = useState("");
  const [showFilter, setShowFilter]     = useState(false);
  const [drivers, setDrivers]           = useState<Driver[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const LIMIT = 30;

  const buildParams = useCallback((p: number) => {
    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
    if (typeFilter !== "ALL") params.set("reportType", typeFilter);
    if (driverFilter) params.set("driverId", driverFilter);
    if (plateFilter) params.set("plateNumber", plateFilter);
    return params;
  }, [typeFilter, driverFilter, plateFilter]);

  const fetchReports = useCallback(async (p: number, append = false) => {
    const res = await fetch(`/api/reports?${buildParams(p)}`);
    if (!res.ok) return;
    const data: ReportsResponse = await res.json();
    setReports((prev) => append ? [...prev, ...data.reports] : data.reports);
    setTotal(data.total);
    setLastRefresh(new Date());
  }, [buildParams]);

  const fetchStats = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const weekStart = (() => {
      const d = new Date();
      d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
      return d.toISOString().slice(0, 10);
    })();

    const [td, wk, all] = await Promise.all([
      fetch(`/api/reports?startDate=${today}&endDate=${today}&limit=100`).then(r => r.json()),
      fetch(`/api/reports?startDate=${weekStart}&limit=1`).then(r => r.json()),
      fetch(`/api/reports?limit=1`).then(r => r.json()),
    ]);

    const tdData = td as ReportsResponse;
    setCountToday(tdData.total ?? 0);
    setCountWeek((wk as ReportsResponse).total ?? 0);
    setCountTotal((all as ReportsResponse).total ?? 0);
    setTodayReports(tdData.reports ?? []);
    const uniqueDrivers = new Set(tdData.reports?.map((r: ReportSummary) => r.user.id) ?? []);
    setActiveDrivers(uniqueDrivers.size);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    Promise.all([
      fetchReports(1),
      fetchStats(),
      fetch("/api/admin/drivers").then(r => r.json()).then(setDrivers).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [status, fetchReports, fetchStats]);

  useEffect(() => {
    if (status !== "authenticated" || loading) return;
    setPage(1);
    fetchReports(1);
  }, [typeFilter, driverFilter, plateFilter]);

  useEffect(() => {
    timerRef.current = setInterval(async () => {
      setRefreshing(true);
      await Promise.all([fetchReports(1), fetchStats()]);
      setPage(1);
      setRefreshing(false);
    }, 30_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchReports, fetchStats]);

  const manualRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchReports(1), fetchStats()]);
    setPage(1);
    setRefreshing(false);
  };

  const hasFilter = typeFilter !== "ALL" || driverFilter || plateFilter;
  const clearFilters = () => { setTypeFilter("ALL"); setDriverFilter(""); setPlateFilter(""); };

  if (status === "loading") return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 size={24} className="animate-spin text-accent" />
    </div>
  );
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="h-screen flex flex-col p-5 gap-4 overflow-hidden">

      {selected && <ReportDetailPanel report={selected} onClose={() => setSelected(null)} onDelete={(id) => { setReports(prev => prev.filter(r => r.id !== id)); setTodayReports(prev => prev.filter(r => r.id !== id)); }} />}

      {/* ── Header ── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard Monitoring</h1>
          <p className="text-sm text-gray-400 mt-0.5">Selamat datang, {session.user.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilter(f => !f)}
            className={`flex items-center gap-2 h-9 px-4 border text-sm font-medium transition-colors ${
              showFilter || hasFilter
                ? "bg-primary text-white border-primary"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter size={14} strokeWidth={1.5} />
            Filter
            {hasFilter && <span className="w-4 h-4 bg-accent text-white text-[10px] font-bold flex items-center justify-center">!</span>}
          </button>
          <button
            onClick={manualRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 h-9 px-4 bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} strokeWidth={1.5} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        <StatCard label="Total Laporan"       value={countTotal}    icon={<FileText size={16} strokeWidth={1.5} />} />
        <StatCard label="Laporan Hari Ini"    value={countToday}    icon={<Clock size={16} strokeWidth={1.5} />}    accent />
        <StatCard label="Laporan Minggu Ini"  value={countWeek}     icon={<TrendingUp size={16} strokeWidth={1.5} />} />
        <StatCard label="Driver Aktif Hari Ini" value={activeDrivers} icon={<Users size={16} strokeWidth={1.5} />} />
      </div>

      {/* ── Filter panel ── */}
      {showFilter && (
        <div className="bg-white border border-gray-200 p-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Filter Laporan</p>
            {hasFilter && (
              <button onClick={clearFilters} className="text-sm text-danger flex items-center gap-1">
                <X size={13} strokeWidth={2} /> Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-500 mb-1.5">Tipe</label>
              <div className="flex gap-1">
                {(["ALL", "PICKUP", "DROP"] as TypeFilter[]).map((t) => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={`flex-1 h-9 text-sm font-semibold transition-colors ${typeFilter === t ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {t === "ALL" ? "Semua" : t === "PICKUP" ? "Pickup" : "Drop"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1.5">Driver</label>
              <select value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)}
                className="w-full h-9 px-3 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-accent bg-white">
                <option value="">Semua driver</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} — {d.vehicle?.plateNumber ?? "—"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1.5">Nopol</label>
              <input type="text" value={plateFilter} onChange={(e) => setPlateFilter(e.target.value)}
                placeholder="Cari nopol..." className="w-full h-9 px-3 border border-gray-200 text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
        </div>
      )}

      {/* ── Main 2-col layout ── */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Kiri: Peta */}
        <div className="flex flex-col flex-[3] min-h-0 bg-white border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <Map size={15} strokeWidth={1.5} className="text-accent" />
              <h2 className="text-base font-semibold text-gray-900">Peta Perjalanan Hari Ini</h2>
            </div>
            <span className="text-sm text-gray-400">{todayReports.length} titik</span>
          </div>
          <div className="flex-1 min-h-0">
            {todayReports.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                <MapPin size={28} strokeWidth={1.5} />
                <p className="text-sm">Belum ada laporan hari ini</p>
              </div>
            ) : (
              <ReportMap reports={todayReports} />
            )}
          </div>
        </div>

        {/* Kanan: Feed laporan */}
        <div className="flex flex-col flex-[2] min-h-0 bg-white border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">Laporan Masuk</h2>
              <span className="text-sm text-gray-400">{total}</span>
              {hasFilter && <span className="text-xs font-bold bg-accent/10 text-accent px-2 py-0.5">Filter</span>}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <div className={`w-1.5 h-1.5 ${refreshing ? "bg-accent animate-pulse" : "bg-success"}`} />
              {lastRefresh.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          {/* Scrollable feed */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 p-6 text-center">
                <FileText size={28} strokeWidth={1.5} />
                <p className="text-sm">{hasFilter ? "Tidak ada laporan sesuai filter" : "Belum ada laporan"}</p>
                {hasFilter && <button onClick={clearFilters} className="text-xs text-accent font-semibold">Reset filter</button>}
              </div>
            ) : (
              <>
                {reports.map((r) => <ReportCard key={r.id} report={r} onSelect={setSelected} />)}
                {reports.length < total && (
                  <div className="p-3">
                    <button onClick={async () => { setLoadingMore(true); await fetchReports(page + 1, true); setPage(p => p + 1); setLoadingMore(false); }}
                      disabled={loadingMore}
                      className="w-full h-9 bg-gray-50 border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5">
                      {loadingMore ? <><Loader2 size={12} strokeWidth={1.5} className="animate-spin" /> Memuat...</> : `${total - reports.length} laporan lagi`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
