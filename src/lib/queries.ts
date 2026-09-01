import type { Order, OrderItem, Product, ProductVariant } from "@prisma/client";
import { prisma } from "./prisma";
import type { NutritionFact } from "./mock-data";
import type { OrderView, ProductView } from "./types";

type ProductWithVariants = Product & { variants: ProductVariant[] };
type OrderWithItems = Order & { items: OrderItem[] };

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function toProductView(product: ProductWithVariants): ProductView {
  const variants = product.variants.map((v) => ({
    id: v.id,
    flavor: v.flavor,
    size: v.size,
    price: v.price,
    stock: v.stock,
  }));
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    category: product.category,
    imageUrl: product.imageUrl,
    gallery: parseJson<string[]>(product.gallery, [product.imageUrl]),
    nutrition: parseJson<NutritionFact[]>(product.nutrition, []),
    ingredients: product.ingredients,
    featured: product.featured,
    active: product.active,
    variants,
    fromPrice: variants.length ? Math.min(...variants.map((v) => v.price)) : 0,
    totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
  };
}

export function toOrderView(order: OrderWithItems): OrderView {
  return {
    id: order.id,
    code: order.code,
    customerName: order.customerName,
    phone: order.phone,
    email: order.email,
    address: order.address,
    city: order.city,
    notes: order.notes,
    paymentMethod: order.paymentMethod,
    status: order.status,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      variantLabel: item.variantLabel,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    })),
  };
}

export async function getProducts(options?: {
  includeInactive?: boolean;
}): Promise<ProductView[]> {
  const products = await prisma.product.findMany({
    where: options?.includeInactive ? undefined : { active: true },
    include: { variants: { orderBy: [{ price: "asc" }] } },
    orderBy: { createdAt: "asc" },
  });
  return products.map(toProductView);
}

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: { orderBy: [{ price: "asc" }] } },
  });
  return product ? toProductView(product) : null;
}

export async function getFeaturedProducts(limit = 4): Promise<ProductView[]> {
  const products = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: { variants: { orderBy: [{ price: "asc" }] } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  return products.map(toProductView);
}

export async function getOrders(): Promise<OrderView[]> {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(toOrderView);
}

export async function getOrderByCode(code: string): Promise<OrderView | null> {
  const order = await prisma.order.findUnique({
    where: { code },
    include: { items: true },
  });
  return order ? toOrderView(order) : null;
}

export type SalesOverview = {
  revenue: number;
  orderCount: number;
  averageTicket: number;
  pendingCount: number;
  unitsSold: number;
  lowStock: { name: string; variantLabel: string; stock: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
  revenueByCategory: { category: string; revenue: number }[];
};

export async function getSalesOverview(): Promise<SalesOverview> {
  const [orders, products] = await Promise.all([
    prisma.order.findMany({ include: { items: true } }),
    prisma.product.findMany({ include: { variants: true } }),
  ]);

  const productById = new Map(products.map((p) => [p.id, p]));
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const unitsSold = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0,
  );

  const perProduct = new Map<string, { name: string; units: number; revenue: number }>();
  const perCategory = new Map<string, number>();

  for (const order of orders) {
    for (const item of order.items) {
      const current = perProduct.get(item.productId) ?? {
        name: item.name,
        units: 0,
        revenue: 0,
      };
      current.units += item.quantity;
      current.revenue += item.quantity * item.unitPrice;
      perProduct.set(item.productId, current);

      const category = productById.get(item.productId)?.category ?? "otros";
      perCategory.set(
        category,
        (perCategory.get(category) ?? 0) + item.quantity * item.unitPrice,
      );
    }
  }

  const lowStock = products
    .flatMap((product) =>
      product.variants.map((variant) => ({
        name: product.name,
        variantLabel: `${variant.flavor} · ${variant.size}`,
        stock: variant.stock,
      })),
    )
    .filter((entry) => entry.stock <= 12)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);

  return {
    revenue,
    orderCount: orders.length,
    averageTicket: orders.length ? Math.round(revenue / orders.length) : 0,
    pendingCount: orders.filter((o) => o.status === "PENDING").length,
    unitsSold,
    lowStock,
    topProducts: [...perProduct.values()].sort((a, b) => b.units - a.units).slice(0, 5),
    revenueByCategory: [...perCategory.entries()]
      .map(([category, categoryRevenue]) => ({ category, revenue: categoryRevenue }))
      .sort((a, b) => b.revenue - a.revenue),
  };
}
