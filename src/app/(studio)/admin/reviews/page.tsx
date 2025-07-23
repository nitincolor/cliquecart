import Link from "next/link";
import { PencilIcon } from "@/assets/icons";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prismaDB";
import DeleteReview from "./_components/DeleteReview";
import { EditIcon } from "../_components/Icons";

const getReviews = unstable_cache(
  async () => {
    return await prisma.review.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        ratings: true,
        updatedAt: true,
        product: {
          select: {
            title: true,
          },
        },
      },
    });
  },
  ["reviews"],
  { tags: ["reviews"] }
);

export default async function ReviewsPage() {
  const reviewData = await getReviews();

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border shadow-lg rounded-xl border-gray-3">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-3">
        <h2 className="text-base font-semibold text-dark">All Reviews</h2>
      </div>

      <div>
        {reviewData ? (
          reviewData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="text-sm text-gray-600 ">
                  <tr className="border-b border-gray-3">
                    <th className="px-6 py-3 font-medium text-left">Product</th>
                    <th className="px-6 py-3 font-medium text-left">Rating</th>
                    <th className="px-6 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-3">
                  {reviewData.map((item) => (
                    <tr key={item.id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-6">
                        {item.product.title}
                      </td>
                      <td className="px-6 py-3 text-yellow-dark-2">
                        {item.ratings} ★
                      </td>
                      <td className="px-6 py-3 ">
                        <div className="flex items-center justify-end gap-3">
                          <DeleteReview id={item.id} />
                          <Link
                            href={`/admin/reviews/edit/${item.id}`}
                            aria-label="Edit review"
                            className="p-1.5 border rounded-md text-gray-6 hover:bg-blue-light-5 hover:border-transparent hover:text-blue size-8 inline-flex items-center justify-center border-gray-3"
                          >
                            <EditIcon />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-10 font-medium text-center text-red-500">
              No reviews found
            </p>
          )
        ) : (
          <p className="py-10 text-center text-gray-500">Loading reviews...</p>
        )}
      </div>
    </div>
  );
}
