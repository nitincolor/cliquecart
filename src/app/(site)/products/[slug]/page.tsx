import { notFound } from "next/navigation";
import { structuredAlgoliaHtmlData } from "@/algolia/crawlIndex";
import ShopDetails from "@/components/ShopDetails";
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/get-api-data/product";
import { IProductByDetails } from "@/types/product";
import RecentlyViewedItems from "@/components/ShopDetails/RecentlyViewd";
import Newsletter from "@/components/Common/Newsletter";
import { getReviews } from "@/get-api-data/reviews";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    slug: product?.slug,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const siteURL = process.env.SITE_URL;
  const site_name = await getSiteName();

  const defaultVariant = product?.productVariants?.find(
    (variant) => variant.isDefault
  );

  if (!product) {
    return {
      title: "Not Found",
      description: "No blog article has been found",
    };
  }

  return {
    title: `${product.title || "Single Product Page"} | ${site_name}`,
    description: `${product?.shortDescription?.slice(0, 136)}...`,
    author: site_name,
    alternates: {
      canonical: `${siteURL}/products/${product?.slug}`,
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
      title: `${product?.title} | ${site_name}`,
      description: product.shortDescription,
      url: `${siteURL}/products/${product?.slug}`,
      siteName: site_name,
      images: [
        {
          url: defaultVariant?.image,
          width: 1800,
          height: 1600,
          alt: product?.title || `${site_name}`,
        },
      ],
      locale: "en_US",
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title: `${product?.title} | ${site_name}`,
      description: `${product?.shortDescription?.slice(0, 136)}...`,
      creator: site_name,
      site: `${siteURL}/products/${product?.slug}`,
      images: [defaultVariant?.image],
      url: `${siteURL}/products/${product?.slug}`,
    },
  };
}

const ProductDetails = async ({ params }: Props) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const recentProducts = await getRelatedProducts(
    product.category?.title!,
    product.tags!,
    product.id!,
    product.title!
  );

  const defaultVariant = product?.productVariants?.find(
    (variant) => variant.isDefault
  );

  const { avgRating, totalRating } = await getReviews(product.slug!);

  await structuredAlgoliaHtmlData({
    type: "products",
    title: product?.title,
    htmlString: product?.shortDescription,
    pageUrl: `${process.env.SITE_URL}/products/${product.slug}`,
    imageURL: defaultVariant?.image as string,
    price: product?.price,
    discountedPrice: product?.discountedPrice || undefined,
    reviews: product?.reviews,
    category: product?.category?.title,
    id: product?.id,
    thumbnails: product?.productVariants,
    previewImage: defaultVariant
      ? { color: defaultVariant.color, image: defaultVariant.image }
      : undefined,
  });

  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Shop",
            href: "/shop",
          },
          {
            label: product?.title || "",
            href: `/products/${product?.slug}`,
          },
        ]}
      />
      <ShopDetails
        product={product as IProductByDetails}
        avgRating={avgRating}
        totalRating={totalRating}
      />
      <RecentlyViewedItems products={recentProducts} />
      <Newsletter />
    </main>
  );
};

export default ProductDetails;
