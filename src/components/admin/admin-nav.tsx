"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, LogOut, Package, ReceiptText, Store } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Resumen", icon: BarChart3 },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ReceiptText },
  { href: "/", label: "Ver tienda", icon: Store },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return null;

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <nav className="flex flex-wrap gap-1">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition ${
              active && href !== "/"
                ? "bg-brand-700 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={logout}
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-stone-600 transition hover:bg-stone-100"
      >
        <LogOut className="h-4 w-4" />
        Salir
      </button>
    </nav>
  );
}
