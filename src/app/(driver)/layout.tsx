"use client";

import Providers from "@/components/Providers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, User } from "lucide-react";

const navItems = [
  { href: "/home",           icon: Home,  label: "Beranda" },
  { href: "/report/history", icon: Clock, label: "Riwayat" },
  { href: "/profile",        icon: User,  label: "Profil"  },
];

const HIDE_NAV_PATHS = ["/login", "/report/history/", "/report/new"];

function BottomNav({ pathname }: { pathname: string }) {
  const hidden = HIDE_NAV_PATHS.some((p) =>
    p.endsWith("/") ? pathname.startsWith(p) : pathname.startsWith(p)
  );
  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 bg-white border-t border-gray-200 flex items-center z-50">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== "/home" && pathname.startsWith(href + "/"));
        return (
          <Link
            key={label}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3"
          >
            <Icon size={24} strokeWidth={1.5} className={isActive ? "text-accent" : "text-gray-400"} />
            <span className={`text-[10px] font-medium ${isActive ? "text-accent" : "text-gray-400"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideNav = HIDE_NAV_PATHS.some((p) =>
    p.endsWith("/") ? pathname.startsWith(p) : pathname.startsWith(p)
  );

  return (
    <Providers>
      {/* Status bar safe-area cover — memastikan area di atas konten
          selalu biru Truckinc di iOS PWA (black-translucent status bar) */}
      <div
        className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-primary z-[9999]"
        style={{ height: "env(safe-area-inset-top, 0px)" }}
      />
      <div className={`min-h-screen max-w-md mx-auto bg-white ${hideNav ? "" : "pb-16"}`}>
        {children}
        <BottomNav pathname={pathname} />
      </div>
    </Providers>
  );
}
