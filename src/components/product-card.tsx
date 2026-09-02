import Image from "next/image";
import Link from "next/link";
import { categoryName, formatCOP } from "@/lib/catalog";
import type { ProductView } from "@/lib/types";

export function ProductCard({ product }: { product: ProductView }) {
  const soldOut = product.totalStock === 0;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-stone-900/80 px-3 py-1 text-xs text-white">
            Agotado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-[11px] uppercase tracking-wide text-brand-600">
          {categoryName(product.category)}
        </span>
        <h3 className="serif text-lg leading-tight">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-stone-500">{product.tagline}</p>
        <p className="mt-auto pt-3 text-sm font-semibold text-stone-800">
          Desde {formatCOP(product.fromPrice)}
        </p>
      </div>
    </Link>
  );
}
