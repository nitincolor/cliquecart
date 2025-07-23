import { Metadata } from "next";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { prisma } from "@/lib/prismaDB";
import { getAllProducts } from "@/get-api-data/product";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";


export const generateMetadata = async (): Promise<Metadata> => {
    const site_name = await getSiteName();
    return {
        title: `Shop With Sidebar Page | ${site_name}`,
        description: `This is Shop With Sidebar Page for ${site_name}`,
    };
};

type PageProps = {
  searchParams: Promise<{
    category?: string;
    sizes?: string;
    colors?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

const ShopWithSidebarPage = async ({ searchParams }: PageProps) => {
  const { category, sizes, colors, minPrice, maxPrice, sort } = await searchParams;

  const categorySlugs = category?.split(",");
  // Fetch category IDs based on slugs
  const categoryRecords = categorySlugs
    ? await prisma.category.findMany({
      where: { slug: { in: categorySlugs } },
      select: { id: true },
    })
    : [];                                                                                                                            

  const categoryIds = categoryRecords.map((c) => c.id);
  const selectedSizes = sizes?.split(",");
  const selectedColors = colors?.split(",");

  const whereClause: any = {};

  if (categoryIds?.length) {
    whereClause.categoryId = { in: categoryIds };
  }

  if (selectedSizes?.length || selectedColors?.length) {
    whereClause.productVariants = {
      some: {
        ...(selectedSizes?.length ? { size: { in: selectedSizes } } : {}),
        ...(selectedColors?.length ? { color: { in: selectedColors } } : {}),
      },
    };
  }
  

  if (minPrice || maxPrice) {
    whereClause.price = {
      gte: minPrice ? parseFloat(minPrice) : undefined,
      lte: maxPrice ? parseFloat(maxPrice) : undefined,
    };
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "popular") {
    orderBy = { reviews: { _count: "desc" } };
  }

  // console.log("WHERE CLAUSE:", JSON.stringify(whereClause, null, 2));


  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy,
    select: {
      id: true,
      title: true,
      shortDescription: true,
      price: true,
      discountedPrice: true,
      slug: true,
      quantity: true,
      updatedAt: true,
      productVariants: {
        select: {
          image: true,
          color: true,
          size: true,
          isDefault: true
        }
      },
      _count: {
        select: {
          reviews: true
        }
      }
    },
  });

  const transformedProducts = products.map((product) => ({
    ...product,
    price: product.price.toNumber(),
    discountedPrice: product.discountedPrice ? product.discountedPrice.toNumber() : null,
    reviews: product._count.reviews,
  }));
  const allProducts = await getAllProducts();
  const [rawCategories, allProductsCount, highestPrice] = await Promise.all([
    prisma.category.findMany(),
    prisma.product.count(),
    prisma.product.aggregate({ _max: { price: true } }),
  ]);

  // Get product count per category
  const categoryProductCounts = await prisma.product.groupBy({
    by: ["categoryId"],
    _count: { id: true },
  });

  // Convert category list to include product count
  const categories = rawCategories.map((category) => ({
    ...category,
    productCount:
      categoryProductCounts.find((c) => c.categoryId === category.id)?._count.id || 0,
  }));

  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Shop With Sidebar",
            href: "/shop-with-sidebar",
          },
        ]}
        seoHeading={true}
      />
      <ShopWithSidebar
        key={Object.values(await searchParams).join("")}
        data={{
          allProducts,
          products: transformedProducts,
          categories, // Now includes productCount
          allProductsCount,
          highestPrice: highestPrice._max.price?.toNumber() || 0,
        }}
      />
    </main>
  );
};

export default ShopWithSidebarPage;
