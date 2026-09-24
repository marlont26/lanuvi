export const CATEGORIES = [
  {
    slug: "yogures",
    name: "Yogures",
    tagline: "Fermentados lentos, sin espesantes",
    accent: "from-violet-200 to-violet-50",
  },
  {
    slug: "mermeladas",
    name: "Mermeladas",
    tagline: "Fruta de finca cocida en olla",
    accent: "from-rose-200 to-rose-50",
  },
  {
    slug: "cuchareables",
    name: "Cuchareables",
    tagline: "Postres de cuchara listos para servir",
    accent: "from-amber-200 to-amber-50",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as CategorySlug[];

export function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pago por verificar",
  PAID: "Pagado",
  PREPARING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PAID: "bg-lime-100 text-lime-800",
  PREPARING: "bg-sky-100 text-sky-800",
  SHIPPED: "bg-violet-100 text-violet-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-700",
};

export const PAYMENT_METHODS = {
  nequi: "Transferencia Nequi",
  whatsapp: "Coordinar por WhatsApp",
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;

/** Bank-transfer details shown at checkout; every payment is verified by hand. */
export const NEQUI = {
  phone: process.env.NEXT_PUBLIC_NEQUI_PHONE || "300 123 4567",
  holder: process.env.NEXT_PUBLIC_NEQUI_HOLDER || "Lanuvi SAS",
};

/** Free delivery above this amount (COP). */
export const FREE_SHIPPING_THRESHOLD = 90_000;
export const SHIPPING_FEE = 8_000;

export function shippingFor(subtotal: number): number {
  if (subtotal === 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export const PRICE_RANGES = [
  { id: "todos", label: "Todos los precios", min: 0, max: Number.MAX_SAFE_INTEGER },
  { id: "hasta-10k", label: "Hasta $10.000", min: 0, max: 10000 },
  { id: "10k-20k", label: "$10.000 – $20.000", min: 10000, max: 20000 },
  { id: "desde-20k", label: "Desde $20.000", min: 20000, max: Number.MAX_SAFE_INTEGER },
] as const;

