"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";
import type { ProductView } from "@/lib/types";

type VariantDraft = {
  id?: string;
  flavor: string;
  size: string;
  price: string;
  stock: string;
};

type Props = {
  product: ProductView | null;
  onClose: () => void;
  onSaved: (message: string) => void;
};

const EMPTY_VARIANT: VariantDraft = { flavor: "Único", size: "", price: "", stock: "0" };

/** Keeps the gallery in sync when the primary image changes, preserving extra shots. */
function nextGallery(product: ProductView | null, imageUrl: string): string[] {
  if (!product) return [imageUrl];
  const rest = product.gallery.filter(
    (image) => image !== product.imageUrl && image !== imageUrl,
  );
  return [imageUrl, ...rest];
}

export function ProductForm({ product, onClose, onSaved }: Props) {
  const [name, setName] = useState(product?.name ?? "");
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0].slug);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [ingredients, setIngredients] = useState(product?.ingredients ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [active, setActive] = useState(product?.active ?? true);
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.length
      ? product.variants.map((variant) => ({
          id: variant.id,
          flavor: variant.flavor,
          size: variant.size,
          price: String(variant.price),
          stock: String(variant.stock),
        }))
      : [{ ...EMPTY_VARIANT }],
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateVariant = (index: number, patch: Partial<VariantDraft>) =>
    setVariants((prev) =>
      prev.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)),
    );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch(
        product ? `/api/products/${product.id}` : "/api/products",
        {
          method: product ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            tagline,
            description,
            category,
            imageUrl,
            gallery: nextGallery(product, imageUrl),
            ingredients,
            featured,
            active,
            variants: variants.map((variant) => ({
              id: variant.id,
              flavor: variant.flavor,
              size: variant.size,
              price: Number(variant.price),
              stock: Number(variant.stock),
            })),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No se pudo guardar el producto.");
        return;
      }
      onSaved(product ? `"${name}" actualizado.` : `"${name}" creado.`);
    } catch {
      setError("Error de conexión al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/40 p-4">
      <form
        onSubmit={submit}
        className="my-8 w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="serif text-xl">
            {product ? `Editar ${product.name}` : "Nuevo producto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="rounded-full p-2 text-stone-500 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="product-name">
              Nombre *
            </label>
            <input
              id="product-name"
              required
              className="field"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="product-category">
              Categoría *
            </label>
            <select
              id="product-category"
              className="field"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {CATEGORIES.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="product-image">
              URL de imagen *
            </label>
            <input
              id="product-image"
              required
              className="field"
              placeholder="/products/mi-producto.svg"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="product-tagline">
              Frase corta
            </label>
            <input
              id="product-tagline"
              className="field"
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="product-description">
              Descripción
            </label>
            <textarea
              id="product-description"
              rows={3}
              className="field"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="product-ingredients">
              Ingredientes
            </label>
            <input
              id="product-ingredients"
              className="field"
              value={ingredients}
              onChange={(event) => setIngredients(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
            />
            Destacado en la home
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
            />
            Visible en la tienda
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="label mb-0">Presentaciones</p>
            <button
              type="button"
              onClick={() => setVariants((prev) => [...prev, { ...EMPTY_VARIANT }])}
              className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
            >
              <Plus className="h-4 w-4" /> Agregar
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {variants.map((variant, index) => (
              <div key={variant.id ?? index} className="flex flex-wrap items-end gap-2">
                <input
                  aria-label="Sabor"
                  placeholder="Sabor"
                  className="field w-32 flex-1"
                  value={variant.flavor}
                  onChange={(event) => updateVariant(index, { flavor: event.target.value })}
                />
                <input
                  aria-label="Tamaño"
                  placeholder="Tamaño (200 g)"
                  className="field w-32 flex-1"
                  value={variant.size}
                  onChange={(event) => updateVariant(index, { size: event.target.value })}
                />
                <input
                  aria-label="Precio"
                  placeholder="Precio"
                  inputMode="numeric"
                  className="field w-28"
                  value={variant.price}
                  onChange={(event) => updateVariant(index, { price: event.target.value })}
                />
                <input
                  aria-label="Stock"
                  placeholder="Stock"
                  inputMode="numeric"
                  className="field w-24"
                  value={variant.stock}
                  onChange={(event) => updateVariant(index, { stock: event.target.value })}
                />
                <button
                  type="button"
                  aria-label="Quitar presentación"
                  disabled={variants.length === 1}
                  onClick={() =>
                    setVariants((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="rounded-lg p-2 text-stone-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
