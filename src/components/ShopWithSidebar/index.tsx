"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import CategoryDropdown from "./CategoryDropdown";
import ClearFilters from "./ClearFilters";
import ColorsDropdown from "./ColorsDropdown";
import RadixSlider from "./RadixSlider";
import SizeDropdown from "./SizeDropdown";

import {
  FourSquaresIcon,
  SidebarToggleIcon,
  TwoSquaresIcon,
  XIcon,
} from "@/assets/icons";
import SingleListItem from "../Shop/SingleListItem";
import ProductsEmptyState from "./ProductsEmptyState";
import TopBar from "./TopBar";
import { Product } from "@/types/product";
import { Category } from "@prisma/client";
import usePagination from "@/hooks/usePagination";
import Pagination from "../Common/Pagination";
import ProductItem from "../Common/ProductItem";

type PropsType = {
  data: {
    allProducts: Product[];
    products: Product[];
    categories: (Category & { productCount: number })[];
    allProductsCount: number;
    highestPrice: number;
  };
};

const ShopWithSidebar = ({ data }: PropsType) => {
  const { allProducts, products, categories, allProductsCount } = data;
  const { currentItems, handlePageClick, pageCount } = usePagination(
    products,
    9
  );
  const [productStyle, setProductStyle] = useState("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);

  const availableSizes = useMemo(() => {
    const sizes = allProducts.flatMap(
      (product) => product.productVariants.map((item) => item.size) || []
    );
    return [...new Set(sizes.filter((size) => size.trim() !== ""))];
  }, [allProducts]);

  const availableColors = useMemo(() => {
    const colors = allProducts.flatMap(
      (product) => product.productVariants.map((item) => item.color) || []
    );
    return [...new Set(colors)];
  }, [allProducts]);

  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);

    // closing sidebar while clicking outside
    function handleClickOutside(event: any) {
      if (!event.target.closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    }

    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [productSidebar]);

  return (
    <>
      {productSidebar && (
        <div
          className="fixed inset-0 z-99 bg-dark/50 xl:hidden"
          onClick={() => setProductSidebar(false)}
        />
      )}

      <section className="relative pb-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          <div className="grid gap-6 xl:grid-cols-12">
            {/* Sidebar Start */}
            <div
              className={`sidebar-content fixed xl:static bg-gray-2 xl:bg-transparent xl:translate-x-0 xl:rounded-xl left-0 top-0 xl:col-span-3 w-[290px] sm:w-[320px] xl:w-full h-full xl:h-auto  z-99 xl:z-auto transition-transform duration-300 ease-in-out ${
                productSidebar
                  ? "translate-x-0 "
                  : "-translate-x-full xl:translate-x-0"
              }`}
            >
              {/* Mobile header with close button */}
              <div className="flex items-center justify-between p-4 border-b border-gray-3 xl:hidden">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setProductSidebar(false)}
                  aria-label="Close sidebar"
                  className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <XIcon />
                </button>
              </div>

              <div className="flex flex-col gap-6 overflow-y-auto max-xl:h-screen max-xl:p-5">
                {/* filter box */}
                <ClearFilters />

                <Suspense>
                  <CategoryDropdown categories={categories} />
                </Suspense>

                {/* gender box */}
                {/* <GenderDropdown genders={genders} /> */}

                <Suspense>
                  <SizeDropdown availableSizes={availableSizes} />
                </Suspense>

                {/* color box */}
                <ColorsDropdown availableColors={availableColors} />

                {/*  price range box */}
                <RadixSlider highestPrice={data.highestPrice} />
              </div>
            </div>
            {/* Sidebar End */}

            {/* Content Start */}
            <div className="w-full xl:col-span-9">
              <div className="rounded-xl bg-white pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  {/* top bar left */}
                  <TopBar
                    allProductsCount={allProductsCount}
                    showingProductsCount={currentItems.length}
                  />

                  {/* top bar right */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setProductStyle("grid")}
                      aria-label="button for product grid tab"
                      className={`${
                        productStyle === "grid"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10 h-10 rounded-lg border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <FourSquaresIcon />
                    </button>

                    <button
                      onClick={() => setProductStyle("list")}
                      aria-label="button for product list tab"
                      className={`${
                        productStyle === "list"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10 h-10 rounded-lg border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <TwoSquaresIcon />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Grid Tab Content Start */}
              {currentItems.length ? (
                <div
                  className={
                    productStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-6"
                      : "flex flex-col gap-6"
                  }
                >
                  {currentItems.map((product) => {
                    return productStyle === "grid" ? (
                      <ProductItem
                        key={product.id}
                        item={product}
                        bgClr="white"
                      />
                    ) : (
                      <SingleListItem key={product.id} item={product} />
                    );
                  })}
                </div>
              ) : (
                <ProductsEmptyState />
              )}

              {/* pagination start */}
              <div className="mt-14">
                <Pagination
                  handlePageClick={handlePageClick}
                  pageCount={pageCount}
                />
              </div>
              {/* pagination end */}
            </div>

            {/* Content End */}
          </div>
        </div>
      </section>

      {/* Toggle button for mobile */}
      <button
        onClick={() => setProductSidebar(!productSidebar)}
        aria-label="Toggle product sidebar"
        className={`xl:hidden fixed right-5 z-50 flex items-center justify-center w-10 h-10 bg-white border border-gray-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl top-32`}
      >
        <SidebarToggleIcon />
      </button>
    </>
  );
};

export default ShopWithSidebar;
