"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import toast from "react-hot-toast";
import { CircleXIcon, PlusIcon } from "@/assets/icons";
import ThumbImageModal from "./ThumbImageModal";
import CustomAttributesModal from "./CustomProjectModal";
import AdditionalInfoModal from "./AdditionalInfoModal";
import { IProductAllField } from "../../types/product";
import QuillEditor from "../../_components/QuillEditor";
import { createProduct, updateProduct } from "@/app/actions/product";
import { generateSlug } from "@/utils/slugGenerate";
import { TagInput } from "@/components/ui/input/TagInput";

type ProductProps = {
  product?: Partial<IProductAllField>; // Optional for edit mode
  categories: Category[];
};

type ProductInput = Omit<
  IProductAllField,
  "id" | "createdAt" | "updatedAt" | "previewImage"
>;

export default function ProductAddForm({ product, categories }: ProductProps) {
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    register,
    reset,
    formState: { errors },
  } = useForm<ProductInput>({
    defaultValues: {
      title: product?.title || "",
      price: product?.price || 0,
      discountedPrice: product?.discountedPrice || 0,
      categoryId: product?.categoryId || "",
      tags: product?.tags || [],
      description: product?.description || "",
      shortDescription: product?.shortDescription || "",
      productVariants:
        product?.productVariants?.map((item) => ({
          color: item.color,
          size: item.size,
          image: typeof item.image === "string" ? item.image : null,
          isDefault: item.isDefault ? item.isDefault : false,
        })) || [],
      additionalInformation: product?.additionalInformation || null,
      customAttributes: product?.customAttributes || null,
      offers: product?.offers || [],
      slug: product?.slug || "",
      sku: product?.sku || "",
      quantity: product?.quantity || 0,
      body: product?.body || "",
    },
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const customAttributes = watch("customAttributes"); // Get custom attributes from form
  const [thumbModal, setThumbModal] = useState(false);
  const [additionalInfoModal, setAdditionalInfoModal] = useState(false);
  const [customAttrModal, setCustomAttrModal] = useState(false);
  const [tempProductvariant, setTempProductvariant] = useState<{
    color: string;
    image: File | null;
    size: string;
    isDefault: boolean;
  }>({ color: "", image: null, size: "", isDefault: false });
  const [tempAttribute, setTempAttribute] = useState({
    attributeName: "",
    attributeValues: [{ id: "", title: "" }],
  });

  // Open modal and reset temp data
  const openAdditionalInfoModal = () => {
    setAdditionalInfoModal(true);
  };

  // existing additional info
  const existingAdditionalInfo = watch("additionalInformation") || []; // Ensure it's an array
  const saveAdditionalInfo = (values: any) => {
    const prevAdditionalInfo = watch("additionalInformation") || [];
    setValue("additionalInformation", [...prevAdditionalInfo, ...values]); // Append new attribute
    setAdditionalInfoModal(false); // Close modal
  };
  // Open modal and reset temp data
  const openThumbModal = (onChange: (...event: any[]) => void) => {
    setTempProductvariant({
      color: "",
      image: null,
      size: "",
      isDefault: false,
    });
    setThumbModal(true);
  };
  // open custom attribute modal
  const openCustomAttrModal = () => {
    setTempAttribute({
      attributeName: "",
      attributeValues: [{ id: "", title: "" }],
    });
    setCustomAttrModal(true);
  };
  // save custom attribute
  const saveCustomAttribute = () => {
    const existingCustomAttributes = watch("customAttributes") || []; // Ensure it's an array

    // Validate that the attribute name is not empty
    if (!tempAttribute.attributeName.trim()) {
      toast.error("Attribute name is required!");
      return;
    }
    if (tempAttribute.attributeValues.length === 0) {
      toast.error("Attribute values are required!");
      return;
    }

    // Validate that all attribute values have both id and title
    const isValid = tempAttribute.attributeValues.every(
      (attr: { id: string; title: string }) =>
        attr.id.trim() && attr.title.trim()
    );

    if (!isValid) {
      toast.error("Each attribute value must have both an ID and a Title.");
      return;
    }

    // Save the attribute if validation passes
    setValue("customAttributes", [...existingCustomAttributes, tempAttribute]);
    setCustomAttrModal(false); // Close modal
  };
  const saveProductvariant = () => {
    const existingProductvariant = watch("productVariants") || [];

    if (tempProductvariant.image) {
      let newVariant = { ...tempProductvariant };

      // Check if there are any existing variants with isDefault=true
      const hasDefaultVariant = existingProductvariant.some(variant => variant.isDefault);

      if (!hasDefaultVariant) {
        // If no default variant exists, make the new one default
        newVariant.isDefault = true;
      } else {
        // If a default variant exists, ensure the new one is not default
        newVariant.isDefault = false;
      }

      setValue("productVariants", [...existingProductvariant, newVariant]);
      setThumbModal(false); // Close modal
    }
  };

  // Update the remove variant handler
  const removeVariant = (index: number) => {
    const updatedThumbnails = [...watch("productVariants")];
    const removedVariant = updatedThumbnails[index];
    updatedThumbnails.splice(index, 1);

    // If the removed variant was default and there are other variants,
    // make the first remaining variant the default
    if (removedVariant.isDefault && updatedThumbnails.length > 0) {
      updatedThumbnails[0].isDefault = true;
    }

    setValue("productVariants", updatedThumbnails);
  };

  // removeCustomAttr
  const removeCustomAttr = (index: number) => {
    const existingCustomAttributes = watch("customAttributes") || []; // Ensure it's an array
    const updatedCustomAttributes = existingCustomAttributes.filter(
      (_, i) => i !== index
    );
    setValue("customAttributes", updatedCustomAttributes);
  };

  // remove Additional Info
  const removeAdditionalInfo = (index: number) => {
    const existingAdditionalInfo = watch("additionalInformation") || []; // Ensure it's an array
    const updatedAdditionalInfo = existingAdditionalInfo.filter(
      (_, i) => i !== index
    );
    setValue("additionalInformation", updatedAdditionalInfo);
  };

  // submit product form
  const onSubmit = async (data: ProductInput) => {
    setIsLoading(true);

    try {
      if (Number(data.discountedPrice) > Number(data.price)) {
        return toast.error("Discounted Price cannot be greater than Price");
      }
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("price", data.price.toString());
      if (data.discountedPrice)
        formData.append("discountedPrice", data.discountedPrice.toString());
      formData.append("categoryId", data.categoryId.toString());
      if (!data.slug) {
        const slug = generateSlug(data.title);
        formData.append("slug", slug);
      } else {
        formData.append("slug", data.slug);
      }
      if (data.sku) formData.append("sku", data.sku);
      formData.append("shortDescription", data.shortDescription);
      formData.append("quantity", data.quantity.toString());

      if (data.description) formData.append("description", data.description);
      if (data.tags) formData.append("tags", JSON.stringify(data.tags));
      if (data.offers) formData.append("offers", JSON.stringify(data.offers));
      if (data.body) formData.append("body", data.body);

      // ✅ Fix: Send additionalInformation & customAttributes as JSON
      formData.append(
        "additionalInformation",
        JSON.stringify(data.additionalInformation || [])
      );
      formData.append(
        "customAttributes",
        JSON.stringify(data.customAttributes || [])
      );

      // Handle thumbnails
      if (data.productVariants.length === 0) {
        toast.error("At least one thumbnail is required");
        setIsLoading(false);
        return;
      }
      data.productVariants.forEach((thumb, index) => {
        if (thumb.image) {
          formData.append("thumbnails", thumb.image);
          formData.append(`color_${index}`, thumb.color);
          formData.append(`size_${index}`, thumb.size);
          formData.append(`isDefault_${index}`, thumb.isDefault.toString());
        }
      });
      let result;
      if (product && product.id) {
        result = await updateProduct(product.id, formData);
      } else {
        result = await createProduct(formData);
      }
      if (result?.success) {
        toast.success(
          `Product ${product ? "updated" : "created"} successfully`
        );
        reset();
        router.push("/admin/products");
      } else {
        toast.error(result?.message || "Failed to upload product");
      }
    } catch (error: any) {
      console.error("Error uploading product:", error);
      toast.error(error?.message || "Failed to upload product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5 mb-5">
          {/* name filed */}
          <Controller
            control={control}
            name="title"
            rules={{
              required: "Title is required",
            }}
            render={({ field, fieldState }) => (
              <InputGroup
                label="Title"
                type="text"
                placeholder="Enter your product title.."
                required
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                {...field}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />

          {/* Slug field */}
          <Controller
            control={control}
            name="slug"
            rules={{ required: false }}
            render={({ field }) => (
              <InputGroup
                label="Slug"
                type="text"
                placeholder="this-is-sample-slug"
                {...field}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />

          {/* description field */}
          <Controller
            control={control}
            name="description"
            rules={{ required: false }}
            render={({ field, fieldState }) => (
              <QuillEditor
                label="Description"
                value={field.value || ""}
                onChange={field.onChange}
              />
            )}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Short Description */}
            <Controller
              control={control}
              name="shortDescription"
              rules={{
                required: "Short Description is required",
              }}
              render={({ field, fieldState }) => (
                <InputGroup
                  label="Short Description"
                  type="text"
                  placeholder="Write short description"
                  {...field}
                  required
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />

            {/* category field */}

            <div>
              <label
                htmlFor="categoryId"
                className="block mb-1.5 text-sm text-gray-6"
              >
                Category <span className="text-red">*</span>
              </label>
              <div className="relative">
                <select
                  id="categoryId"
                  {...register("categoryId", {
                    required: "Category is required",
                    validate: (value) => value !== "" || "Category is required",
                  })}
                  className="rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
              {errors.categoryId && (
                <p className="text-sm text-red mt-1.5">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* price field */}
            <Controller
              control={control}
              name="price"
              rules={{
                required: "Price is required",
                validate: (value) =>
                  value > 0 || "Price must be greater than 0",
              }}
              render={({ field, fieldState }) => (
                <InputGroup
                  label="Price"
                  type="number"
                  required
                  error={!!fieldState.error}
                  errorMessage="Price is required"
                  {...field}
                  onChange={field.onChange}
                  min={0}
                  value={field.value}
                />
              )}
            />

            {/* discounted price */}
            <Controller
              control={control}
              name="discountedPrice"
              rules={{
                required: false,
              }}
              render={({ field }) => (
                <InputGroup
                  label="Discounted Price"
                  type="number"
                  {...field}
                  onChange={field.onChange}
                  min={0}
                  value={field.value}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* offers field */}
            <TagInput
              name="offers"
              label="Enter Multiple Offers"
              control={control}
            />

            {/* Tags field */}
            <TagInput
              name="tags"
              label="Enter Multiple Tags"
              control={control}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* SKU */}
            <Controller
              control={control}
              name="sku"
              render={({ field }) => (
                <InputGroup
                  label="SKU"
                  type="text"
                  {...field}
                  onChange={field.onChange}
                />
              )}
            />

            {/* Quantity */}
            <Controller
              control={control}
              name="quantity"
              rules={{
                required: "Quantity is required",
                validate: (value) =>
                  value > 0 || "Quantity must be greater than 0",
              }}
              render={({ field }) => (
                <InputGroup
                  label="Quantity"
                  type="number"
                  {...field}
                  onChange={field.onChange}
                  error={!!errors.quantity}
                  errorMessage={errors.quantity?.message as string}
                  min={0}
                />
              )}
            />
          </div>

          {/* Show Thumbnails */}

          <Controller
            control={control}
            name="productVariants"
            rules={{
              validate: (value) =>
                (value.length > 0 &&
                  value.every((item) => item.image && item.color)) ||
                "At least one thumbnail with an image and color is required.",
            }}
            render={({ field }) => (
              <>
                <div>
                  <label
                    htmlFor="thumbnails"
                    className="block mb-1.5 text-gray-6 text-sm"
                  >
                    Product Variants <span className="text-red">*</span>
                  </label>

                  {field.value?.length > 0 ? (
                    <div className="overflow-x-auto border rounded-lg border-gray-3">
                      <table className="w-full text-sm text-left ">
                        <thead>
                          <tr className="bg-gray-2 text-gray-6">
                            <th className="p-3 text-sm font-medium rounded-tl-lg">
                              Thumbnail
                            </th>
                            <th className="p-3 text-sm font-medium">Color</th>
                            <th className="p-3 text-sm font-medium">Size</th>
                            <th className="p-3 text-sm font-medium">
                              Is Default
                            </th>
                            <th className="p-3 text-sm font-medium rounded-tr-lg">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {field.value.map((thumb, index) => (
                            <tr key={index} className="border-t border-gray-3">
                              {/* Thumbnail Image */}
                              <td className="p-3">
                                <div>
                                  <Image
                                    src={
                                      thumb.image instanceof File
                                        ? URL.createObjectURL(thumb.image)
                                        : thumb.image!
                                    }
                                    alt="Thumbnail"
                                    className="object-cover w-20 h-20 rounded"
                                    width={64}
                                    height={64}
                                  />
                                </div>
                              </td>

                              {/* Color */}
                              <td className="p-3 text-gray-7 whitespace-nowrap">
                                {thumb.color}
                              </td>

                              {/* Size */}
                              <td className="p-3 text-gray-7 whitespace-nowrap">
                                {thumb.size}
                              </td>

                              {/* Is Default */}
                              <td className="p-3 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 border rounded-md accent-blue-600 border-gray-4 focus:ring-0 focus:ring-transparent"
                                  checked={thumb.isDefault}
                                  onChange={() => {
                                    const updated = field.value.map(
                                      (item, idx) => ({
                                        ...item,
                                        isDefault: idx === index, // Only the clicked item is default
                                      })
                                    );
                                    field.onChange(updated);
                                  }}
                                />
                              </td>

                              {/* Action */}
                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() => removeVariant(index)}
                                  className="flex items-center justify-center border rounded-lg w-9 h-9 bg-gray-2 border-gray-3 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
                                >
                                  <CircleXIcon />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-[11px] text-center text-gray-500 text-sm border rounded-lg border-gray-3 bg-white">
                      No items
                    </div>
                  )}

                  {/* Error Message */}
                  {errors.productVariants && field.value?.length === 0 && (
                    <p className="text-sm text-red mt-1.5">
                      {errors.productVariants.message as string}
                    </p>
                  )}

                  {/* Add Thumbnail Button */}
                  <button
                    type="button"
                    onClick={() => openThumbModal(field.onChange)}
                    className="mt-2.5 hover:bg-darkLight rounded-lg text-sm font-normal border border-gray-3 bg-dark text-white inline-flex py-2.5 px-5  items-center justify-center"
                  >
                    <span className="mr-2">
                      <PlusIcon width="12" height="12" />
                    </span>
                    <span>Add item</span>
                  </button>
                </div>
              </>
            )}
          />

          {/* Custom Attributes */}
          <div>
            <label
              htmlFor="customAttributes"
              className="block mb-1.5 text-sm text-gray-6"
            >
              Custom Attributes
            </label>
            {Array.isArray(customAttributes) && customAttributes.length > 0 ? (
              <div className="p-3 space-y-2 border rounded-lg border-gray-3">
                {customAttributes.map((attribute, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white border rounded-lg shadow-lg border-gray-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-gray-7">
                        {attribute.attributeName}
                      </p>

                      {/* Remove Attribute Button */}
                      <button
                        onClick={() => removeCustomAttr(index)}
                        className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-gray-2 border border-gray-3 ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
                      >
                        <span className="sr-only">
                          Remove from custom attributes
                        </span>

                        <CircleXIcon />
                      </button>
                    </div>

                    {/* Attribute Values List */}
                    {attribute.attributeValues.length > 0 ? (
                      <ul className="mt-2 space-y-3">
                        {attribute.attributeValues.map(
                          (attr: any, attrIndex: number) => (
                            <li
                              key={attrIndex}
                              className="flex items-center justify-between transition-all rounded-md bg-gray-50 hover:bg-gray-200"
                            >
                              <span className="text-gray-600">
                                {`${attrIndex + 1}.`} {attr.title}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <div className="p-3 text-center text-gray-500 border rounded-md border-gray-3 bg-gray-1">
                        No items
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-[11px] text-center text-gray-500 text-sm border rounded-lg border-gray-3 bg-white">
                No attributes added yet.
              </div>
            )}

            {/* Add custom attribute Button */}

            <button
              type="button"
              onClick={openCustomAttrModal}
              className="mt-2.5 rounded-lg border text-sm font-normal border-gray-3 placeholder:text-dark-5 inline-flex py-2.5 px-5 outline-hidden duration-200  items-center justify-center bg-dark hover:bg-darkLight text-white"
            >
              <span className="mr-2">
                <PlusIcon width="12" height="12" />
              </span>
              <span>Add item</span>
            </button>
          </div>

          {/* additional information */}
          <div>
            <label
              htmlFor="thumbnails"
              className="block mb-1.5 text-sm text-gray-6"
            >
              Additional Information
            </label>

            {existingAdditionalInfo?.length > 0 ? (
              <div className="">
                {existingAdditionalInfo.map((item: any, index) => (
                  <div
                    key={index}
                    className="relative flex items-center justify-between p-3 mb-3 border rounded-md border-gray-3 bg-gray-1"
                  >
                    {/* additional information name */}
                    <p className="text-sm text-gray-600">{item.name}</p>

                    {/* additional information description */}
                    <p className="text-sm text-gray-600">{item.description}</p>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeAdditionalInfo(index)}
                      className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-gray-2 border border-gray-3 ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
                    >
                      <CircleXIcon />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-[11px] text-center text-gray-500 text-sm border rounded-lg border-gray-3 bg-white">
                No items
              </div>
            )}

            {/* Add Thumbnail Button */}
            <button
              type="button"
              onClick={openAdditionalInfoModal}
              className="mt-2.5 rounded-lg px-5 text-sm font-normal border border-gray-3 bg-dark text-white placeholder:text-dark-5 inline-flex py-2.5 outline-hidden duration-200  items-center hover:bg-darkLight justify-center"
            >
              <span className="mr-2">
                <PlusIcon width="12" height="12" />
              </span>
              <span>Add item</span>
            </button>
          </div>

          {/* body */}
          <Controller
            control={control}
            name="body"
            rules={{ required: false }}
            render={({ field }) => (
              <QuillEditor
                label="Body"
                value={field.value || ""}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={cn(
            "inline-flex items-center gap-2 font-normal text-sm text-white bg-blue py-3 px-4 rounded-lg  ease-out duration-200 hover:bg-blue-dark",
            { "opacity-80 pointer-events-none": isLoading }
          )}
          disabled={isLoading}
        >
          {isLoading
            ? "Saving..."
            : product
            ? "Update Product"
            : "Save Product"}
        </button>
      </form>

      {thumbModal && (
        <ThumbImageModal
          isOpen={thumbModal}
          closeModal={() => setThumbModal(false)}
          tempProductvariant={tempProductvariant}
          setTempProductvariant={setTempProductvariant}
          saveProductvariant={saveProductvariant}
        />
      )}

      <CustomAttributesModal
        closeModal={() => setCustomAttrModal(false)}
        isOpen={customAttrModal}
        tempAttribute={tempAttribute}
        setTempAttribute={setTempAttribute}
        saveCustomAttribute={saveCustomAttribute}
      />

      <AdditionalInfoModal
        saveAdditionalInfo={saveAdditionalInfo}
        isOpen={additionalInfoModal}
        closeModal={() => setAdditionalInfoModal(false)}
      />
    </div>
  );
}

