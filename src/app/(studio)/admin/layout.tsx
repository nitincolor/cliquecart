import { Metadata } from "next";
import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import { Toaster } from "react-hot-toast";
import Providers from "./Providers";
import NextTopLoader from "nextjs-toploader";
import DashboardWrapper from "./_components/DashboardWrapper";
import { getSiteName } from "@/get-api-data/seo-setting";

export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Admin Dashboard | ${site_name}`,
    description: `This is Admin Dashboard for ${site_name}`,
  };
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <PreLoader />
      <>
        <Providers>
          <NextTopLoader
            color="#3C50E0"
            crawlSpeed={300}
            showSpinner={false}
            shadow="none"
          />
          <Toaster position="top-center" reverseOrder={false} />
          <DashboardWrapper>{children}</DashboardWrapper>
        </Providers>
        <ScrollToTop />
      </>
    </div>
  );
}
