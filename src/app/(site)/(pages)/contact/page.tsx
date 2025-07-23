import { Metadata } from "next";
import Contact from "@/components/Contact";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Contact Page | ${site_name}`,
    description: `This is Contact Page for ${site_name}`,
  };
};

const ContactPage = () => {
  const formId = process.env.FORMBOLD_FORM_ID;
  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Contact",
            href: "/contact",
          },
        ]}
        seoHeading={true}
      />
      <Contact formId={formId || ""} />
    </main>
  );
};

export default ContactPage;
