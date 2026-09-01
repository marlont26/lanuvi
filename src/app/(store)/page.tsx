import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Snowflake, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES } from "@/lib/catalog";
import { getFeaturedProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

const PROMISES = [
  {
    icon: Leaf,
    title: "Ingredientes contados",
    copy: "Leche, fruta y cultivos. Sin espesantes ni colorantes.",
  },
  {
    icon: Snowflake,
    title: "Cadena de frío",
    copy: "Salimos de la planta y llegamos a tu nevera el mismo día.",
  },
  {
    icon: Truck,
    title: "Envío gratis desde $90.000",
    copy: "Domicilios en Bogotá y municipios de la sabana.",
  },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts(4);

  return (
    <>
      <section className="relative overflow-hidden border-b border-stone-200/70 bg-gradient-to-b from-brand-100 via-brand-50 to-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-xs uppercase tracking-widest text-brand-700">
              Hecho en pequeños lotes
            </span>
            <h1 className="serif mt-4 text-4xl leading-tight text-stone-900 sm:text-5xl">
              Lácteos artesanales con tiempo de sobra
            </h1>
            <p className="mt-4 max-w-md text-stone-600">
              Yogures fermentados durante ocho horas, mermeladas cocidas en olla y postres
              cuchareables de receta familiar. De la sabana de Bogotá a tu mesa.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/productos" className="btn-primary">
                Ver el catálogo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/productos?categoria=cuchareables" className="btn-secondary">
                Postres de la semana
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <Image
              src="/products/yogur-griego-artesanal.svg"
              alt="Yogur griego artesanal Lanuvi"
              fill
              priority
              sizes="(max-width: 768px) 90vw, 420px"
              className="rounded-3xl object-cover shadow-lg"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="serif text-2xl">Elige tu antojo</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/productos?categoria=${category.slug}`}
              className={`card flex flex-col justify-between bg-gradient-to-br ${category.accent} p-6 transition hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div>
                <h3 className="serif text-xl">{category.name}</h3>
                <p className="mt-1 text-sm text-stone-600">{category.tagline}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand-800">
                Explorar <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="flex items-end justify-between">
          <h2 className="serif text-2xl">Destacados de la semana</h2>
          <Link
            href="/productos"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            Ver todo
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {PROMISES.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="card flex gap-3 p-5">
              <Icon className="h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm text-stone-600">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
