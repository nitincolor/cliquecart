"use client";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { EyeIcon } from "@/assets/icons";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch } from "@/redux/store";
import { useShoppingCart } from "use-shopping-cart";
import CheckoutBtn from "./CheckoutBtn";
import ReviewStar from "./ReviewStar";
import WishlistButton from "../Wishlist/AddWishlistButton";
import { formatPrice } from "@/utils/formatePrice";
import Tooltip from "../Common/Tooltip";

const SingleListItem = ({ item }: { item: Product }) => {
  const defaultVariant = item?.productVariants.find(
    (variant) => variant.isDefault
  );
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const { addItem, cartDetails,handleCartClick } = useShoppingCart();

  const isItemInCart = Object.values(cartDetails ?? {}).some(
    (cartItem) => cartItem.id === item.id
  );

  const cartItem = {
    id: item.id,
    name: item.title,
    price: item.discountedPrice ? item.discountedPrice : item.price,
    currency: "usd",
    image: defaultVariant?.image ? defaultVariant.image : "",
    price_id: null,
    slug: item?.slug,
    availableQuantity: item.quantity,
    color: defaultVariant?.color ? defaultVariant.color : "",
  };

  // update the QuickView state
  const handleQuickViewUpdate = () => {
    const serializableItem = {
      ...item,
      updatedAt:
        item.updatedAt instanceof Date
          ? item.updatedAt.toISOString()
          : item.updatedAt,
    };
    dispatch(updateQuickView(serializableItem));
  };

  // add to cart
  const handleAddToCart = () => {
    if (item.quantity > 0) {
      // @ts-ignore
      addItem(cartItem);
      toast.success("Product added to cart!");
      handleCartClick();
    } else {
      toast.error("This product is out of stock!");
    }
  };

  const handleItemToWishList = () => {
    dispatch(
      addItemToWishlist({
        id: item.id,
        title: item.title,
        slug: item.slug,
        image: defaultVariant?.image ? defaultVariant.image : "",
        price: item.discountedPrice ? item.discountedPrice : item.price,
        quantity: item.quantity,
        color: defaultVariant?.color ? defaultVariant.color : "",
      })
    );
  };

  return (
    <div className="bg-white border rounded-xl group border-gray-3">
      <div className="flex">
        <div className="shadow-list relative overflow-hidden flex items-center justify-center max-w-[270px] w-full sm:min-h-[270px] p-4">
          {
            <Link href={`/products/${item?.slug}`}>
              <Image
                src={defaultVariant?.image || ""}
                alt={item.title || "product-image"}
                className="object-cover"
                width={270}
                height={270}
              />
            </Link>
          }

          <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
            <Tooltip content="Quick View">
              <button
                onClick={() => {
                  openModal();
                  handleQuickViewUpdate();
                }}
                aria-label="button for quick view"
                className="flex items-center justify-center border border-gray-3 duration-200 ease-out bg-white rounded-lg w-[38px] h-[38px] text-dark hover:text-blue"
              >
                <EyeIcon />
              </button>
            </Tooltip>

            {isItemInCart ? (
              <CheckoutBtn />
            ) : (
              <button
                onClick={() => handleAddToCart()}
                disabled={item.quantity < 1}
                className="inline-flex font-medium text-custom-sm h-[38px] py-2 px-5 rounded-lg bg-blue text-white ease-out duration-200 hover:bg-blue-dark"
              >
                {item.quantity < 1 ? "Out of Stock" : "Add to cart"}
              </button>
            )}
            {/* wishlist button */}
            <Tooltip content="Wishlist">
              <WishlistButton
                item={item}
                handleItemToWishList={handleItemToWishList}
              />
            </Tooltip>
          </div>
        </div>

        <Link
          href={`/products/${item?.slug}`}
          className="w-full flex flex-col gap-5 sm:flex-row sm:items-center justify-center sm:justify-between py-5 px-4 sm:px-7.5 lg:pl-11 lg:pr-12"
        >
          <div>
            <h3 className="font-medium text-base text-dark ease-out duration-200 hover:text-blue mb-1.5">
              {item.title}
            </h3>

            <span className="flex items-center gap-2 text-base font-medium">
              <span className="text-dark">
                {formatPrice(item.discountedPrice || item.price)}
              </span>
              {item.discountedPrice && (
                <span className="line-through text-dark-4">
                  {formatPrice(item.price)}
                </span>
              )}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SingleListItem;
