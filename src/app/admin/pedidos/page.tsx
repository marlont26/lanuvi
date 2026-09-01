import { OrderTable } from "@/components/admin/order-table";
import { getOrders } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return <OrderTable orders={orders} />;
}
