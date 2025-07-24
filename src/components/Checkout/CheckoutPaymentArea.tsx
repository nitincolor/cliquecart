"use client";
import { useSession } from "next-auth/react";
import Breadcrumb from "../Common/Breadcrumb";
import Billing from "./Billing";
import Coupon from "./Coupon";
import Login from "./Login";
import Notes from "./Notes";
import PaymentMethod from "./PaymentMethod";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import { CheckoutInput, useCheckoutForm } from "./form";
import Orders from "./orders";
import { useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useShoppingCart } from "use-shopping-cart";

const CheckoutPaymentArea = ({ amount }: { amount: number }) => {
  const { handleSubmit } = useCheckoutForm();
  const { data: session } = useSession();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { cartDetails } = useShoppingCart();

  // Handle checkout
  const handleCheckout = async (data: CheckoutInput) => {
    setLoading(true);
    setErrorMessage("");

    if (data.billing.createAccount) {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.billing.email,
          name: data.billing.firstName,
          password: "12345678",
        }),
      });
      const result = await response.json();
      if (!result?.success) {
        toast.error(
          `${result?.message} for creating account` || "Failed to register user"
        );
        setLoading(false);
        return;
      }
    }

    // Helper function to create order
    const createOrder = async (paymentStatus: "pending" | "paid") => {
      const orderData = {
        ...data,
        totalAmount: amount,
        userId: session?.user?.id || null,
        paymentStatus,
        couponCode: data.couponCode,
        products: Object.values(cartDetails ?? {}).map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item?.color || "",
          size: item?.size || "",
          attribute: item?.attribute || "",
        })),
      };

      try {
        const orderResponse = await fetch("/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });
        const result = await orderResponse.json();

        if (!result?.success) {
          toast.error(result?.message || "Failed to create order");
          return false;
        }

        toast.success("Order created successfully");
        router.push(`/success?amount=${amount}`);
        return true;
      } catch (err: any) {
        console.error("Order creation error:", err);
        toast.error(err?.message || "Failed to create order");
        return false;
      }
    };

    // Only COD supported now
    const success = await createOrder("pending");
    setLoading(false);
    if (!success) return;
    return;
  };

  return (
    <>
      <section className="pb-20 overflow-hidden bg-gray-2">
        <div className="w-full gap-6 px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          {!Boolean(session?.user) && (
            <div className="mb-6">
              <Login />
            </div>
          )}
          <form onSubmit={handleSubmit(handleCheckout)}>
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="w-full space-y-6 lg:col-span-3">
                <Billing />
                <Shipping />
                <Notes />
              </div>
              <div className="w-full space-y-6 lg:col-span-2">
                <Orders />

                <Coupon />

                <ShippingMethod />

                <PaymentMethod amount={amount} />

                <button
                  type="submit"
                  className="flex justify-center w-full px-6 py-3 font-medium text-white duration-200 ease-out rounded-md bg-blue hover:bg-blue-dark "
                >
                  {!loading ? `Pay $${amount}` : "Processing..."}
                </button>
              </div>
            </div>
            {errorMessage && (
              <p className="mt-2 text-center text-red">{errorMessage}</p>
            )}
          </form>
        </div>
      </section>
    </>
  );
};

export default CheckoutPaymentArea;
