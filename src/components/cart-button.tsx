"use client";

import { ShoppingBag } from "lucide-react";
import { cartTotals, useCart } from "@/store/cart";
import { useHydrated } from "@/lib/use-hydrated";

export function CartButton({ className = "" }: { className?: string }) {
  const items = useCart((state) => state.items);
  const openCart = useCart((state) => state.openCart);
  const hydrated = useHydrated();
  const { count } = cartTotals(items);

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Abrir carrito"
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-800 transition hover:bg-brand-50 ${className}`}
    >
      <ShoppingBag className="h-5 w-5" />
      {hydrated && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1 text-[11px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
