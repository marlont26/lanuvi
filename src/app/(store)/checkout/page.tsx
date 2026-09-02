import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="serif text-3xl">Finalizar pedido</h1>
      <p className="mt-1 mb-8 text-stone-600">
        Entregas de martes a sábado en Bogotá y la sabana.
      </p>
      <CheckoutForm />
    </div>
  );
}
