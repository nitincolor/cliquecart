import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prismaDB";
import Link from "next/link";
import { PlusIcon } from "@/assets/icons";
import ProductsArea from "../_components/ProductsArea";

const getProducts = unstable_cache(
  async () => {
    return await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        productVariants: {
          select: {
            image: true,
            isDefault: true,
          },
        },
      },
    });
  },
  ["products"],
  { tags: ["products"] }
);

export default async function ProductPage() {
  const productData = await getProducts();
  return (
    <div className="bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-3">
        <h2 className="text-base font-semibold text-dark">All Products</h2>
        <Link
          href="/admin/add-product"
          className="inline-flex items-center gap-2 px-5 py-3 text-sm font-normal text-white duration-200 ease-out rounded-lg bg-dark hover:bg-darkLight"
        >
          <PlusIcon className="w-3 h-3" /> Add Product
        </Link>
      </div>

      <div className="p-6">
        {productData && <ProductsArea products={productData} />}
      </div>
    </div>
  );
}
