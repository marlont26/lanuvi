import { formatCOP } from "./catalog";
import type { OrderView } from "./types";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "573001234567";

export function whatsappOrderUrl(order: OrderView): string {
  const lines = [
    `Hola Lanuvi 👋 Quiero confirmar mi pedido ${order.code}.`,
    "",
    ...order.items.map(
      (item) =>
        `• ${item.quantity} x ${item.name} (${item.variantLabel}) — ${formatCOP(
          item.unitPrice * item.quantity,
        )}`,
    ),
    "",
    `Subtotal: ${formatCOP(order.subtotal)}`,
    `Domicilio: ${order.shipping === 0 ? "Gratis" : formatCOP(order.shipping)}`,
    `Total: ${formatCOP(order.total)}`,
    "",
    `Nombre: ${order.customerName}`,
    `Dirección: ${order.address}, ${order.city}`,
    `Teléfono: ${order.phone}`,
    order.notes ? `Notas: ${order.notes}` : "",
  ].filter(Boolean);

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}
