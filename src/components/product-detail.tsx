"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { categoryName, formatCOP } from "@/lib/catalog";
import type { ProductView } from "@/lib/types";
import { useCart } from "@/store/cart";

const TABS = ["descripcion", "nutricional", "envio"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  descripcion: "Descripción",
  nutricional: "Información nutricional",
  envio: "Envío y conservación",
};

export function ProductDetail({ product }: { product: ProductView }) {
  const addItem = useCart((state) => state.addItem);
  const flavors = useMemo(
    () => [...new Set(product.variants.map((v) => v.flavor))],
    [product.variants],
  );

  const [flavor, setFlavor] = useState(flavors[0] ?? "");
  const sizes = product.variants.filter((v) => v.flavor === flavor);
  const [variantId, setVariantId] = useState(sizes[0]?.id ?? "");
  const variant =
    product.variants.find((v) => v.id === variantId) ?? sizes[0] ?? product.variants[0];
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState(product.imageUrl);
  const [tab, setTab] = useState<Tab>("descripcion");
  const [added, setAdded] = useState(false);

  const selectFlavor = (next: string) => {
    setFlavor(next);
    const firstSize = product.variants.find((v) => v.flavor === next);
    setVariantId(firstSize?.id ?? "");
    setQuantity(1);
  };

  const outOfStock = !variant || variant.stock === 0;

  const handleAdd = () => {
    if (!variant || outOfStock) return;
    addItem(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantLabel: `${variant.flavor} · ${variant.size}`,
        imageUrl: product.imageUrl,
        unitPrice: variant.price,
        maxStock: variant.stock,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-stone-100">
          <Image
            src={image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
          />
        </div>
        {product.gallery.length > 1 && (
          <div className="mt-3 flex gap-3">
            {product.gallery.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setImage(src)}
                aria-label={`Ver imagen de ${product.name}`}
                className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition ${
                  image === src ? "border-brand-600" : "border-transparent"
                }`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <span className="text-xs uppercase tracking-widest text-brand-600">
          {categoryName(product.category)}
        </span>
        <h1 className="serif mt-1 text-3xl">{product.name}</h1>
        <p className="mt-2 text-stone-600">{product.tagline}</p>
        <p className="mt-5 text-2xl font-semibold">
          {variant ? formatCOP(variant.price) : formatCOP(product.fromPrice)}
        </p>

        {flavors.length > 1 && (
          <div className="mt-6">
            <p className="label">Sabor</p>
            <div className="flex flex-wrap gap-2">
              {flavors.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectFlavor(option)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    flavor === option
                      ? "border-brand-600 bg-brand-50 text-brand-800"
                      : "border-stone-200 bg-white hover:border-brand-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5">
          <p className="label">Presentación</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={option.stock === 0}
                onClick={() => {
                  setVariantId(option.id);
                  setQuantity(1);
                }}
                className={`rounded-full border px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  variant?.id === option.id
                    ? "border-brand-600 bg-brand-50 text-brand-800"
                    : "border-stone-200 bg-white hover:border-brand-300"
                }`}
              >
                {option.size} · {formatCOP(option.price)}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm">
          {outOfStock ? (
            <span className="text-rose-600">Agotado por ahora — vuelve el viernes.</span>
          ) : variant.stock <= 10 ? (
            <span className="text-amber-700">
              Quedan {variant.stock} unidades de esta presentación.
            </span>
          ) : (
            <span className="text-emerald-700">Disponible ({variant.stock} en stock)</span>
          )}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-2 py-1.5">
            <button
              type="button"
              aria-label="Disminuir cantidad"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1 text-stone-600 hover:text-brand-700"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center text-sm">{quantity}</span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              disabled={!variant || quantity >= variant.stock}
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1 text-stone-600 hover:text-brand-700 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className="btn-primary flex-1 sm:flex-none"
          >
            {added ? (
              <>
                <Check className="h-4 w-4" /> Agregado
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" /> Agregar al carrito
              </>
            )}
          </button>
        </div>

        <div className="mt-8">
          <div className="flex gap-1 border-b border-stone-200">
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm transition ${
                  tab === item
                    ? "border-brand-600 text-brand-800"
                    : "border-transparent text-stone-500 hover:text-stone-700"
                }`}
              >
                {TAB_LABELS[item]}
              </button>
            ))}
          </div>

          <div className="pt-4 text-sm text-stone-600">
            {tab === "descripcion" && (
              <div className="space-y-3">
                <p>{product.description}</p>
                <p>
                  <span className="font-medium text-stone-800">Ingredientes: </span>
                  {product.ingredients}
                </p>
              </div>
            )}
            {tab === "nutricional" && (
              <table className="w-full text-sm">
                <tbody>
                  {product.nutrition.map((fact) => (
                    <tr key={fact.label} className="border-b border-stone-100">
                      <td className="py-2 text-stone-500">{fact.label}</td>
                      <td className="py-2 text-right font-medium text-stone-800">
                        {fact.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === "envio" && (
              <ul className="list-disc space-y-2 pl-5">
                <li>Conservar refrigerado entre 2 °C y 6 °C.</li>
                <li>Duración: 21 días sin abrir, 5 días una vez abierto.</li>
                <li>Despachos de martes a sábado en Bogotá y la sabana.</li>
                <li>Envío gratis en pedidos desde $90.000.</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
