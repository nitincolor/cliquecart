import { getBlogs } from "@/get-api-data/blog";
import { getAllProducts } from "@/get-api-data/product";
import algoliasearch from "algoliasearch";
import { structuredAlgoliaHtmlData } from "./crawlIndex";

// Load environment variables (if not already handled by Next.js)
// Algolia configuration
const appID = process.env.NEXT_PUBLIC_ALGOLIA_PROJECT_ID ?? "";
const apiKEY = process.env.NEXT_PUBLIC_ALGOLIA_WRITE_API_KEY ?? "";
const INDEX = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? "";

const client = algoliasearch(appID, apiKEY);
const index = client.initIndex(INDEX);

export const reindexAllProducts = async () => {
  try {
    // Clear the existing index
    console.log("Clearing Algolia index...");
    await index.clearObjects();
    console.log("Index cleared successfully");

    // Fetch all products
    const products = await getAllProducts();
    const blogs = await getBlogs();
    console.log(`Found ${products.length} products to index`);
    
    // Re-index each product
    for (const product of products) {
      console.log(`Indexing product: ${product.title}`);
      await structuredAlgoliaHtmlData({
        type: "products",
        title: product.title,
        htmlString: product.shortDescription || "",
        pageUrl: `${process.env.SITE_URL}/products/${product.slug}`,
        imageURL: product.productVariants[0].image,
        price: product.price || 0,
        discountedPrice: product.discountedPrice || 0,
        reviews: product.reviews || 0,
        id: product.id || "",
        thumbnails: product.productVariants || [],
        previewImage: product.productVariants[0].image
          ? { color: product.productVariants[0].color, image: product.productVariants[0].image }
          : undefined,
      });
    }

    for (const blog of blogs) {
      console.log(`Indexing blog: ${blog.title}`);
      await structuredAlgoliaHtmlData({
        type: "blogs",
        title: blog.title,
        htmlString: blog.metadata || "",
        pageUrl: `${process.env.SITE_URL}/blog/${blog.slug}`,
        imageURL: blog.mainImage || "",
      });
    }
    console.log("Re-indexing complete");
  } catch (error) {
    console.error("Error during re-indexing:", error);
  }
};

// reindexAllProducts();
