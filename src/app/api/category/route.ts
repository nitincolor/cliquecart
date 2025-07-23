import { NextRequest } from "next/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/sendResponse";
import { prisma } from "@/lib/prismaDB";
import { authenticate } from "@/lib/auth";


/* 
 * Get all categories
 * @param id: number
 * @returns categories
*/
export async function GET(request: NextRequest) {
  try {
    const session = await authenticate();
    const categories = await prisma.category.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        img: true,
      },
    });

    if (!categories || categories.length === 0) {
      return sendErrorResponse(404, "No categories found");
    }

    return sendSuccessResponse(200, "Categories retrieved successfully", categories);
  } catch (error: any) {
    console.error("Error retrieving categories:", error);
    return sendErrorResponse(500, error?.message || "Internal server error");
  }
};

