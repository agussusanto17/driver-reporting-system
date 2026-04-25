"use client";

import Providers from "@/components/Providers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Truck, Users, LogOut, FileText } from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/reports",  icon: FileText,        label: "Laporan"    },
  { href: "/dashboard/vehicles", icon: Truck,           label: "Kendaraan"  },
  { href: "/dashboard/drivers", icon: Users, label: "Driver" },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-primary flex flex-col z-40">
      <div className="px-6 py-5 border-b border-primary-400/30">
        <div className="flex items-center gap-3">
          <Image
            src="/images/truckinc-logo-white.svg"
            alt="Truckinc"
            width={120}
            height={32}
            className="h-8 w-auto"
          />
        </div>
        <p className="text-white/40 text-[10px] mt-1.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-600 text-white border-l-[3px] border-accent pl-2.25"
                  : "text-white/70 hover:text-white hover:bg-primary-600/50"
              }`}
            >
              <Icon size={18} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-primary-400/30">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-white/70 hover:text-white hover:bg-primary-600/50 transition-colors"
        >
          <LogOut size={18} strokeWidth={1.5} />
          Keluar
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-white flex">
        <Sidebar />
        <main className="flex-1 ml-60 min-h-screen">{children}</main>
      </div>
    </Providers>
  );
}
