import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";


// get post authors
export const getPostAuthors = unstable_cache(
  async () => {
    return await prisma.postAuthor.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
      },
    });
  },
  ['postAuthors'], { tags: ['postAuthors'] }
);