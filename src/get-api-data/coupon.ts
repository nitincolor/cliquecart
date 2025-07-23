import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";


// get coupons

export const getCoupons = unstable_cache(
  async () => {
    return await prisma.coupon.findMany({
      orderBy: {updatedAt: "desc"},
    });
  },
  ['coupons'],{tags: ['coupons'] }
);


export const getSingleCoupon = async (couponId: string) => 
  unstable_cache(
    async () => {
      return await prisma.coupon.findUnique({
        where: {
          id: couponId
        }
      })
    },
    ['coupon'], { tags: [`coupon-${couponId}`] }
  )();
