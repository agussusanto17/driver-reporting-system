"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck, PlusCircle, Package, PackageCheck,
  MapPin, ChevronRight, Loader2, Clock,
  CalendarCheck, CalendarDays,
} from "lucide-react";
import type { ReportSummary, ReportsResponse } from "@/types";

// ── Helpers ────────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function todayStr() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ── Recent report card ─────────────────────────────────────────────────────────
function RecentCard({ report }: { report: ReportSummary }) {
  const isPickup = report.reportType === "PICKUP";
  return (
    <Link href={`/report/history/${report.id}`}>
      <div className="group flex items-center gap-3 py-4 border-b border-gray-100 last:border-0">
        {/* Icon badge */}
        <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${
          isPickup ? "bg-blue-50" : "bg-green-50"
        }`}>
          {isPickup
            ? <Package size={18} strokeWidth={1.5} className="text-info" />
            : <PackageCheck size={18} strokeWidth={1.5} className="text-success" />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {report.originCity} → {report.destinationCity}
            </p>
            <ChevronRight size={14} strokeWidth={1.5} className="text-gray-300 shrink-0" />
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className={`font-medium ${isPickup ? "text-info" : "text-success"}`}>
              {isPickup ? "Pickup" : "Drop"}
            </span>
            <span>·</span>
            <span>{formatTime(report.createdAt)}</span>
          </div>
          {report.locationName && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={10} strokeWidth={1.5} className="text-gray-300 shrink-0" />
              <span className="text-[11px] text-gray-400 truncate">{report.locationName}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { data: session, status } = useSession();

  const [recentReports, setRecentReports] = useState<ReportSummary[]>([]);
  const [countToday, setCountToday]       = useState(0);
  const [countWeek, setCountWeek]         = useState(0);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;

    const today = new Date().toISOString().slice(0, 10);
    const weekStart = (() => {
      const d = new Date();
      const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
      d.setDate(d.getDate() - day);
      return d.toISOString().slice(0, 10);
    })();

    Promise.all([
      fetch("/api/reports?limit=3").then((r) => r.ok ? r.json() : null),
      fetch(`/api/reports?startDate=${today}&endDate=${today}&limit=1`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/reports?startDate=${weekStart}&limit=1`).then((r) => r.ok ? r.json() : null),
    ]).then(([recent, td, wk]) => {
      setRecentReports((recent as ReportsResponse)?.reports ?? []);
      setCountToday((td as ReportsResponse)?.total ?? 0);
      setCountWeek((wk as ReportsResponse)?.total ?? 0);
    }).finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!session) redirect("/login");

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── Hero header ── */}
      <div
        className="relative bg-primary px-5 pt-12 pb-8"
        style={{
          backgroundImage: "url('/images/bg-header.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-primary/70" />

        <div className="relative z-10">
        {/* Avatar + greeting */}
        <div className="flex items-center gap-4 mb-6">
          <div className="avatar-circle w-12 h-12 bg-accent flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-base tracking-wide">
              {getInitials(session.user.name ?? "?")}
            </span>
          </div>
          <div>
            <p className="text-white/60 text-xs">{greeting()}</p>
            <p className="text-white font-bold text-lg leading-tight">{session.user.name}</p>
            <p className="text-white/40 text-[11px] mt-0.5">{todayStr()}</p>
          </div>
        </div>

        {/* Nopol badge */}
        {session.user.plateNumber && (
          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 w-fit mb-6">
            <Truck size={13} strokeWidth={1.5} className="text-accent" />
            <span className="text-white text-xs font-semibold tracking-wide">
              {session.user.plateNumber}
            </span>
          </div>
        )}

        {/* Stats row */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white/10 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-[11px] font-medium">Hari Ini</p>
              <CalendarCheck size={22} strokeWidth={1.5} className="text-accent" />
            </div>
            <p className="text-white text-3xl font-bold leading-none">{countToday}</p>
            <p className="text-white/70 text-[10px] mt-1">laporan terkirim</p>
          </div>
          <div className="flex-1 bg-white/10 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-[11px] font-medium">Minggu Ini</p>
              <CalendarDays size={22} strokeWidth={1.5} className="text-accent" />
            </div>
            <p className="text-white text-3xl font-bold leading-none">{countWeek}</p>
            <p className="text-white/70 text-[10px] mt-1">laporan terkirim</p>
          </div>
        </div>
        </div>{/* end z-10 */}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 px-4 py-5 space-y-4">

        {/* CTA */}
        <Link href="/report/new">
          <div className="bg-accent px-5 py-5 flex items-center justify-between hover:bg-accent-600 transition-colors">
            <div>
              <p className="text-white font-bold text-base mb-0.5">Buat Laporan</p>
              <p className="text-white/70 text-xs">Pickup atau drop muatan</p>
            </div>
            <div className="w-11 h-11 bg-white/20 flex items-center justify-center">
              <PlusCircle size={24} strokeWidth={1.5} className="text-white" />
            </div>
          </div>
        </Link>

        {/* Recent reports */}
        <div className="bg-white border border-gray-200">

          {/* Section header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock size={14} strokeWidth={1.5} className="text-gray-400" />
              <p className="text-sm font-semibold text-gray-900">Laporan Terbaru</p>
            </div>
            <Link href="/report/history">
              <span className="text-xs font-semibold text-accent">Lihat semua →</span>
            </Link>
          </div>

          <div className="px-4">
            {recentReports.length === 0 ? (
              <div className="py-10 flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center mb-1">
                  <Package size={22} strokeWidth={1.5} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">Belum ada laporan</p>
                <p className="text-xs text-gray-400">Laporan yang dikirim akan muncul di sini</p>
              </div>
            ) : (
              recentReports.map((r) => <RecentCard key={r.id} report={r} />)
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
