"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";
import { CartButton } from "./cart-button";

const LINKS = [
  { href: "/productos", label: "Todo el catálogo" },
  ...CATEGORIES.map((c) => ({ href: `/productos?categoria=${c.slug}`, label: c.name })),
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="serif text-2xl tracking-[0.3em] text-brand-800">
          LANUVI
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-stone-600 md:flex">
          {LINKS.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-brand-700">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CartButton />
          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-800 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-stone-200/70 bg-cream px-4 py-3 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-2 text-sm text-stone-700 hover:bg-brand-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
