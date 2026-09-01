import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogFilters } from "@/components/catalog-filters";
import { ProductCard } from "@/components/product-card";
import { categoryName, PRICE_RANGES } from "@/lib/catalog";
import { getProducts } from "@/lib/queries";
import type { ProductView } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Catálogo" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function filterProducts(
  products: ProductView[],
  { category, query, price, sort }: Record<string, string>,
): ProductView[] {
  const range = PRICE_RANGES.find((r) => r.id === price) ?? PRICE_RANGES[0];
  const needle = query.trim().toLowerCase();

  const filtered = products.filter((product) => {
    if (category && product.category !== category) return false;
    if (product.fromPrice < range.min || product.fromPrice > range.max) return false;
    if (!needle) return true;
    const haystack = [
      product.name,
      product.tagline,
      product.description,
      categoryName(product.category),
      ...product.variants.map((v) => `${v.flavor} ${v.size}`),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });

  switch (sort) {
    case "precio-asc":
      return filtered.sort((a, b) => a.fromPrice - b.fromPrice);
    case "precio-desc":
      return filtered.sort((a, b) => b.fromPrice - a.fromPrice);
    case "nombre":
      return filtered.sort((a, b) => a.name.localeCompare(b.name, "es"));
    default:
      return filtered.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || a.fromPrice - b.fromPrice,
      );
  }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const category = first(params.categoria);
  const products = filterProducts(await getProducts(), {
    category,
    query: first(params.q),
    price: first(params.precio) || "todos",
    sort: first(params.orden) || "destacados",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="serif text-3xl">
          {category ? categoryName(category) : "Todo el catálogo"}
        </h1>
        <p className="mt-1 text-stone-600">
          Producción semanal en pequeños lotes. Lo que ves disponible es lo que hay en la
          nevera.
        </p>
      </header>

      <Suspense fallback={<div className="h-40" />}>
        <CatalogFilters resultCount={products.length} />
      </Suspense>

      {products.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
          No encontramos productos con esos filtros. Prueba con otra búsqueda.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
