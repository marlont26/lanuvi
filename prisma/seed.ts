import { PrismaClient } from "@prisma/client";
import { SEED_PRODUCTS } from "../src/lib/mock-data";

const prisma = new PrismaClient();

type SeedOrder = {
  code: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  paymentMethod: string;
  status: string;
  daysAgo: number;
  items: { slug: string; variantIndex: number; quantity: number }[];
};

const SEED_ORDERS: SeedOrder[] = [
  {
    code: "LNV-1042",
    customerName: "Camila Restrepo",
    phone: "3105558842",
    email: "camila.restrepo@example.com",
    address: "Cra 13 #85-24, apto 502",
    city: "Bogotá",
    paymentMethod: "whatsapp",
    status: "DELIVERED",
    daysAgo: 9,
    items: [
      { slug: "yogur-griego-artesanal", variantIndex: 1, quantity: 2 },
      { slug: "mermelada-de-mora", variantIndex: 0, quantity: 2 },
    ],
  },
  {
    code: "LNV-1043",
    customerName: "Andrés Gómez",
    phone: "3012237711",
    email: "andres.gomez@example.com",
    address: "Calle 45 #22-10",
    city: "Chía",
    paymentMethod: "online",
    status: "DELIVERED",
    daysAgo: 6,
    items: [
      { slug: "yogur-natural-entero", variantIndex: 2, quantity: 1 },
      { slug: "arroz-con-leche-cremoso", variantIndex: 0, quantity: 3 },
    ],
  },
  {
    code: "LNV-1044",
    customerName: "Tienda La Huerta",
    phone: "3164490021",
    email: "compras@lahuerta.example.com",
    address: "Av. Suba #104-31, local 3",
    city: "Bogotá",
    paymentMethod: "whatsapp",
    status: "SHIPPED",
    daysAgo: 3,
    items: [
      { slug: "mermelada-de-mora", variantIndex: 1, quantity: 6 },
      { slug: "mermelada-de-pina-y-maracuya", variantIndex: 0, quantity: 4 },
    ],
  },
  {
    code: "LNV-1045",
    customerName: "Valentina Ossa",
    phone: "3208891234",
    email: "valentina.ossa@example.com",
    address: "Cra 7 #127-45, torre 2",
    city: "Bogotá",
    paymentMethod: "online",
    status: "PREPARING",
    daysAgo: 1,
    items: [
      { slug: "postre-de-natas", variantIndex: 0, quantity: 4 },
      { slug: "yogur-griego-artesanal", variantIndex: 0, quantity: 2 },
    ],
  },
  {
    code: "LNV-1046",
    customerName: "Julián Mesa",
    phone: "3007771122",
    email: "julian.mesa@example.com",
    address: "Calle 12 #5-60",
    city: "Cajicá",
    paymentMethod: "whatsapp",
    status: "PENDING",
    daysAgo: 0,
    items: [
      { slug: "yogur-de-mora-de-castilla", variantIndex: 0, quantity: 3 },
      { slug: "cheesecake-de-mora-en-vaso", variantIndex: 0, quantity: 2 },
    ],
  },
];

const SHIPPING_FEE = 8000;
const FREE_SHIPPING_THRESHOLD = 90000;

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();

  for (const product of SEED_PRODUCTS) {
    await prisma.product.create({
      data: {
        slug: product.slug,
        name: product.name,
        tagline: product.tagline,
        description: product.description,
        category: product.category,
        imageUrl: product.imageUrl,
        gallery: JSON.stringify(product.gallery),
        nutrition: JSON.stringify(product.nutrition),
        ingredients: product.ingredients,
        featured: product.featured,
        variants: { create: product.variants },
      },
    });
  }

  const products = await prisma.product.findMany({ include: { variants: true } });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  for (const order of SEED_ORDERS) {
    const items = order.items.map((item) => {
      const product = bySlug.get(item.slug);
      if (!product) throw new Error(`Unknown product in seed order: ${item.slug}`);
      const variant = product.variants[item.variantIndex];
      return {
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        variantLabel: `${variant.flavor} · ${variant.size}`,
        unitPrice: variant.price,
        quantity: item.quantity,
      };
    });
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const createdAt = new Date(Date.now() - order.daysAgo * 24 * 60 * 60 * 1000);

    await prisma.order.create({
      data: {
        code: order.code,
        customerName: order.customerName,
        phone: order.phone,
        email: order.email,
        address: order.address,
        city: order.city,
        paymentMethod: order.paymentMethod,
        status: order.status,
        subtotal,
        shipping,
        total: subtotal + shipping,
        createdAt,
        items: { create: items },
      },
    });
  }

  console.log(
    `Seeded ${SEED_PRODUCTS.length} products and ${SEED_ORDERS.length} orders for Lanuvi.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
