"use client";
import usePagination from "@/hooks/usePagination";
import Pagination from "@/components/Common/Pagination";
import SingleOrder from "@/components/Orders/SingleOrder";
import { useState } from "react";
import OrderModal from "@/components/Orders/OrderModal";

export default function OrderLists({ orderData }: any) {
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

  const { currentItems, handlePageClick, pageCount } = usePagination(
    orderData,
    10
  );

  return (
    <>
      <div className="w-full ">
        {currentItems?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              {/* <!-- order item --> */}
              <thead>
                <tr className="border-y border-gray-3">
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm">
                    Order
                  </th>
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm">
                    Name
                  </th>
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm">
                    Email
                  </th>
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm">
                    Date
                  </th>
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm">
                    Status
                  </th>
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm">
                    Payment Method
                  </th>
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm">
                    Total
                  </th>
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-right text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {orderData?.length > 0 &&
                  orderData.map((orderItem: any, key: number) => (
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
                      showAll={true}
                    />
                  ))}
              </tbody>
            </table>
            {/* Pagination */}
            {orderData?.length > 10 && (
              <div className="flex justify-center pb-6 pagination">
                <Pagination
                  handlePageClick={handlePageClick}
                  pageCount={pageCount}
                />
              </div>
            )}
          </div>
        ) : (
          <p>You don&apos;t have any orders!</p>
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
}
