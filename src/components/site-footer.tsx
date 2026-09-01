import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-stone-200/70 bg-white/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="serif text-xl tracking-[0.3em] text-brand-800">LANUVI</p>
          <p className="mt-3 max-w-xs text-sm text-stone-600">
            Lácteos artesanales hechos en pequeños lotes en la sabana de Bogotá. Sin
            espesantes, sin colorantes, sin afán.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-800">Catálogo</p>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/productos?categoria=${category.slug}`}
                  className="hover:text-brand-700"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-800">Pedidos</p>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>Domicilios en Bogotá y sabana</li>
            <li>Envío gratis desde $90.000</li>
            <li>Confirmación por WhatsApp</li>
            <li>
              <Link href="/admin" className="hover:text-brand-700">
                Panel del vendedor
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-stone-200/70 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Lanuvi. Demo con datos de prueba.
      </p>
    </footer>
  );
}
