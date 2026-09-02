import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductDetail } from "@/components/product-detail";
import { getProductBySlug, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return { title: product.name, description: product.tagline };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();

  const related = (await getProducts())
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/productos"
        className="mb-6 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-brand-700"
      >
        <ChevronLeft className="h-4 w-4" /> Volver al catálogo
      </Link>

      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="serif text-2xl">También te puede gustar</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
