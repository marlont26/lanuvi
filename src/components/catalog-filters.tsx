"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { CATEGORIES, PRICE_RANGES } from "@/lib/catalog";

export const SORT_OPTIONS = [
  { id: "destacados", label: "Destacados" },
  { id: "precio-asc", label: "Precio: menor a mayor" },
  { id: "precio-desc", label: "Precio: mayor a menor" },
  { id: "nombre", label: "Nombre A–Z" },
] as const;

export function CatalogFilters({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get("categoria") ?? "";
  const price = params.get("precio") ?? "todos";
  const sort = params.get("orden") ?? "destacados";
  const [search, setSearch] = useState(params.get("q") ?? "");

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(next.toString() ? `/productos?${next}` : "/productos", {
      scroll: false,
    });
  };

  useEffect(() => {
    const current = params.get("q") ?? "";
    if (search === current) return;
    const timeout = setTimeout(() => update("q", search), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasFilters = Boolean(category || params.get("q") || price !== "todos");

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar yogur, mermelada, postre…"
          aria-label="Buscar productos"
          className="field pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => update("categoria", "")}
          className={`rounded-full border px-3 py-1.5 text-sm transition ${
            category === ""
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-stone-200 bg-white text-stone-700 hover:border-brand-300"
          }`}
        >
          Todo
        </button>
        {CATEGORIES.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => update("categoria", item.slug)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              category === item.slug
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-stone-200 bg-white text-stone-700 hover:border-brand-300"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-stone-600">
          Precio
          <select
            value={price}
            onChange={(event) => update("precio", event.target.value)}
            className="field w-auto py-1.5"
          >
            {PRICE_RANGES.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-600">
          Orden
          <select
            value={sort}
            onChange={(event) => update("orden", event.target.value)}
            className="field w-auto py-1.5"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-stone-500">{resultCount} productos</span>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              router.replace("/productos", { scroll: false });
            }}
            className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
          >
            <X className="h-3.5 w-3.5" /> Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
