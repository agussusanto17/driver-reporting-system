"use client";

import Providers from "@/components/Providers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Clock, User } from "lucide-react";

const navItems = [
  { href: "/home",           icon: Home,       label: "Beranda"      },
  { href: "/report/new",     icon: PlusCircle, label: "Buat Laporan" },
  { href: "/report/history", icon: Clock,      label: "Riwayat"      },
  { href: "/profile",        icon: User,       label: "Profil"       },
];

const HIDE_NAV_PATHS = ["/login", "/report/history/"];

function BottomNav({ pathname }: { pathname: string }) {
  const hidden = HIDE_NAV_PATHS.some((p) =>
    p.endsWith("/") ? pathname.startsWith(p) : pathname === p
  );
  if (hidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-14 bg-white border-t border-gray-200 flex items-center z-50">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive =
          pathname === href ||
          (href !== "/home" && pathname.startsWith(href + "/"));
        return (
          <Link
            key={label}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2"
          >
            <Icon
              size={24}
              strokeWidth={1.5}
              className={isActive ? "text-accent" : "text-gray-400"}
            />
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
    p.endsWith("/") ? pathname.startsWith(p) : pathname === p
  );

  return (
    <Providers>
      <div className={`min-h-screen max-w-md mx-auto bg-white ${hideNav ? "" : "pb-14"}`}>
        {children}
        <BottomNav pathname={pathname} />
      </div>
    </Providers>
  );
}
