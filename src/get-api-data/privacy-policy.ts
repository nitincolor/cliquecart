import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";

// get all privacy policies
export const getPrivacyPolicies = unstable_cache(
  async () => {
    return await prisma.privacyPolicy.findMany({
        orderBy: { updatedAt: "desc" },
    });
  },
  ['privacy-policy'], { tags: ['privacy-policy'] }
);
