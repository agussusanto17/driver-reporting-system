"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ReportHistoryPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }

  if (!session) redirect("/login");

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-lg font-bold text-[var(--color-gray-dark)]">
          Riwayat Laporan
        </h1>
      </header>

      <div className="bg-[var(--color-gray-light)] rounded-lg p-8 text-center">
        <p className="text-[var(--color-gray-med)]">
          List riwayat laporan akan diimplementasikan di sini.
        </p>
      </div>
    </div>
  );
}
