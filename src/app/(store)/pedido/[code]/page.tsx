import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, CreditCard } from "lucide-react";
import { WhatsAppOrderLink } from "@/components/whatsapp-order-link";
import { formatCOP, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/catalog";
import { getOrderByCode } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Pedido confirmado" };

type Params = Promise<{ code: string }>;

export default async function OrderPage({ params }: { params: Params }) {
  const { code } = await params;
  const order = await getOrderByCode(decodeURIComponent(code));
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="card p-6 sm:p-8">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        <h1 className="serif mt-3 text-3xl">¡Gracias, {order.customerName}!</h1>
        <p className="mt-2 text-stone-600">
          Tu pedido <span className="font-medium">{order.code}</span> quedó registrado con
          estado{" "}
          <span className="font-medium">
            {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
          </span>
          .
        </p>

        {order.paymentMethod === "online" ? (
          <div className="mt-5 flex gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
            <CreditCard className="h-5 w-5 shrink-0" />
            <p>
              Pago aprobado en <strong>modo prueba</strong>. Es una pasarela simulada
              (Stripe / MercadoPago sandbox): no se realizó ningún cobro real.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-900">
            <p>
              Te abrimos WhatsApp con el resumen. Si no se abrió, usa el botón para
              enviarlo.
            </p>
            <WhatsAppOrderLink order={order} />
          </div>
        )}

        <ul className="mt-6 divide-y divide-stone-100 border-y border-stone-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                {item.quantity} × {item.name}
                <span className="block text-xs text-stone-500">{item.variantLabel}</span>
              </span>
              <span className="font-medium">
                {formatCOP(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>{formatCOP(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Domicilio</span>
            <span>{order.shipping === 0 ? "Gratis" : formatCOP(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCOP(order.total)}</span>
          </div>
        </div>

        <p className="mt-6 text-sm text-stone-600">
          Entrega en {order.address}, {order.city}.
        </p>

        <Link href="/productos" className="btn-secondary mt-6">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
