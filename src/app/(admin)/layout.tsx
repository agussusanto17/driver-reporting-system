"use client";

import Providers from "@/components/Providers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, Truck, Users, LogOut,
  FileText, ShieldCheck, Menu, X,
} from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Dashboard"  },
  { href: "/dashboard/reports",  icon: FileText,        label: "Laporan"    },
  { href: "/dashboard/vehicles", icon: Truck,           label: "Kendaraan"  },
  { href: "/dashboard/drivers",  icon: Users,           label: "Driver"     },
  { href: "/dashboard/admins",   icon: ShieldCheck,     label: "Admin"      },
];

function NavItems({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = href === "/dashboard"
          ? pathname === href
          : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNav}
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
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Tutup sidebar saat navigasi
  useEffect(() => { setOpen(false); }, [pathname]);

  // Kunci scroll body saat sidebar mobile terbuka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const currentPage = navItems.find((n) =>
    n.href === "/dashboard" ? pathname === n.href : pathname.startsWith(n.href)
  );

  return (
    <Providers>
      <div className="min-h-screen bg-white">

        {/* ── Desktop sidebar (hidden on mobile via CSS) ── */}
        <aside className="hidden lg:flex fixed top-0 left-0 h-full w-60 bg-primary flex-col z-40">
          <div className="px-6 py-5 border-b border-primary-400/30">
            <Image src="/images/truckinc-logo-white.svg" alt="Truckinc" width={120} height={32} className="h-8 w-auto" />
            <p className="text-white/40 text-[10px] mt-1.5">Admin Panel</p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            <NavItems />
          </nav>
          <div className="px-3 py-4 border-t border-primary-400/30">
            <button onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-white/70 hover:text-white hover:bg-primary-600/50 transition-colors">
              <LogOut size={18} strokeWidth={1.5} />
              Keluar
            </button>
          </div>
        </aside>

        {/* ── Mobile sidebar overlay ── */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-2000 flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />

            {/* Drawer */}
            <aside className="relative w-72 max-w-[85vw] bg-primary h-full flex flex-col z-2001">
              <div className="px-6 py-5 border-b border-primary-400/30 flex items-center justify-between">
                <div>
                  <Image src="/images/truckinc-logo-white.svg" alt="Truckinc" width={110} height={30} className="h-7 w-auto" />
                  <p className="text-white/40 text-[10px] mt-1">Admin Panel</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <NavItems onNav={() => setOpen(false)} />
              </nav>
              <div className="px-3 py-4 border-t border-primary-400/30">
                <button onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-white/70 hover:text-white hover:bg-primary-600/50 transition-colors">
                  <LogOut size={18} strokeWidth={1.5} />
                  Keluar
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* ── Main content ── */}
        <div className="lg:ml-60 flex flex-col min-h-screen">

          {/* Mobile top bar */}
          <header className="lg:hidden sticky top-0 z-1500 bg-primary flex items-center gap-3 px-4 h-14 shrink-0">
            <button onClick={() => setOpen(true)} className="text-white/80 hover:text-white">
              <Menu size={22} strokeWidth={1.5} />
            </button>
            <Image src="/images/truckinc-logo-white.svg" alt="Truckinc" width={100} height={28} className="h-7 w-auto" />
            {currentPage && (
              <span className="text-white/60 text-sm ml-auto truncate">{currentPage.label}</span>
            )}
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
