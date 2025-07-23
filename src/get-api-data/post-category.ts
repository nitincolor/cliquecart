import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";


// get post authors
export const getPostCategory = unstable_cache(
  async () => {
    return await prisma.postCategory.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        img: true,
      },
    });
  },
  ['postCategories'], { tags: ['postCategories'] }
);