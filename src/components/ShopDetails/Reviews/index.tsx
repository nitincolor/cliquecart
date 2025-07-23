import React, { useEffect, useState } from "react";
import ReviewItem from "./ReviewItem";
import { IProductByDetails } from "@/types/product";
import AddReviews from "./AddReviews";

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  // Add more fields as per your API response
}

const Reviews = ({ product }: { product: IProductByDetails }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product?.slug) {
      fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productSlug: product.slug }),
      })
        .then((res) => res.json())
        .then((data) => {
          setReviews(data.review || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching reviews:", error);
          setError("Failed to load reviews.");
          setLoading(false);
        });
    }
  }, [product?.slug]);

  if (loading) {
    return <p>Loading reviews...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <div className="max-w-[570px] w-full">
        <h2 className="text-xl font-medium text-dark mb-9">
          {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"} for
          this product
        </h2>

        <div className="flex flex-col gap-6">
          {reviews.map((review, i) => (
            <ReviewItem review={review} key={i} />
          ))}
        </div>
      </div>

      <AddReviews productSlug={product.slug} />
    </>
  );
};

export default Reviews;
