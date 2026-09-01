import { NextResponse } from "next/server";
import { PAYMENT_METHODS, shippingFor } from "@/lib/catalog";
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
  const items = (body.items ?? []).filter((item) => item.quantity > 0);

  if (!customerName || !phone || !address || !city) {
    return NextResponse.json(
      { error: "Nombre, teléfono, dirección y ciudad son obligatorios." },
      { status: 400 },
    );
  }
  if (!(paymentMethod in PAYMENT_METHODS)) {
    return NextResponse.json({ error: "Método de pago inválido." }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map((item) => item.variantId) } },
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
        {
          error: `Solo quedan ${variant.stock} unidades de ${variant.product.name} (${variant.size}).`,
        },
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

  const subtotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const shipping = shippingFor(subtotal);

  const order = await prisma.$transaction(async (tx) => {
    for (const item of orderItems) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
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

  return NextResponse.json(toOrderView(order), { status: 201 });
}
