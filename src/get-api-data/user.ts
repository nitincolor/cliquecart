
import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";

export const getSingleUser = unstable_cache(
  async (email: string) => {
    return await prisma.user.findUnique({
      where: {
        email: email
      }
    });
  },
  ['user'], { tags: ['user'] }
)

// get users
export const getUsers = unstable_cache(
  async () => {
    return await prisma.user.findMany({
      orderBy:{name: "asc"},
    });
  },
  ['users'], { tags: ['users'] }
);
