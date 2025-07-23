import React from "react";
import { Metadata } from "next";
import { Wishlist } from "@/components/Wishlist";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Wishlist Page | ${site_name}`,
    description: `This is Wishlist Page for ${site_name}`,
  };
};

const WishlistPage = () => {
  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Wishlist",
            href: "/wishlist",
          },
        ]}
        seoHeading={true}
      />
      <Wishlist />
    </main>
  );
};

export default WishlistPage;
