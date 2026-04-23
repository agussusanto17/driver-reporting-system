"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function NewReportPage() {
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
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-gray-dark)]">
            Buat Laporan
          </h1>
          <p className="text-sm text-[var(--color-gray-med)]">
            {session.user.name} — {session.user.plateNumber}
          </p>
        </div>
      </header>

      <div className="bg-[var(--color-gray-light)] rounded-lg p-8 text-center">
        <p className="text-[var(--color-gray-med)]">
          Form laporan akan diimplementasikan di sini.
        </p>
        <p className="text-sm text-[var(--color-gray-med)] mt-2">
          Fitur: GPS check, upload foto, kompresi, submit
        </p>
      </div>
    </div>
  );
}
