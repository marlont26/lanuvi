import type { NutritionFact } from "./mock-data";

export type VariantView = {
  id: string;
  flavor: string;
  size: string;
  price: number;
  stock: number;
};

export type ProductView = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  imageUrl: string;
  gallery: string[];
  nutrition: NutritionFact[];
  ingredients: string;
  featured: boolean;
  active: boolean;
  variants: VariantView[];
  /** Cheapest variant price, used for listings and sorting. */
  fromPrice: number;
  totalStock: number;
};

export type OrderItemView = {
  id: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
};

export type OrderView = {
  id: string;
  code: string;
  token: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: string;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  items: OrderItemView[];
};
