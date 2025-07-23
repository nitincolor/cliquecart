import { Metadata } from "next";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";
import { Prisma } from "@prisma/client";
import { getAllProducts } from "@/get-api-data/product";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Shop Popular Page | ${site_name}`,
    description: `This is Shop Popular Page for ${site_name}`,
  };
};

type PageProps = {
  searchParams: Promise<{
    sort: string;
  }>;
};

const ShopWithoutSidebarPage = async ({ searchParams }: PageProps) => {
  const { sort } = await searchParams;

  // order by popular
  const orderBy =
    sort === "popular"
      ? { reviews: { _count: Prisma.SortOrder.desc } }
      : { updatedAt: Prisma.SortOrder.desc };

  const products = await getAllProducts(orderBy);

  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Popular",
            href: "/popular?sort=popular",
          },
        ]}
        seoHeading={true}
      />
      <ShopWithoutSidebar key={sort} shopData={products} />
    </main>
  );
};

export default ShopWithoutSidebarPage;
