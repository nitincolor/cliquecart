"use server";

import { authenticate } from "@/lib/auth";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinaryUpload";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { revalidateTag } from "next/cache";

// create a category 
export async function createCategory(formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    // get form data
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const file = formData.get("image") as File;
    const desc = formData.get("desc") as string;

    // check if required fields are present
    if (!title || !slug || !file) {
      return errorResponse(400, "Title and slug are required");
    }

    // Check if the category already exists (case-insensitive)
    const existingCategory = await prisma.category.findFirst({
      where: {
        title: {
          equals: title,
          mode: "insensitive",
        },
      },
    });

    // return error if category already exists
    if (existingCategory) {
      return errorResponse(400, "Category title already exists");
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadImageToCloudinary(file, "categories");

    // Save category to database
    const category = await prisma.category.create({
      data: {
        title,
        slug,
        description: desc,
        img: imageUrl,
      },
    });
    revalidateTag("categories");
    return successResponse(201, "Category created successfully", category);
  } catch (error: any) {
    console.error("Error creating category:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};

// delete a category 
export async function deleteCategory(categoryId: number) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!categoryId) {
      return errorResponse(400, "Category ID is required");
    }

    // Find the category
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return errorResponse(404, "Category not found");
    }

    // Delete the image from Cloudinary
    await deleteImageFromCloudinary(category.img);

    // Delete category from database
    await prisma.category.delete({ where: { id: categoryId } });

    revalidateTag("categories");
    return successResponse(200, "Category deleted successfully");
  } catch (error: any) {
    console.error("Error deleting category:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
};

// update a category 
export async function updateCategory(categoryId: number, formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!categoryId) {
      return errorResponse(400, "Category ID is required");
    };

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const file = formData.get("image"); // Get the file
    const desc = formData.get("desc") as string;

    if (!title || !slug) {
      return errorResponse(400, "Title and slug are required");
    }

    // **Find the existing category**
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return errorResponse(404, "Category not found");
    }

    let imageUrl = category.img; // Default to existing image

    if (file instanceof File) {
      // **Delete old image only if it exists**
      if (category.img) {
        try {
          await deleteImageFromCloudinary(category.img);
        } catch (err) {
          console.error("Error deleting old image from Cloudinary:", err);
        }
      }

      // **Upload new image**
      imageUrl = await uploadImageToCloudinary(file, "categories");
    }

    // **Update category in database**
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        title,
        slug,
        description: desc,
        img: imageUrl,
      },
    });

    revalidateTag("categories");

    return successResponse(
      200,
      "Category updated successfully",
      updatedCategory
    );
  } catch (error: any) {
    console.error("Error updating category:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}