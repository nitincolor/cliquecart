import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";

// get all privacy policies
export const getTermsConditions = unstable_cache(
  async () => {
    return await prisma.termsConditions.findMany({
        orderBy: { updatedAt: "desc" },
    });
  },
  ['terms-condition'], { tags: ['terms-condition'] }
);
