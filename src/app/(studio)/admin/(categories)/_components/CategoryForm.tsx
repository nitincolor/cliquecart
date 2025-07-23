"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import toast from "react-hot-toast";
import ImageUpload from "../../_components/ImageUpload";
import { errorDialog } from "@/utils/confirmDialog";
import { createCategory, updateCategory } from "@/app/actions/category";

interface CategoryInput {
  title: string;
  slug: string;
  desc: string;
  image: File | null | string; // User-selected image
}

type CategoryProps = {
  category?: Category; // Existing category for editing
};

export default function CategoryForm({ category }: CategoryProps) {
  const { handleSubmit, control, watch, register, reset } =
    useForm<CategoryInput>({
      defaultValues: {
        title: category?.title || "", // Prefill title if editing
        slug: category?.slug || "", // Prefill slug
        desc: category?.description || "",
        image: category?.img || null, // New image will be stored here
      },
    });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const imageFile = watch("image");

  const onSubmit = async (data: CategoryInput) => {
    setIsLoading(true);

    try {
      const formData = new FormData();

      const slugified = data.slug
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");
      formData.append("title", data.title);
      formData.append("slug", slugified);
      formData.append("desc", data.desc);
      if (data.image instanceof File) {
        formData.append("image", data.image); // Only add file if selected
      } else if (typeof data.image === "string") {
        formData.append("image", data.image); // Only add file if selected
      }
      // ✅ Show error only if NO image is present
      if (!data.image && !category?.img) {
        return errorDialog("Image is required");
      }
      let result;
      if (category) {
        result = await updateCategory(category.id, formData);
      } else {
        result = await createCategory(formData);
      }
      if (result?.success) {
        toast.success(
          `Category ${category ? "updated" : "created"} successfully`
        );
        reset();
        router.push("/admin/categories");
      } else {
        toast.error(result?.message || "Failed to upload category");
      }
    } catch (error: any) {
      console.error("Error uploading category:", error);
      toast.error(error?.message || "Failed to upload category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-5 mb-5">
        {/* Title Input */}
        <Controller
          control={control}
          name="title"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Title"
                type="text"
                required
                error={!!fieldState.error}
                errorMessage="Title is required"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        {/* Slug Input */}
        <Controller
          control={control}
          name="slug"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Slug"
                type="text"
                required
                error={!!fieldState.error}
                errorMessage="Slug is required"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        {/* Description Input */}
        <div className="rounded-[10px] break-after-column">
          <label htmlFor="desc" className="block mb-1.5 text-sm text-gray-6">
            Description
          </label>
          <textarea
            {...register("desc")}
            id="desc"
            rows={5}
            placeholder="Notes about your order, e.g. special notes for delivery."
            className="w-full px-4 py-3 duration-200 border rounded-lg resize-none placeholder:font-normal placeholder:text-sm border-gray-3 placeholder:text-dark-5 outline-hidden focus:border-transparent "
          />
        </div>

        {/* preview image */}
        <Controller
          control={control}
          name="image"
          rules={{
            required: true,
          }}
          render={({ field, fieldState }) => (
            <ImageUpload
              label="Category Image (Recommended: 80x70)"
              images={
                imageFile ? [imageFile] : category?.img ? [category.img] : null
              }
              setImages={(files) => field.onChange(files?.[0] || null)}
              required={true}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </div>
      {/* Submit Button */}
      <button
        className={cn(
          "inline-flex items-center gap-2 font-normal text-white bg-blue py-3 px-4 rounded-lg text-sm ease-out duration-200 hover:bg-blue-dark",
          { "opacity-80 pointer-events-none": isLoading }
        )}
        disabled={isLoading}
      >
        {isLoading
          ? "Saving..."
          : category
          ? "Update Category"
          : "Save Category"}
      </button>
    </form>
  );
}
