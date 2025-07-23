import { prisma } from "@/lib/prismaDB";
import { getSiteName } from "@/get-api-data/seo-setting";
import CategoryForm from "../../../_components/CategoryForm";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
  });
  return category;
}
export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const categoryData = await getCategoryById(id);
  const siteURL = process.env.SITE_URL;
  const site_name = await getSiteName();

  if (categoryData) {
    return {
      title: `${
        categoryData?.title || "Category Page"
      } | ${site_name} - Next.js E-commerce Template`,
      description: `${categoryData?.description?.slice(0, 136)}...`,
      author: `${getSiteName}`,
      alternates: {
        canonical: `${siteURL}/admin/categories/edit/${categoryData.id}`,
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "No product category has been found",
    };
  }
}

async function EditCategoryPage({ params }: Params) {
  const { id } = await params;
  const category = await getCategoryById(id);
  return (
    <div className="max-w-4xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h2 className="text-base font-semibold text-dark">Edit Category</h2>
      </div>
      <div className="p-6">
        {category ? (
          <CategoryForm category={category} />
        ) : (
          <p className="text-red py-9.5">Category not found</p>
        )}
      </div>
    </div>
  );
}

export default EditCategoryPage;
