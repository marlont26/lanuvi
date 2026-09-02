import Link from "next/link";
import { AlertTriangle, Boxes, Clock, DollarSign, ShoppingCart } from "lucide-react";
import { categoryName, formatCOP } from "@/lib/catalog";
import { getSalesOverview } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const overview = await getSalesOverview();
  const topUnits = Math.max(1, ...overview.topProducts.map((p) => p.units));

  const metrics = [
    {
      label: "Ingresos totales",
      value: formatCOP(overview.revenue),
      icon: DollarSign,
    },
    { label: "Pedidos", value: String(overview.orderCount), icon: ShoppingCart },
    { label: "Ticket promedio", value: formatCOP(overview.averageTicket), icon: Boxes },
    { label: "Pendientes", value: String(overview.pendingCount), icon: Clock },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="serif text-2xl">Resumen de ventas</h1>
        <p className="text-sm text-stone-500">
          {overview.unitsSold} unidades vendidas en {overview.orderCount} pedidos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500">{label}</span>
              <Icon className="h-4 w-4 text-brand-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="serif text-lg">Más vendidos</h2>
          {overview.topProducts.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">Todavía no hay ventas.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {overview.topProducts.map((product) => (
                <li key={product.name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-stone-500">
                      {product.units} u · {formatCOP(product.revenue)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-stone-100">
                    <div
                      className="h-2 rounded-full bg-brand-500"
                      style={{ width: `${(product.units / topUnits) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="serif text-lg">Ingresos por categoría</h2>
          <ul className="mt-4 space-y-3">
            {overview.revenueByCategory.map((entry) => (
              <li key={entry.category} className="flex justify-between text-sm">
                <span>{categoryName(entry.category)}</span>
                <span className="font-medium">{formatCOP(entry.revenue)}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-6 flex items-center gap-2 text-sm font-semibold text-amber-700">
            <AlertTriangle className="h-4 w-4" /> Stock bajo
          </h3>
          <ul className="mt-2 space-y-2 text-sm">
            {overview.lowStock.map((entry) => (
              <li key={`${entry.name}-${entry.variantLabel}`} className="flex justify-between">
                <span className="text-stone-600">
                  {entry.name} · {entry.variantLabel}
                </span>
                <span className={entry.stock === 0 ? "text-rose-600" : "text-amber-700"}>
                  {entry.stock} u
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/admin/productos"
            className="mt-4 inline-block text-sm text-brand-700 hover:underline"
          >
            Ajustar inventario →
          </Link>
        </section>
      </div>
    </div>
  );
}
