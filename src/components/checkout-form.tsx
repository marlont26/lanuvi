"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Loader2, MessageCircle } from "lucide-react";
import { formatCOP } from "@/lib/catalog";
import type { OrderView } from "@/lib/types";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import { cartTotals, useCart } from "@/store/cart";
import { useHydrated } from "@/lib/use-hydrated";

type FormState = {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: "whatsapp" | "online";
};

const INITIAL: FormState = {
  customerName: "",
  phone: "",
  email: "",
  address: "",
  city: "Bogotá",
  notes: "",
  paymentMethod: "whatsapp",
};

export function CheckoutForm() {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);
  const hydrated = useHydrated();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { subtotal, shipping, total } = cartTotals(items);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }) as FormState);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No pudimos crear el pedido.");
        return;
      }
      const order = data as OrderView;
      clear();
      if (form.paymentMethod === "whatsapp") {
        window.open(whatsappOrderUrl(order), "_blank", "noopener,noreferrer");
      }
      router.push(`/pedido/${order.code}`);
    } catch {
      setError("Hubo un problema de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) return <div className="h-64" />;

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-stone-600">Tu carrito está vacío.</p>
        <Link href="/productos" className="btn-primary mt-4">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <section className="card space-y-4 p-5">
          <h2 className="serif text-lg">Datos de entrega</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="customerName">
                Nombre completo *
              </label>
              <input
                id="customerName"
                required
                className="field"
                value={form.customerName}
                onChange={(e) => set("customerName")(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="phone">
                Celular (WhatsApp) *
              </label>
              <input
                id="phone"
                required
                inputMode="tel"
                className="field"
                placeholder="300 123 4567"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="email">
                Correo (opcional)
              </label>
              <input
                id="email"
                type="email"
                className="field"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="address">
                Dirección de entrega *
              </label>
              <input
                id="address"
                required
                className="field"
                placeholder="Cra 13 #85-24, apto 502"
                value={form.address}
                onChange={(e) => set("address")(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="city">
                Ciudad *
              </label>
              <input
                id="city"
                required
                className="field"
                value={form.city}
                onChange={(e) => set("city")(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="notes">
                Notas para el repartidor
              </label>
              <input
                id="notes"
                className="field"
                placeholder="Dejar en portería"
                value={form.notes}
                onChange={(e) => set("notes")(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="serif text-lg">Confirmación y pago</h2>
          <label
            className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
              form.paymentMethod === "whatsapp"
                ? "border-brand-600 bg-brand-50"
                : "border-stone-200"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              className="mt-1"
              checked={form.paymentMethod === "whatsapp"}
              onChange={() => set("paymentMethod")("whatsapp")}
            />
            <span>
              <span className="flex items-center gap-2 text-sm font-medium">
                <MessageCircle className="h-4 w-4" /> Confirmar por WhatsApp
              </span>
              <span className="mt-1 block text-sm text-stone-600">
                Te abrimos el chat con el resumen del pedido y coordinas el pago contra
                entrega.
              </span>
            </span>
          </label>
          <label
            className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
              form.paymentMethod === "online"
                ? "border-brand-600 bg-brand-50"
                : "border-stone-200"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              className="mt-1"
              checked={form.paymentMethod === "online"}
              onChange={() => set("paymentMethod")("online")}
            />
            <span>
              <span className="flex items-center gap-2 text-sm font-medium">
                <CreditCard className="h-4 w-4" /> Pago en línea (modo prueba)
              </span>
              <span className="mt-1 block text-sm text-stone-600">
                Simula una pasarela tipo Stripe / MercadoPago en sandbox. No se realiza
                ningún cobro real.
              </span>
            </span>
          </label>
        </section>
      </div>

      <aside className="card h-fit space-y-4 p-5 lg:sticky lg:top-24">
        <h2 className="serif text-lg">Tu pedido</h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-3">
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-stone-500">
                  {item.variantLabel} × {item.quantity}
                </p>
              </div>
              <span className="text-sm">{formatCOP(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-stone-200 pt-3 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>{formatCOP(subtotal)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Domicilio</span>
            <span>{shipping === 0 ? "Gratis" : formatCOP(shipping)}</span>
          </div>
          <div className="flex justify-between pt-1 text-base font-semibold">
            <span>Total</span>
            <span>{formatCOP(total)}</span>
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {form.paymentMethod === "whatsapp" ? "Confirmar por WhatsApp" : "Pagar (prueba)"}
        </button>
        <p className="text-center text-xs text-stone-500">
          Al confirmar aceptas que te contactemos para coordinar la entrega.
        </p>
      </aside>
    </form>
  );
}
