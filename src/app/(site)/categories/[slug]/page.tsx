import Breadcrumb from "@/components/Common/Breadcrumb";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";
import { getCategories, getCategoryBySlug } from "@/get-api-data/category";
import { getSiteName } from "@/get-api-data/seo-setting";
import { prisma } from "@/lib/prismaDB";
import { Prisma } from "@prisma/client";

type Params = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    date: string;
    sort: string;
  }>;
};

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const categoryData = await getCategoryBySlug(slug);
  const siteURL = process.env.SITE_URL;
  const site_name = await getSiteName();

  if (categoryData) {
    return {
      title: `${categoryData?.title || "Category Page"} | ${site_name}`,
      description: `${categoryData?.description?.slice(0, 136)}...`,
      author: site_name,
      alternates: {
        canonical: `${siteURL}/categories/${categoryData?.slug}`,
      },

      robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
          index: true,
          follow: false,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      openGraph: {
        title: `${categoryData?.title} | ${site_name}`,
        description: categoryData.description,
        url: `${siteURL}/categories/${categoryData?.slug}`,
        siteName: site_name,
        images: [
          {
            url: categoryData.img || "",
            width: 1800,
            height: 1600,
            alt: categoryData?.title,
          },
        ],
        locale: "en_US",
        type: "article",
      },

      twitter: {
        card: "summary_large_image",
        title: `${categoryData?.title} | ${site_name}`,
        description: `${categoryData?.description?.slice(0, 136)}...`,
        creator: site_name,
        site: `${siteURL}/categories/${categoryData?.slug}`,
        images: [categoryData.img || ""],
        url: `${siteURL}/categories/${categoryData?.slug}`,
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "No product category has been found",
    };
  }
}

const CategoryPage = async ({ params, searchParams }: Params) => {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const { date, sort } = await searchParams;

  // Category filter: Ensure there's a valid slug and filter based on it
  const categoryFilter = decodedSlug ? { category: { slug: decodedSlug } } : {};

  // Sort order: dynamically construct the sorting logic
  const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
  if (date) {
    // Sort by creation date, ascending or descending
    orderBy.push({
      updatedAt: date === "desc" ? Prisma.SortOrder.desc : Prisma.SortOrder.asc,
    });
  }
  if (sort === "popular") {
    // Sort by reviews count in descending order
    orderBy.push({ reviews: { _count: Prisma.SortOrder.desc } });
  }
  // Fetch category data based on slug (if applicable)
  const categoryData = decodedSlug
    ? await prisma.category.findUnique({ where: { slug: decodedSlug } })
    : null;

  // Query products based on the category filter and dynamic ordering
  const products = await prisma.product.findMany({
    where: categoryFilter,
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
          isDefault: true,
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  // Format products and reviews
  const formattedProducts = products.map(({ _count, ...item }) => ({
    ...item,
    reviews: _count.reviews,
    price: item.price.toNumber(),
    discountedPrice: item.discountedPrice
      ? item.discountedPrice.toNumber()
      : null,
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
            label: categoryData?.title || "",
            href: `/categories/${categoryData?.slug}`,
          },
        ]}
        seoHeading={true}
      />
      <ShopWithoutSidebar shopData={formattedProducts} />
    </main>
  );
};

export default CategoryPage;
