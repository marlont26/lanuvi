"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { CATEGORIES, categoryName, formatCOP } from "@/lib/catalog";
import type { ProductView } from "@/lib/types";
import { ProductForm } from "./product-form";

export function ProductManager({ products }: { products: ProductView[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ProductView | null>(null);
  const [creating, setCreating] = useState(false);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const visible = category
    ? products.filter((product) => product.category === category)
    : products;

  const remove = async (product: ProductView) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    const data = await response.json();
    setMessage(
      response.ok
        ? (data.message ?? `"${product.name}" eliminado.`)
        : (data.error ?? "No se pudo eliminar."),
    );
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="serif text-2xl">Productos</h1>
          <p className="text-sm text-stone-500">
            {products.length} productos en catálogo
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> Nuevo producto
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("")}
          className={`rounded-full border px-3 py-1.5 text-sm ${
            category === "" ? "border-brand-600 bg-brand-600 text-white" : "border-stone-200 bg-white"
          }`}
        >
          Todas
        </button>
        {CATEGORIES.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => setCategory(item.slug)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              category === item.slug
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-stone-200 bg-white"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {message && (
        <p className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-900">{message}</p>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Presentaciones</th>
              <th className="px-4 py-3">Desde</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {visible.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={product.imageUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-stone-500">/{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{categoryName(product.category)}</td>
                <td className="px-4 py-3 text-stone-600">{product.variants.length}</td>
                <td className="px-4 py-3">{formatCOP(product.fromPrice)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      product.totalStock === 0
                        ? "text-rose-600"
                        : product.totalStock <= 15
                          ? "text-amber-700"
                          : "text-stone-700"
                    }
                  >
                    {product.totalStock} u
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      product.active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    {product.active ? "Activo" : "Archivado"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      aria-label={`Editar ${product.name}`}
                      onClick={() => {
                        setCreating(false);
                        setEditing(product);
                      }}
                      className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-brand-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Eliminar ${product.name}`}
                      onClick={() => remove(product)}
                      className="rounded-lg p-2 text-stone-500 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <ProductForm
          product={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={(text) => {
            setMessage(text);
            setCreating(false);
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
