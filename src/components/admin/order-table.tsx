"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  formatCOP,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  type OrderStatus,
  type PaymentMethod,
} from "@/lib/catalog";
import type { OrderView } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function OrderTable({ orders }: { orders: OrderView[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<OrderStatus | "TODOS">("TODOS");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");

  const visible =
    filter === "TODOS" ? orders : orders.filter((order) => order.status === filter);

  const changeStatus = async (order: OrderView, status: OrderStatus) => {
    setPending(order.id);
    setError("");
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        setError(`No se pudo actualizar el pedido ${order.code}.`);
        return;
      }
      router.refresh();
    } catch {
      setError(`No se pudo actualizar el pedido ${order.code}.`);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="serif text-2xl">Pedidos</h1>
          <p className="text-sm text-stone-500">{orders.length} pedidos registrados</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["TODOS", ...ORDER_STATUSES] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                filter === status
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-stone-200 bg-white text-stone-600"
              }`}
            >
              {status === "TODOS" ? "Todos" : ORDER_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {visible.map((order) => (
              <Fragment key={order.id}>
                <tr>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((current) => (current === order.id ? null : order.id))
                      }
                      className="inline-flex items-center gap-1 font-medium hover:text-brand-700"
                    >
                      {expanded === order.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {order.code}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <p>{order.customerName}</p>
                    <p className="text-xs text-stone-500">
                      {order.city} · {order.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {dateFormatter.format(new Date(order.createdAt))}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {PAYMENT_METHODS[order.paymentMethod as PaymentMethod] ??
                      order.paymentMethod}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatCOP(order.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Estado del pedido ${order.code}`}
                      disabled={pending === order.id}
                      value={order.status}
                      onChange={(event) =>
                        changeStatus(order, event.target.value as OrderStatus)
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        ORDER_STATUS_STYLES[order.status as OrderStatus] ??
                        "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                {expanded === order.id && (
                  <tr className="bg-stone-50">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-stone-500">
                            Productos
                          </p>
                          <ul className="mt-2 space-y-1">
                            {order.items.map((item) => (
                              <li key={item.id} className="flex justify-between gap-4">
                                <span>
                                  {item.quantity} × {item.name}{" "}
                                  <span className="text-stone-500">
                                    ({item.variantLabel})
                                  </span>
                                </span>
                                <span>{formatCOP(item.unitPrice * item.quantity)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-stone-600">
                          <p className="text-xs uppercase tracking-wide text-stone-500">
                            Entrega
                          </p>
                          <p className="mt-2">
                            {order.address}, {order.city}
                          </p>
                          {order.email && <p>{order.email}</p>}
                          {order.notes && <p className="italic">“{order.notes}”</p>}
                          <p className="mt-2">
                            Subtotal {formatCOP(order.subtotal)} · Domicilio{" "}
                            {order.shipping === 0 ? "gratis" : formatCOP(order.shipping)}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
