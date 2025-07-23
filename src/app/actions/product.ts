"use server";

import { authenticate } from "@/lib/auth";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/lib/cloudinaryUpload";
import { prisma } from "@/lib/prismaDB";
import { errorResponse, successResponse } from "@/lib/response";
import { AdditionalInformation, AttributeValue } from "@prisma/client";
import { revalidateTag } from "next/cache";

// create a product
export async function createProduct(formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");
    // get form data
    const title = formData.get("title") as string;
    const price = parseFloat(formData.get("price") as string);
    const discountedPrice = formData.get("discountedPrice")
      ? parseFloat(formData.get("discountedPrice") as string)
      : null;
    const categoryId = formData.get("categoryId") as string;
    const slug = formData.get("slug") as string;
    const sku = formData.get("sku") as string | undefined;
    const shortDescription = formData.get("shortDescription") as string;
    const quantity = parseInt(formData.get("quantity") as string, 10);
    const description = formData.get("description") as string | undefined;
    const body = formData.get("body") as string | undefined;

    // Parse JSON fields
    const tags = JSON.parse((formData.get("tags") as string) || "[]");
    const offers = JSON.parse((formData.get("offers") as string) || "[]");
    const additionalInformation = JSON.parse(
      (formData.get("additionalInformation") as string) || "[]"
    );
    const customAttributes = JSON.parse(
      (formData.get("customAttributes") as string) || "[]"
    );

    // **Validation**
    if (
      !title ||
      !slug ||
      !shortDescription ||
      isNaN(price) ||
      isNaN(quantity)
    ) {
      return errorResponse(400, "Missing required fields");
    }

    // **Handle Thumbnails (At least one required)**
    const thumbnailFiles = formData.getAll("thumbnails");
    if (thumbnailFiles.length === 0)
      return errorResponse(400, "At least one thumbnail is required");

    const product_variants: {
      color: string;
      image: string;
      size: string;
      isDeault: boolean;
    }[] = [];

    for (let i = 0; i < thumbnailFiles.length; i++) {
      const file = thumbnailFiles[i] as File;
      const color = formData.get(`color_${i}`) as string;
      const size = formData.get(`size_${i}`) as string;
      const isDeaultRaw = formData.get(`isDefault_${i}`);
      const isDeault = isDeaultRaw === "true";

      if (file) {
        const imageUrl = await uploadImageToCloudinary(file, "products");
        product_variants.push({ color, image: imageUrl, size, isDeault });
      }
    }

    // ✅ Ensure one is marked default
    const hasDefault = product_variants.some((v) => v.isDeault);
    if (!hasDefault && product_variants.length > 0) {
      product_variants[0].isDeault = true;
    }

    // Create the product in the database
    const product = await prisma.product.create({
      data: {
        title,
        price,
        discountedPrice,
        categoryId: Number(categoryId),
        tags,
        description,
        shortDescription,
        offers,
        slug,
        sku,
        body,
        quantity,
        productVariants: {
          create: product_variants.map((thumbnail) => ({
            color: thumbnail.color,
            image: thumbnail.image,
            size: thumbnail.size,
            isDefault: thumbnail.isDeault,
          })),
        },
        additionalInformation: {
          create: additionalInformation.map((info: AdditionalInformation) => ({
            name: info.name,
            description: info.description,
          })),
        },
        customAttributes: {
          create: customAttributes.map((attr: any) => ({
            attributeName: attr.attributeName,
            attributeValues: {
              create: attr.attributeValues.map((value: AttributeValue) => ({
                id: value.id,
                title: value.title,
              })),
            },
          })),
        },
      },
    });

    revalidateTag("products");

    return successResponse(201, "Product created successfully", {
      ...product,
      price: product.price.toNumber(),
      discountedPrice: product.discountedPrice
        ? product.discountedPrice.toNumber()
        : null,
    });
  } catch (error: any) {
    console.error("Error creating product:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}

// delete a product
export async function deleteProduct(productId: string) {
  try {
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");

    if (!productId) return errorResponse(400, "Product ID is required");

    // **Check if product exists**
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productVariants: true,
        customAttributes: true,
        additionalInformation: true,
      },
    });

    if (!existingProduct) return errorResponse(404, "Product not found");

    // **Delete related fields first**

    // Delete custom attributes and associated attribute values
    await prisma.attributeValue.deleteMany({
      where: {
        attributeId: {
          in: await prisma.customAttribute
            .findMany({
              where: { productId },
              select: { id: true },
            })
            .then((res) => res.map((attr) => attr.id)),
        },
      },
    });

    await prisma.customAttribute.deleteMany({
      where: { productId },
    });

    // Delete additional information
    await prisma.additionalInformation.deleteMany({
      where: { productId },
    });

    // **Delete thumbnails from Cloudinary and Database**
    const thumbnailImages = existingProduct.productVariants;
    if (thumbnailImages && thumbnailImages.length > 0) {
      for (const thumbnail of thumbnailImages) {
        if (thumbnail.image) {
          // Delete each thumbnail image from Cloudinary
          await deleteImageFromCloudinary(thumbnail.image);
        }
      }

      // Now, delete the thumbnails from the database
      await prisma.productVariant.deleteMany({
        where: { productId },
      });
    }

    // **Delete product**
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidateTag("products");
    return successResponse(
      200,
      "Product and related data deleted successfully"
    );
  } catch (error: any) {
    console.error("Error deleting product:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}

// update a product
export async function updateProduct(productId: string, formData: FormData) {
  try {
    // check if user is authenticated
    const session = await authenticate();
    if (!session) return errorResponse(401, "Unauthorized");
    // get form data
    const title = formData.get("title") as string;
    const price = parseFloat(formData.get("price") as string);
    const discountedPrice = formData.get("discountedPrice")
      ? parseFloat(formData.get("discountedPrice") as string)
      : null;
    const categoryId = formData.get("categoryId") as string;
    const slug = formData.get("slug") as string;
    const sku = formData.get("sku") as string | null;
    const shortDescription = formData.get("shortDescription") as string;
    const quantity = parseInt(formData.get("quantity") as string, 10);
    const description = formData.get("description") as string | undefined;
    const body = formData.get("body") as string | undefined;

    // Parse JSON fields
    const tags = JSON.parse((formData.get("tags") as string) || "[]");
    const offers = JSON.parse((formData.get("offers") as string) || "[]");
    const additionalInformation = JSON.parse(
      (formData.get("additionalInformation") as string) || "[]"
    );
    const customAttributes = JSON.parse(
      (formData.get("customAttributes") as string) || "[]"
    );

    // **Validation**
    if (
      !productId ||
      !title ||
      !slug ||
      !shortDescription ||
      isNaN(price) ||
      isNaN(quantity)
    ) {
      return errorResponse(400, "Missing required fields");
    }

    // **Check if product exists**
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productVariants: true,
        additionalInformation: true,
        customAttributes: true,
      },
    });

    if (!existingProduct) return errorResponse(404, "Product not found");

    // **Handle Thumbnails (Optional)**
    const thumbnailFiles = formData.getAll("thumbnails");
    
    if (thumbnailFiles.length > 0) {

      const newFileUploads = thumbnailFiles.filter(
        (file) => file instanceof File
      ); // Check if any new files are uploaded
      // Proceed only if new images are uploaded
     
      if(newFileUploads.length > 0) {
         // Step 1: Fetch existing thumbnails
        const existingThumbnails = await prisma.productVariant.findMany({
          where: { productId },
          select: { image: true }, // Get only the image URLs
        });

        // Step 2: Delete old images from Cloudinary
        if (existingThumbnails.length > 0) {
          for (const thumb of existingThumbnails) {
            await deleteImageFromCloudinary(thumb.image);
          }
        }
      }

      // Step 3: Delete old thumbnails from the database
      await prisma.productVariant.deleteMany({ where: { productId } });

      // Step 4: Upload new thumbnails
      const newThumbnails: {
        color: string;
        image: string;
        size: string;
        isDeault: boolean;
      }[] = [];

      for (let i = 0; i < thumbnailFiles.length; i++) {
        const file = thumbnailFiles[i];
        const color = formData.get(`color_${i}`) as string;
        const size = formData.get(`size_${i}`) as string;
        const isDeaultRaw = formData.get(`isDefault_${i}`);
        const isDeault = isDeaultRaw === "true";

        if (file instanceof File) {
          const imageUrl = await uploadImageToCloudinary(file, "products"); // Upload new image
          newThumbnails.push({ color, image: imageUrl, size, isDeault });
        } else if (typeof file === "string") {
          newThumbnails.push({ color, image: file, size, isDeault }); // Keep existing image (if passed)
        }
      }

      // Step 5: Insert new thumbnails into the database
      await prisma.productVariant.createMany({
        data: newThumbnails.map((thumbnail) => ({
          color: thumbnail.color,
          image: thumbnail.image,
          size: thumbnail.size,
          isDefault: thumbnail.isDeault,
          productId,
        })),
      });
    };


    // **Update Additional Information**
    await prisma.additionalInformation.deleteMany({ where: { productId } });

    if (additionalInformation.length > 0) {
      await prisma.additionalInformation.createMany({
        data: additionalInformation.map((info: any) => ({
          name: info.name,
          description: info.description,
          productId,
        })),
      });
    }

    // **Update Custom Attributes**
    // Delete old custom attributes and associated attribute values
    // Step 1: Delete associated attribute values first (if any)
    await prisma.attributeValue.deleteMany({
      where: {
        attributeId: {
          in: await prisma.customAttribute
            .findMany({ where: { productId }, select: { id: true } })
            .then((res) => res.map((attr) => attr.id)),
        },
      },
    });

    // Step 2: Delete custom attributes
    await prisma.customAttribute.deleteMany({
      where: { productId },
    });

    // await prisma.customAttribute.deleteMany({ where: { productId } });

    // Create new custom attributes and attribute values
    for (const attr of customAttributes) {
      // Create the custom attribute
      const createdAttribute = await prisma.customAttribute.create({
        data: {
          attributeName: attr.attributeName,
          productId,
        },
      });

      // Create attribute values for the custom attribute
      if (attr.attributeValues && attr.attributeValues.length > 0) {
        await prisma.attributeValue.createMany({
          data: attr.attributeValues.map((value: any) => ({
            id: value.id,
            title: value.title,
            attributeId: createdAttribute.id, // Associate the values with the created custom attribute
          })),
        });
      }
    }

    // **Update Product**
    const updated_product = await prisma.product.update({
      where: { id: productId },
      data: {
        title,
        price,
        discountedPrice,
        categoryId: Number(categoryId),
        tags,
        description,
        shortDescription,
        offers,
        slug,
        sku: sku || undefined,
        body,
        quantity,
      },
    });

    revalidateTag("products");
    return successResponse(200, "Product updated successfully", {
      ...updated_product,
      price: updated_product.price.toNumber(),
      discountedPrice: updated_product.discountedPrice
        ? updated_product.discountedPrice.toNumber()
        : null,
    });
  } catch (error: any) {
    console.error("Error updating product:", error?.stack || error);
    return errorResponse(500, error?.message || "Internal server error");
  }
}
