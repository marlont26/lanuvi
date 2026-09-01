"use client";

import { MessageCircle } from "lucide-react";
import type { OrderView } from "@/lib/types";
import { whatsappOrderUrl } from "@/lib/whatsapp";

export function WhatsAppOrderLink({ order }: { order: OrderView }) {
  return (
    <a
      href={whatsappOrderUrl(order)}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-primary"
    >
      <MessageCircle className="h-4 w-4" /> Enviar pedido por WhatsApp
    </a>
  );
}
