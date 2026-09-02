import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseProductInput, slugify } from "@/lib/product-input";
import { getProducts, toProductView } from "@/lib/queries";

export async function GET(request: Request) {
  const includeInactive =
    new URL(request.url).searchParams.get("includeInactive") === "true";
  return NextResponse.json(await getProducts({ includeInactive }));
}

export async function POST(request: Request) {
  const parsed = parseProductInput(await request.json());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const input = parsed.value;

  const base = slugify(input.name);
  let slug = base;
  for (let i = 2; await prisma.product.findUnique({ where: { slug } }); i += 1) {
    slug = `${base}-${i}`;
  }

  const product = await prisma.product.create({
    data: {
      slug,
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      category: input.category,
      imageUrl: input.imageUrl,
      gallery: JSON.stringify(input.gallery),
      nutrition: JSON.stringify([]),
      ingredients: input.ingredients,
      featured: input.featured,
      active: input.active,
      variants: {
        create: input.variants.map(({ flavor, size, price, stock }) => ({
          flavor,
          size,
          price,
          stock,
        })),
      },
    },
    include: { variants: true },
  });

  return NextResponse.json(toProductView(product), { status: 201 });
}
