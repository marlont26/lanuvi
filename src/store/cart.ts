"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shippingFor } from "@/lib/catalog";

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantLabel: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          const items = existing
            ? state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxStock) }
                  : i,
              )
            : [...state.items, { ...item, quantity: Math.min(quantity, item.maxStock) }];
          return { items, isOpen: true };
        }),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.flatMap((item) => {
            if (item.variantId !== variantId) return [item];
            const next = Math.min(Math.max(quantity, 0), item.maxStock);
            return next === 0 ? [] : [{ ...item, quantity: next }];
          }),
        })),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "lanuvi-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = shippingFor(subtotal);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, shipping, total: subtotal + shipping, count };
}
