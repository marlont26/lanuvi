"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Package, ReceiptText, Store } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Resumen", icon: BarChart3 },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ReceiptText },
  { href: "/", label: "Ver tienda", icon: Store },
];

export function AdminNav() {
  const pathname = usePathname();

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
    </nav>
  );
}
