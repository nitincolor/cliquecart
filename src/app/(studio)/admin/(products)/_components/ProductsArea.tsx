"use client";
import usePagination from "@/hooks/usePagination";
import ProductItem from "./ProductItem";
import Pagination from "@/components/Common/Pagination";

type IProps = {
  products: {
    id: string;
    title: string;
    slug: string;
    productVariants: {
      image: string;
      isDefault: boolean;
    }[];
  }[];
};
export default function ProductsArea({ products }: IProps) {
  const per_page = 8;
  const { currentItems, handlePageClick, pageCount } = usePagination(
    products,
    per_page
  );
  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4">
        {currentItems.map((product) => (
          <ProductItem key={product.id} item={product} />
        ))}
      </div>
      {/* pagination start */}
      {products.length > per_page && (
        <div className="flex justify-center mt-12 pagination bg-2">
          <Pagination handlePageClick={handlePageClick} pageCount={pageCount} />
        </div>
      )}
      {/* pagination end */}
    </>
  );
}
