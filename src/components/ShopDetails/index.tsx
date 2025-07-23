"use client";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import {
  CircleCheckIcon,
  FullScreenIcon,
  MinusIcon,
  PlusIcon,
} from "@/assets/icons";
import { updateproductDetails } from "@/redux/features/product-details";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { IProductByDetails } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useShoppingCart } from "use-shopping-cart";

import PreLoader from "../Common/PreLoader";
import ReviewStar from "../Shop/ReviewStar";
import DetailsTabs from "./DetailsTabs";
import toast from "react-hot-toast";
import { formatPrice } from "@/utils/formatePrice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { useRouter } from "next/navigation";

type SelectedAttributesType = {
  [key: number]: string | undefined;
};

type IProps = {
  product: IProductByDetails;
  avgRating: number;
  totalRating: number;
};

const ShopDetails = ({ product, avgRating, totalRating }: IProps) => {
  const defaultVariant = product?.productVariants?.find(
    (variant) => variant.isDefault
  );
  const { openPreviewModal } = usePreviewSlider();
  const router = useRouter();
  const [previewImg, setPreviewImg] = useState(defaultVariant?.image);
  const [quantity, setQuantity] = useState(1);
  const [activeColor, setActiveColor] = useState(defaultVariant?.color);
  const [activeSize, setActiveSize] = useState(defaultVariant?.size);
  const [selectedAttributes, setSelectedAttributes] =
    useState<SelectedAttributesType>({});

  const { addItem, cartDetails, incrementItem } = useShoppingCart();

  const isAlradyAdded = Object.values(cartDetails ?? {}).some(
    (cartItem) => cartItem.id === product.id
  )
    ? true
    : false;

  const dispatch = useDispatch<AppDispatch>();

  const cartItem = {
    id: product.id,
    name: product.title,
    price: product.discountedPrice || product.price,
    currency: "usd",
    image: defaultVariant ? defaultVariant?.image : "",
    slug: product?.slug,
    availableQuantity: product.quantity,
    color: activeColor,
    size: activeSize || "",
    attribute: selectedAttributes || "",
  };

  // pass the product here when you get the real data.
  const handlePreviewSlider = () => {
    dispatch(
      updateproductDetails({
        ...product,
        updatedAt: product.updatedAt.toISOString(), // Convert Date to string
      })
    );
    openPreviewModal();
  };

  const handleAddToCart = async (isCheckout: boolean = false) => {
    if (quantity > product.quantity) {
      toast.error(`Only ${product.quantity} available in stock!`);
      return;
    }

    const isAlreadyItemInCart = !!cartDetails?.[cartItem.id];

    if (isCheckout) {
      if (isAlreadyItemInCart) {
        router.push("/checkout");
        return;
      }

      // Add the item and wait a short time before redirecting
      await addItem({ ...cartItem, quantity: quantity });

      // Small delay to ensure cart is updated before navigating
      setTimeout(() => {
        router.push("/checkout");
      }, 150); // 300ms is safer than 100ms
      return;
    }

    // Non-checkout mode: Add the item and increment as needed
    await addItem({ ...cartItem, quantity: 1 });

    for (let i = 1; i < quantity; i++) {
      await incrementItem(cartItem.id);
    }

    toast.success("Product added to cart!");
  };

  // Function to toggle the selected attribute for a specific item
  const toggleSelectedAttribute = (itemIndex: number, attributeId: string) => {
    setSelectedAttributes((prevSelected) => ({
      ...prevSelected,
      [itemIndex]: attributeId,
    }));
  };

  // Initialize the first attribute value as selected by default
  useEffect(() => {
    if (product?.customAttributes && product.customAttributes.length > 0) {
      const initialAttributes: SelectedAttributesType = {};

      product.customAttributes.forEach((attribute, index) => {
        if (attribute.attributeValues && attribute.attributeValues.length > 0) {
          initialAttributes[index] = attribute.attributeValues[0].id;
        }
      });
      setSelectedAttributes(initialAttributes);
    }
  }, [product?.customAttributes]);

  // wishlist
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const isAlreadyWishListed = wishlistItems.some(
    (wishlistItem) => wishlistItem.id === product.id
  );
  const handleItemToWishList = () => {
    dispatch(
      addItemToWishlist({
        id: product.id,
        title: product.title,
        slug: product.slug,
        image: defaultVariant?.image ? defaultVariant.image : "",
        price: product.discountedPrice
          ? product.discountedPrice
          : product.price,
        quantity: product.quantity,
        color: activeSize ? activeSize : "",
      })
    );
  };
  return (
    <>
      {product ? (
        <>
          <section className="relative pt-5 pb-20 overflow-hidden lg:pt-20 xl:pt-28">
            <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7.5 xl:gap-17.5">
                <div className="w-full lg:col-span-6">
                  <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 relative flex items-center justify-center">
                    <div>
                      <button
                        onClick={handlePreviewSlider}
                        aria-label="button for zoom"
                        className="absolute z-40 flex items-center justify-center duration-200 ease-out rounded-lg gallery__Image w-11 h-11 bg-gray-1 shadow-1 text-dark hover:text-blue top-4 lg:top-6 right-4 lg:right-6"
                      >
                        <FullScreenIcon />
                      </button>

                      <Image
                        src={previewImg ? previewImg : ""}
                        alt={product.title || "product-image"}
                        width={400}
                        height={400}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                    {product.productVariants.map((item: any, key: any) => (
                      <button
                        onClick={() => setPreviewImg(item?.image)}
                        key={key}
                        className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue ${
                          item?.image === previewImg
                            ? "border-blue"
                            : "border-transparent"
                        }`}
                      >
                        <Image
                          width={50}
                          height={50}
                          src={item.image}
                          alt="thumbnail"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* <!-- product content --> */}
                <div className="w-full lg:col-span-6">
                  <div className="flex items-center justify-between mb-3">
                    <h1 className="text-xl font-semibold sm:text-2xl xl:text-custom-3 text-dark">
                      {product.title}
                    </h1>
                    {product.discountedPrice &&
                      product.discountedPrice < product.price && (
                        <div className="inline-flex font-medium shrink-0 text-custom-sm text-white bg-blue rounded-full py-0.5 px-2.5">
                          {Math.round(
                            ((product.price - product.discountedPrice) /
                              product.price) *
                              100
                          )}
                          % OFF
                        </div>
                      )}
                  </div>

                  <div className="flex flex-wrap items-center gap-5.5 mb-4.5">
                    <div className="flex items-center gap-2.5">
                      {/* <!-- stars --> */}
                      <ReviewStar avgRating={avgRating} />

                      <span> ( {totalRating} customer reviews ) </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {product.quantity ? (
                        <>
                          <CircleCheckIcon className="fill-green" />
                          <span className="text-green"> In Stock </span>
                        </>
                      ) : (
                        <>
                          <span className="text-red"> Out of Stock </span>
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className=" text-xl sm:text-2xl mb-4.5">
                    <span className="mr-2 font-semibold text-dark">
                      Price:{" "}
                    </span>
                    {product.discountedPrice && (
                      <span className="font-medium line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                    <span className="font-semibold text-dark">
                      {"  "}
                      {formatPrice(product.discountedPrice || product.price)}
                    </span>
                  </h3>

                  <ul className="flex flex-col gap-2">
                    {product.offers?.map((offer, key) => (
                      <li
                        key={key}
                        className="flex items-center gap-2.5 font-normal"
                      >
                        <CircleCheckIcon className="fill-[#3C50E0]" />
                        {offer}
                      </li>
                    ))}
                  </ul>

                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="flex flex-col gap-4.5 border-y border-gray-3 mt-7.5 mb-9 py-9">
                      {/* <!-- details item --> */}
                      <div className="flex items-center gap-4">
                        <div className="min-w-[65px]">
                          <h4 className="text-base font-normal capitalize text-dark">
                            Color:
                          </h4>
                        </div>

                        <ul className="flex items-center gap-2.5">
                          {product?.productVariants?.map((item, key) => (
                            <li
                              key={key}
                              onClick={() => {
                                setActiveColor(item.color);
                                setPreviewImg(
                                  product.productVariants.find(
                                    (pv) => pv.color === item.color
                                  )?.image || ""
                                );
                              }}
                              className={`w-[22px] cursor-pointer h-[22px] rounded-full inline-flex items-center justify-center ${
                                item.color === "white" ||
                                item.color === "#ffffff"
                                  ? "border border-gray-3"
                                  : "border-transparent"
                              }`}
                              style={{ backgroundColor: `${item.color}` }}
                            >
                              <svg
                                className={
                                  activeColor === item.color
                                    ? "block"
                                    : "hidden"
                                }
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M10.0517 3.27002L4.59172 8.73002L1.94922 6.08755"
                                  stroke={
                                    activeColor === "white" ||
                                    activeColor === "#ffffff" ||
                                    item.color === "white" ||
                                    item.color === "#ffffff"
                                      ? "black"
                                      : "white"
                                  }
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {product?.customAttributes &&
                        product.customAttributes?.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-center gap-4"
                          >
                            <div className="min-w-[65px]">
                              <h4 className="font-normal capitalize text-dark">
                                {item?.attributeName}:
                              </h4>
                            </div>
                            <div className="flex items-center gap-4">
                              {item.attributeValues.map((value, valueIndex) => (
                                <span
                                  key={valueIndex}
                                  onClick={() =>
                                    toggleSelectedAttribute(itemIndex, value.id)
                                  }
                                  className={`border py-1 px-2.5 rounded-md text-sm font-normal cursor-pointer ${
                                    selectedAttributes[itemIndex] === value.id
                                      ? "border-blue text-blue"
                                      : "border-gray-3 text-dark-3"
                                  }`}
                                >
                                  {value.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      {product?.productVariants.find(
                        (variant) => variant.size
                      ) && (
                        <div className="flex items-center gap-4">
                          <div className="min-w-[65px]">
                            <h4 className="font-normal capitalize text-dark">
                              Size:
                            </h4>
                          </div>
                          <div className="flex items-center gap-4">
                            {product?.productVariants.map(
                              (value, valueIndex) => (
                                <span
                                  key={valueIndex}
                                  onClick={() => setActiveSize(value.size)}
                                  className={`border py-1 px-2.5 rounded-md text-sm font-normal cursor-pointer ${
                                    activeSize === value.size
                                      ? "border-blue text-blue"
                                      : "border-gray-3 text-dark-3"
                                  }`}
                                >
                                  {value.size}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4.5">
                      <div className="flex items-center border rounded-lg border-gray-3">
                        <button
                          aria-label="button for remove product"
                          className="flex items-center justify-center w-12 h-12 duration-200 ease-out hover:text-blue"
                          onClick={() =>
                            quantity > 1 && setQuantity(quantity - 1)
                          }
                          disabled={quantity === 1}
                        >
                          <MinusIcon />
                        </button>

                        <span className="flex items-center justify-center w-16 h-12 border-x border-gray-3">
                          {quantity}
                        </span>

                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          disabled={quantity === product.quantity}
                          aria-label="button for add product"
                          className="flex items-center justify-center w-12 h-12 duration-200 ease-out hover:text-blue"
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      <button
                        onClick={() => handleAddToCart(true)}
                        disabled={product.quantity < 1}
                        className="inline-flex py-3 font-medium text-white duration-200 ease-out rounded-lg bg-blue px-7 hover:bg-blue-dark"
                      >
                        Purchase Now
                      </button>
                      <button
                        onClick={() => handleAddToCart()}
                        disabled={
                          isAlradyAdded
                            ? true
                            : product.quantity < 1
                              ? true
                              : false
                        }
                        className={`inline-flex font-medium text-white bg-dark py-3 px-7 rounded-lg ease-out duration-200 hover:bg-dark-2 ${
                          isAlradyAdded && "cursor-not-allowed bg-dark-2"
                        }`}
                      >
                        {isAlradyAdded
                          ? "Added"
                          : product.quantity < 1
                            ? "Out of Stock"
                            : "Add to Cart"}
                      </button>

                      <button
                        onClick={() => handleItemToWishList()}
                        className={`flex items-center justify-center w-12 h-12 duration-200 ease-out border rounded-lg border-gray-3 hover:text-white hover:bg-dark hover:border-transparent ${
                          isAlreadyWishListed
                            ? "text-white bg-dark border-transparent"
                            : ""
                        }`}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.62436 4.4241C3.96537 5.18243 2.75 6.98614 2.75 9.13701C2.75 11.3344 3.64922 13.0281 4.93829 14.4797C6.00072 15.676 7.28684 16.6675 8.54113 17.6345C8.83904 17.8642 9.13515 18.0925 9.42605 18.3218C9.95208 18.7365 10.4213 19.1004 10.8736 19.3647C11.3261 19.6292 11.6904 19.7499 12 19.7499C12.3096 19.7499 12.6739 19.6292 13.1264 19.3647C13.5787 19.1004 14.0479 18.7365 14.574 18.3218C14.8649 18.0925 15.161 17.8642 15.4589 17.6345C16.7132 16.6675 17.9993 15.676 19.0617 14.4797C20.3508 13.0281 21.25 11.3344 21.25 9.13701C21.25 6.98614 20.0346 5.18243 18.3756 4.4241C16.7639 3.68739 14.5983 3.88249 12.5404 6.02065C12.399 6.16754 12.2039 6.25054 12 6.25054C11.7961 6.25054 11.601 6.16754 11.4596 6.02065C9.40166 3.88249 7.23607 3.68739 5.62436 4.4241ZM12 4.45873C9.68795 2.39015 7.09896 2.10078 5.00076 3.05987C2.78471 4.07283 1.25 6.42494 1.25 9.13701C1.25 11.8025 2.3605 13.836 3.81672 15.4757C4.98287 16.7888 6.41022 17.8879 7.67083 18.8585C7.95659 19.0785 8.23378 19.292 8.49742 19.4998C9.00965 19.9036 9.55954 20.3342 10.1168 20.6598C10.6739 20.9853 11.3096 21.2499 12 21.2499C12.6904 21.2499 13.3261 20.9853 13.8832 20.6598C14.4405 20.3342 14.9903 19.9036 15.5026 19.4998C15.7662 19.292 16.0434 19.0785 16.3292 18.8585C17.5898 17.8879 19.0171 16.7888 20.1833 15.4757C21.6395 13.836 22.75 11.8025 22.75 9.13701C22.75 6.42494 21.2153 4.07283 18.9992 3.05987C16.901 2.10078 14.3121 2.39015 12 4.45873Z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>

          <DetailsTabs product={product} />
        </>
      ) : (
        <PreLoader />
      )}
    </>
  );
};

export default ShopDetails;
