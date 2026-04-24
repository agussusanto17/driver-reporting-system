"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";

export default function ReportHistoryPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-gray-200 border-t-accent" />
      </div>
    );
  }

  if (!session) redirect("/login");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary px-4 pt-10 pb-5">
        <h1 className="text-white font-bold text-lg">Riwayat Laporan</h1>
        <p className="text-white/60 text-xs mt-0.5">Semua laporan yang pernah dikirim</p>
      </header>

      <div className="flex-1 px-4 py-6">
        <div className="bg-white border border-gray-200 shadow-sm p-8 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 bg-gray-100 flex items-center justify-center">
            <Clock size={28} strokeWidth={1.5} className="text-gray-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Belum ada laporan</p>
            <p className="text-xs text-gray-400 mt-1">Riwayat laporan akan tampil di sini</p>
          </div>
        </div>
      </div>
    </div>
  );
}
