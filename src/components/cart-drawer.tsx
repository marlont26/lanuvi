"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatCOP, FREE_SHIPPING_THRESHOLD } from "@/lib/catalog";
import { cartTotals, useCart } from "@/store/cart";
import { useHydrated } from "@/lib/use-hydrated";

export function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, removeItem } = useCart();
  const hydrated = useHydrated();
  const { subtotal, shipping, total, count } = cartTotals(items);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  if (!hydrated) return null;

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-stone-900/40 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Carrito de compras"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="serif text-lg">Tu carrito ({count})</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="rounded-full p-2 text-stone-500 hover:bg-stone-200/60"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-brand-300" />
            <p className="text-sm text-stone-600">
              Tu carrito está vacío. Empieza por un yogur natural o una mermelada de mora.
            </p>
            <Link href="/productos" onClick={closeCart} className="btn-primary">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <li key={item.variantId} className="card flex gap-3 p-3">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={72}
                    height={72}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/productos/${item.slug}`}
                      onClick={closeCart}
                      className="block truncate text-sm font-medium hover:text-brand-700"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-stone-500">{item.variantLabel}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-white">
                        <button
                          type="button"
                          aria-label={`Quitar una unidad de ${item.name}`}
                          onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                          className="p-1.5 text-stone-600 hover:text-brand-700"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Agregar una unidad de ${item.name}`}
                          disabled={item.quantity >= item.maxStock}
                          onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                          className="p-1.5 text-stone-600 hover:text-brand-700 disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatCOP(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Eliminar ${item.name}`}
                    onClick={() => removeItem(item.variantId)}
                    className="self-start rounded-full p-1.5 text-stone-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="space-y-3 border-t border-stone-200 px-5 py-4">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Subtotal</span>
                <span>{formatCOP(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600">
                <span>Domicilio</span>
                <span>{shipping === 0 ? "Gratis" : formatCOP(shipping)}</span>
              </div>
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-800">
                  Te faltan {formatCOP(FREE_SHIPPING_THRESHOLD - subtotal)} para el envío
                  gratis.
                </p>
              )}
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCOP(total)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-primary w-full"
              >
                Ir al checkout
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
