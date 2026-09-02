import { CATEGORY_SLUGS } from "./catalog";

export type VariantInput = {
  id?: string;
  flavor: string;
  size: string;
  price: number;
  stock: number;
};

export type ProductInput = {
  name: string;
  tagline: string;
  description: string;
  category: string;
  imageUrl: string;
  gallery: string[];
  ingredients: string;
  featured: boolean;
  active: boolean;
  variants: VariantInput[];
};

export function slugify(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "producto";
}

/** Validates an admin product payload, returning either the clean input or errors. */
export function parseProductInput(
  raw: unknown,
): { ok: true; value: ProductInput } | { ok: false; error: string } {
  const body = (raw ?? {}) as Record<string, unknown>;
  const name = String(body.name ?? "").trim();
  const category = String(body.category ?? "").trim();
  const imageUrl = String(body.imageUrl ?? "").trim();
  const rawVariants = Array.isArray(body.variants) ? body.variants : [];

  if (!name) return { ok: false, error: "El nombre es obligatorio." };
  if (!CATEGORY_SLUGS.includes(category as never)) {
    return { ok: false, error: "Categoría inválida." };
  }
  if (!imageUrl) return { ok: false, error: "La URL de la imagen es obligatoria." };
  if (rawVariants.length === 0) {
    return { ok: false, error: "Agrega al menos una presentación." };
  }

  const variants: VariantInput[] = [];
  for (const entry of rawVariants) {
    const variant = (entry ?? {}) as Record<string, unknown>;
    const flavor = String(variant.flavor ?? "").trim() || "Único";
    const size = String(variant.size ?? "").trim();
    const price = Number(variant.price);
    const stock = Number(variant.stock);
    if (!size) return { ok: false, error: "Cada presentación necesita un tamaño." };
    if (!Number.isInteger(price) || price < 1) {
      return {
        ok: false,
        error: `El precio de la presentación ${size} debe ser un entero en pesos mayor a cero.`,
      };
    }
    if (!Number.isInteger(stock) || stock < 0) {
      return { ok: false, error: `Stock inválido para la presentación ${size}.` };
    }
    if (variants.some((v) => v.flavor === flavor && v.size === size)) {
      return { ok: false, error: `La presentación ${flavor} · ${size} está repetida.` };
    }
    variants.push({
      id: typeof variant.id === "string" && variant.id ? variant.id : undefined,
      flavor,
      size,
      price,
      stock,
    });
  }

  const gallery = Array.isArray(body.gallery)
    ? body.gallery.map((item) => String(item).trim()).filter(Boolean)
    : [];

  return {
    ok: true,
    value: {
      name,
      tagline: String(body.tagline ?? "").trim(),
      description: String(body.description ?? "").trim(),
      category,
      imageUrl,
      gallery: gallery.length ? gallery : [imageUrl],
      ingredients: String(body.ingredients ?? "").trim(),
      featured: Boolean(body.featured),
      active: body.active === undefined ? true : Boolean(body.active),
      variants,
    },
  };
}
