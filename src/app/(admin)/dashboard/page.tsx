"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-gray-dark)]">
          Dashboard Monitoring
        </h1>
        <p className="text-[var(--color-gray-med)]">
          Selamat datang, {session.user.name}
        </p>
      </header>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-[var(--color-gray-med)]">
          Dashboard admin akan diimplementasikan di sini.
        </p>
        <p className="text-sm text-[var(--color-gray-med)] mt-2">
          Fitur: Feed real-time, Peta, Filter, Export Excel
        </p>
      </div>
    </div>
  );
}
