"use client";
import { Order } from "@/types/order";
import axios from "axios";
import { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";
import OrderModal from "./OrderModal";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const toggleModal = (status: boolean, orderItem?: any) => {
    setShowDetails(status);
    setShowEdit(status);
    if (status && orderItem) {
      setSelectedOrder(orderItem);
    }
  };

  async function fetchOrders() {
    try {
      const response = await axios.get("/api/order");
      setOrders(response?.data?.orders);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <div className="w-full overflow-x-auto">
        {loading ? (
          <p className="py-6 text-center">Loading...</p>
        ) : orders?.length === 0 ? (
          <p className="py-6 text-center">No orders found.</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-gray-3">
                    <th className="px-6 py-3 font-medium text-custom-sm text-gray-6">
                      Order
                    </th>
                    <th className="px-6 py-3 font-medium text-custom-sm text-gray-6">
                      Date
                    </th>
                    <th className="px-6 py-3 font-medium text-custom-sm text-gray-6">
                      Status
                    </th>
                    <th className="px-6 py-3 font-medium text-custom-sm text-gray-6">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 font-medium text-custom-sm text-gray-6">
                      Total
                    </th>
                    <th className="px-6 py-3 font-medium text-custom-sm text-gray-6">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-3">
                  {orders.map((orderItem, key) => (
                    <SingleOrder
                      key={key}
                      orderItem={orderItem}
                      onViewDetails={(order) => {
                        setSelectedOrder(order);
                        setShowDetails(true);
                        setShowEdit(false);
                      }}
                      onEdit={(order) => {
                        setSelectedOrder(order);
                        setShowEdit(true);
                        setShowDetails(false);
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {selectedOrder && (
        <OrderModal
          showDetails={showDetails}
          showEdit={showEdit}
          toggleModal={(status: boolean) => toggleModal(status)}
          order={selectedOrder}
        />
      )}
    </>
  );
};

export default Orders;
