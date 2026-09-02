import { ProductManager } from "@/components/admin/product-manager";
import { getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts({ includeInactive: true });
  return <ProductManager products={products} />;
}
