"use server";

import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";

// status update
export const updateOrderStatus = async (
  orderId: string,
  status: "pending" | "processing" | "delivered" | "cancel"
) => {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!orderId) {
      return errorResponse(400, "Order ID is required");
    }

    // **Find the existing orderItem**
    const orderItem = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!orderItem) {
      return errorResponse(404, "Order not found");
    }

    // Update order with provided fields
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        shippingStatus: status,
      },
    });

    revalidateTag("orders");

    return successResponse(
      200,
      "Order status updated successfully",
      updatedOrder
    );
  } catch (error: any) {
    console.error("Error updating order status:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};
