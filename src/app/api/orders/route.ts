import { NextResponse } from "next/server";
import {
  ONLINE_PAYMENTS_ENABLED,
  PAYMENT_METHODS,
  shippingFor,
} from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getOrders, toOrderView } from "@/lib/queries";

type IncomingItem = { variantId: string; quantity: number };

type IncomingOrder = {
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  paymentMethod?: string;
  items?: IncomingItem[];
};

class OutOfStock extends Error {
  constructor(readonly productName: string) {
    super(`Sin inventario: ${productName}`);
  }
}

function outOfStockMessage(variant: {
  stock: number;
  size: string;
  product: { name: string };
}): string {
  return `Solo quedan ${variant.stock} unidades de ${variant.product.name} (${variant.size}).`;
}

function generateCode(): string {
  return `LNV-${Math.floor(1000 + Math.random() * 9000)}${Date.now().toString().slice(-3)}`;
}

export async function GET() {
  return NextResponse.json(await getOrders());
}

export async function POST(request: Request) {
  const body = (await request.json()) as IncomingOrder;

  const customerName = body.customerName?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const address = body.address?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  const paymentMethod = body.paymentMethod ?? "whatsapp";
  const rawItems = Array.isArray(body.items) ? body.items : [];

  const requested = new Map<string, number>();
  for (const item of rawItems) {
    if (typeof item?.variantId !== "string" || !item.variantId) continue;
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return NextResponse.json(
        { error: "Las cantidades deben ser números enteros positivos." },
        { status: 400 },
      );
    }
    requested.set(
      item.variantId,
      (requested.get(item.variantId) ?? 0) + item.quantity,
    );
  }
  const items = [...requested].map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }));

  if (!customerName || !phone || !address || !city) {
    return NextResponse.json(
      { error: "Nombre, teléfono, dirección y ciudad son obligatorios." },
      { status: 400 },
    );
  }
  if (!(paymentMethod in PAYMENT_METHODS)) {
    return NextResponse.json(
      { error: "Método de pago inválido." },
      { status: 400 },
    );
  }
  if (paymentMethod === "online" && !ONLINE_PAYMENTS_ENABLED) {
    return NextResponse.json(
      { error: "El pago en línea no está disponible." },
      { status: 400 },
    );
  }
  if (items.length === 0) {
    return NextResponse.json(
      { error: "El carrito está vacío." },
      { status: 400 },
    );
  }

  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: items.map((item) => item.variantId) },
      product: { active: true },
    },
    include: { product: true },
  });

  const orderItems: {
    productId: string;
    variantId: string;
    name: string;
    variantLabel: string;
    unitPrice: number;
    quantity: number;
  }[] = [];
  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) {
      return NextResponse.json(
        { error: "Uno de los productos ya no está disponible." },
        { status: 409 },
      );
    }
    if (variant.stock < item.quantity) {
      return NextResponse.json(
        { error: outOfStockMessage(variant) },
        { status: 409 },
      );
    }
    orderItems.push({
      productId: variant.productId,
      variantId: variant.id,
      name: variant.product.name,
      variantLabel: `${variant.flavor} · ${variant.size}`,
      unitPrice: variant.price,
      quantity: item.quantity,
    });
  }

  const subtotal = orderItems.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );
  const shipping = shippingFor(subtotal);

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        const { count } = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (count === 0) throw new OutOfStock(item.name);
      }
      return tx.order.create({
        data: {
          code: generateCode(),
          customerName,
          phone,
          email: body.email?.trim() ?? "",
          address,
          city,
          notes: body.notes?.trim() ?? "",
          paymentMethod,
          subtotal,
          shipping,
          total: subtotal + shipping,
          items: { create: orderItems },
        },
        include: { items: true },
      });
    });
  } catch (error) {
    if (error instanceof OutOfStock) {
      return NextResponse.json(
        {
          error: `Se agotó el inventario de ${error.productName} mientras confirmábamos tu pedido.`,
        },
        { status: 409 },
      );
    }
    throw error;
  }

  return NextResponse.json(toOrderView(order), { status: 201 });
}
