"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { LayoutDashboard, Filter, Download, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-gray-200 border-t-accent" />
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard size={20} strokeWidth={1.5} className="text-accent" />
            <h1 className="text-xl font-bold text-gray-900">Dashboard Monitoring</h1>
          </div>
          <p className="text-sm text-gray-600">Selamat datang, {session.user.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-9 px-4 bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter size={15} strokeWidth={1.5} />
            Filter
          </button>
          <button className="flex items-center gap-2 h-9 px-4 bg-accent text-white text-sm font-semibold hover:bg-accent-600 transition-colors">
            <Download size={15} strokeWidth={1.5} />
            Export Excel
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Laporan", value: "—", color: "text-gray-900" },
          { label: "Laporan Hari Ini", value: "—", color: "text-accent" },
          { label: "Driver Aktif", value: "—", color: "text-success" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200 px-5 py-4">
            <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Laporan Terbaru</h2>
          <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <RefreshCw size={13} strokeWidth={1.5} />
            Auto-refresh
          </button>
        </div>
        <div className="p-10 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 bg-gray-100 flex items-center justify-center">
            <LayoutDashboard size={24} strokeWidth={1.5} className="text-gray-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Feed real-time</p>
            <p className="text-xs text-gray-400 mt-1">Laporan masuk akan tampil di sini · Peta · Filter · Export Excel</p>
          </div>
        </div>
      </div>
    </div>
  );
}
