import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { getLatestProducts } from "@/get-api-data/product";
import { formatPrice } from "@/utils/formatePrice";

const LatestProducts = async () => {
  const products: Product[] = await getLatestProducts();

  return (
    <div className="bg-white shadow-1 rounded-xl">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="text-lg font-medium text-dark">Latest Products</h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          {/* <!-- product item --> */}
          {products.length > 0 &&
            products.slice(0, 3).map((product, key) => (
              <div className="flex items-center gap-6" key={key}>
                <div className="flex items-center justify-center rounded-[10px] bg-gray-3 max-w-[90px] w-full h-22.5">
                  <Image
                    src={
                      product?.productVariants[0].image
                        ? product.productVariants[0].image
                        : "/no image"
                    }
                    alt="product"
                    width={74}
                    height={74}
                  />
                </div>

                <div>
                  <h3 className="mb-1 font-medium duration-200 ease-out text-dark hover:text-blue">
                    <Link href={`/products/${product?.slug}`}>
                      {" "}
                      {product?.title}{" "}
                    </Link>
                  </h3>
                  <p className="text-custom-sm">
                    Price:{" "}
                    {formatPrice(
                      product?.discountedPrice
                        ? product?.discountedPrice
                        : product?.price
                    )}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LatestProducts;
