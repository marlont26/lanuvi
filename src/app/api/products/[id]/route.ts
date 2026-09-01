import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseProductInput } from "@/lib/product-input";
import { toProductView } from "@/lib/queries";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }
  return NextResponse.json(toProductView(product));
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const parsed = parseProductInput(await request.json());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const input = parsed.value;

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }

  const keptIds = new Set(input.variants.map((v) => v.id).filter(Boolean) as string[]);
  const removed = existing.variants.filter((v) => !keptIds.has(v.id));
  if (removed.length) {
    const sold = await prisma.orderItem.count({
      where: { variantId: { in: removed.map((v) => v.id) } },
    });
    if (sold > 0) {
      return NextResponse.json(
        {
          error:
            "No puedes eliminar una presentación que ya tiene pedidos. Pon su stock en 0.",
        },
        { status: 409 },
      );
    }
  }

  const product = await prisma.$transaction(async (tx) => {
    if (removed.length) {
      await tx.productVariant.deleteMany({
        where: { id: { in: removed.map((v) => v.id) } },
      });
    }
    for (const variant of input.variants) {
      if (variant.id) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            flavor: variant.flavor,
            size: variant.size,
            price: variant.price,
            stock: variant.stock,
          },
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId: id,
            flavor: variant.flavor,
            size: variant.size,
            price: variant.price,
            stock: variant.stock,
          },
        });
      }
    }
    return tx.product.update({
      where: { id },
      data: {
        name: input.name,
        tagline: input.tagline,
        description: input.description,
        category: input.category,
        imageUrl: input.imageUrl,
        gallery: JSON.stringify(input.gallery),
        ingredients: input.ingredients,
        featured: input.featured,
        active: input.active,
      },
      include: { variants: true },
    });
  });

  return NextResponse.json(toProductView(product));
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
  }

  const sold = await prisma.orderItem.count({ where: { productId: id } });
  if (sold > 0) {
    await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({
      ok: true,
      archived: true,
      message: "El producto tiene pedidos asociados, así que se archivó en vez de borrarse.",
    });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true, archived: false });
}
