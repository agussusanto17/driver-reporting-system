"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search, Filter, X, ChevronLeft, ChevronRight,
  Package, PackageCheck, MapPin, User, Truck,
  Loader2, FileText, Image, Download,
} from "lucide-react";
import type { ReportSummary, ReportsResponse } from "@/types";
import ReportDetailPanel from "@/components/admin/ReportDetailPanel";
import * as XLSX from "xlsx";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Driver { id: string; name: string; vehicle: { plateNumber: string } | null }
type TypeFilter = "ALL" | "PICKUP" | "DROP";

// ── Helpers ────────────────────────────────────────────────────────────────────
function photoUrl(f: string) {
  const rel = f.replace(/\\/g, "/").replace(/^.*\/uploads/, "/uploads");
  return `/api/uploads${rel.replace("/uploads", "")}`;
}
function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { data: session, status } = useSession();

  const [reports, setReports]       = useState<ReportSummary[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<ReportSummary | null>(null);

  // Filters
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [driverFilter, setDriverFilter] = useState("");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [drivers, setDrivers]       = useState<Driver[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);
  const LIMIT = 25;

  const buildParams = useCallback((p: number) => {
    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
    if (typeFilter !== "ALL") params.set("reportType", typeFilter);
    if (driverFilter) params.set("driverId", driverFilter);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    return params;
  }, [typeFilter, driverFilter, startDate, endDate]);

  const fetchReports = useCallback(async (p: number) => {
    setLoading(true);
    const res = await fetch(`/api/reports?${buildParams(p)}`);
    if (res.ok) {
      const data: ReportsResponse = await res.json();
      setReports(data.reports);
      setTotal(data.total);
    }
    setLoading(false);
  }, [buildParams]);

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch semua data sesuai filter aktif (tanpa pagination)
      const params = new URLSearchParams({ page: "1", limit: "9999" });
      if (typeFilter !== "ALL") params.set("reportType", typeFilter);
      if (driverFilter) params.set("driverId", driverFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/reports?${params}`);
      if (!res.ok) return;
      const data: ReportsResponse = await res.json();

      // Terapkan search filter jika ada
      const rows = search.trim()
        ? data.reports.filter(r => {
            const q = search.toLowerCase();
            return r.originCity.toLowerCase().includes(q) ||
              r.destinationCity.toLowerCase().includes(q) ||
              r.user.name.toLowerCase().includes(q) ||
              r.vehicle.plateNumber.toLowerCase().includes(q) ||
              (r.locationName ?? "").toLowerCase().includes(q);
          })
        : data.reports;

      // Susun data Excel
      const wsData = [
        ["No", "Tanggal", "Driver", "Nopol", "Tipe", "Asal", "Tujuan", "Latitude", "Longitude", "Lokasi", "Link Foto", "Catatan"],
        ...rows.map((r, i) => [
          i + 1,
          new Date(r.createdAt).toLocaleString("id-ID"),
          r.user.name,
          r.vehicle.plateNumber,
          r.reportType,
          r.originCity,
          r.destinationCity,
          r.latitude,
          r.longitude,
          r.locationName ?? "",
          r.photos.map(p => {
            const rel = p.filePath.replace(/\\/g, "/").replace(/^.*\/uploads/, "/uploads");
            return `${window.location.origin}/api/uploads${rel.replace("/uploads", "")}`;
          }).join(", "),
          r.notes ?? "",
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Auto column width
      const colWidths = wsData[0].map((_, ci) =>
        Math.min(50, Math.max(10, ...wsData.map(row => String(row[ci] ?? "").length)))
      );
      ws["!cols"] = colWidths.map(w => ({ wch: w }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan");

      const now = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `laporan-truckinc-${now}.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/admin/drivers").then(r => r.json()).then(setDrivers).catch(() => {});
    fetchReports(1);
  }, [status, fetchReports]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setPage(1);
    fetchReports(1);
  }, [typeFilter, driverFilter, startDate, endDate]);

  if (status === "loading") return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 size={24} className="animate-spin text-accent" />
    </div>
  );
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  // Client-side search filter
  const filtered = search.trim()
    ? reports.filter(r => {
        const q = search.toLowerCase();
        return r.originCity.toLowerCase().includes(q) ||
          r.destinationCity.toLowerCase().includes(q) ||
          r.user.name.toLowerCase().includes(q) ||
          r.vehicle.plateNumber.toLowerCase().includes(q) ||
          (r.locationName ?? "").toLowerCase().includes(q);
      })
    : reports;

  const hasFilter = typeFilter !== "ALL" || driverFilter || startDate || endDate;
  const clearFilters = () => {
    setTypeFilter("ALL"); setDriverFilter(""); setStartDate(""); setEndDate("");
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="flex flex-col h-screen p-5 gap-4 overflow-hidden">

      {/* Detail popup */}
      {selected && <ReportDetailPanel report={selected} onClose={() => setSelected(null)} onDelete={(id) => { setReports(prev => prev.filter(r => r.id !== id)); setTotal(t => t - 1); }} />}

      {/* ── Header ── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Laporan</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} total laporan</p>
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
            onClick={handleExport}
            disabled={exporting || total === 0}
            className="flex items-center gap-2 h-9 px-4 bg-accent text-white text-sm font-semibold hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting
              ? <><Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> Mengexport...</>
              : <><Download size={14} strokeWidth={1.5} /> Export Excel</>
            }
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 h-10 shrink-0">
        <Search size={15} strokeWidth={1.5} className="text-gray-400 shrink-0" />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari driver, nopol, kota asal/tujuan, lokasi..."
          className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
        />
        {search && (
          <button onClick={() => { setSearch(""); searchRef.current?.focus(); }}>
            <X size={14} strokeWidth={1.5} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* ── Filter panel ── */}
      {showFilter && (
        <div className="bg-white border border-gray-200 p-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Filter</p>
            {hasFilter && (
              <button onClick={clearFilters} className="text-sm text-danger flex items-center gap-1">
                <X size={12} strokeWidth={2} /> Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Tipe</label>
              <div className="flex gap-1">
                {(["ALL", "PICKUP", "DROP"] as TypeFilter[]).map((t) => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={`flex-1 h-9 text-xs font-semibold transition-colors ${typeFilter === t ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {t === "ALL" ? "Semua" : t === "PICKUP" ? "P" : "D"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Driver</label>
              <select value={driverFilter} onChange={e => setDriverFilter(e.target.value)}
                className="w-full h-9 px-2 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-accent bg-white">
                <option value="">Semua driver</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Dari Tanggal</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full h-9 px-2 border border-gray-200 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Sampai Tanggal</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full h-9 px-2 border border-gray-200 text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="flex-1 min-h-0 bg-white border border-gray-200 flex flex-col">
        {/* Table header */}
        <div className="grid grid-cols-[40px_1fr_140px_120px_90px_1fr_90px_40px] gap-0 border-b border-gray-200 shrink-0">
          {["No", "Rute", "Driver", "Nopol", "Tipe", "Lokasi", "Waktu", ""].map((h, i) => (
            <div key={i} className={`px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 ${i === 0 ? "text-center" : ""}`}>
              {h}
            </div>
          ))}
        </div>

        {/* Table body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-accent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <FileText size={32} strokeWidth={1.5} />
              <p className="text-sm">{search ? `Tidak ada hasil untuk "${search}"` : "Tidak ada laporan"}</p>
              {(search || hasFilter) && (
                <button onClick={() => { setSearch(""); clearFilters(); }} className="text-sm text-accent font-semibold">
                  Reset pencarian & filter
                </button>
              )}
            </div>
          ) : (
            filtered.map((r, idx) => {
              const isPickup = r.reportType === "PICKUP";
              const rowNum = (page - 1) * LIMIT + idx + 1;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="grid grid-cols-[40px_1fr_140px_120px_90px_1fr_90px_40px] gap-0 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="px-3 py-3.5 text-sm text-gray-400 text-center">{rowNum}</div>
                  <div className="px-3 py-3.5 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {r.originCity} → {r.destinationCity}
                    </p>
                    {r.notes && <p className="text-xs text-gray-400 truncate mt-0.5">{r.notes}</p>}
                  </div>
                  <div className="px-3 py-3.5 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{r.user.name}</p>
                  </div>
                  <div className="px-3 py-3.5">
                    <span className="text-sm font-mono text-gray-700">{r.vehicle.plateNumber}</span>
                  </div>
                  <div className="px-3 py-3.5">
                    <span className={`text-xs font-bold px-2 py-1 ${isPickup ? "bg-blue-50 text-info" : "bg-green-50 text-success"}`}>
                      {isPickup ? "PICKUP" : "DROP"}
                    </span>
                  </div>
                  <div className="px-3 py-3.5 min-w-0">
                    <p className="text-xs text-gray-500 truncate">
                      {r.locationName ?? `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`}
                    </p>
                  </div>
                  <div className="px-3 py-3.5">
                    <p className="text-xs text-gray-500">{fmtDateShort(r.createdAt)}</p>
                  </div>
                  <div className="px-3 py-3.5 flex items-center justify-center">
                    {r.photos.length > 0 && (
                      <Image size={13} strokeWidth={1.5} className="text-gray-300" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 shrink-0">
          <p className="text-sm text-gray-500">
            {search
              ? `${filtered.length} hasil dari pencarian`
              : `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} dari ${total} laporan`
            }
          </p>
          {!search && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { const p = page - 1; setPage(p); fetchReports(p); }}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} strokeWidth={2} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => { setPage(p); fetchReports(p); }}
                    className={`w-8 h-8 text-sm font-medium border transition-colors ${
                      page === p ? "bg-primary text-white border-primary" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}>
                    {p}
                  </button>
                );
              })}
              {totalPages > 7 && <span className="text-gray-400 text-sm px-1">···</span>}
              <button
                onClick={() => { const p = page + 1; setPage(p); fetchReports(p); }}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
