import { getOrders } from "@/get-api-data/order";
import OrderLists from "./_components/OrderLists";

export default async function OrderPage() {
  const orderData = await getOrders();
  return (
    <div className="mx-auto bg-white border rounded-2xl border-gray-3 max-w-7xl">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-base font-semibold text-dark">All Orders</h2>
      </div>
      <div>
        <OrderLists orderData={orderData} />
      </div>
    </div>
  );
}
