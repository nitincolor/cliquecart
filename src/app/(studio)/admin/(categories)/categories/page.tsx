import Link from "next/link";
import Image from "next/image";
import { Category } from "@prisma/client";
import { getCategories } from "@/get-api-data/category";
import { PlusIcon } from "@/assets/icons";
import DeleteCategory from "../_components/DeleteCategory";
import { EditIcon } from "../../_components/Icons";

export default async function CategoryPage() {
  const categoryData: Category[] = await getCategories();
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="font-semibold text-bse text-dark">All Category</h2>
        <Link
          href="/admin/add-category"
          className="inline-flex items-center gap-2 px-4 py-3 text-sm font-normal text-white duration-200 ease-out rounded-lg bg-dark hover:bg-darkLight"
        >
          <PlusIcon className="w-3 h-3" /> Add Category
        </Link>
      </div>

      {categoryData && (
        <div className="overflow-x-auto">
          {categoryData.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="border-y border-gray-3 ">
                  <th className="px-6 py-3.5  font-medium text-left  text-custom-sm text-gray-6">
                    Image
                  </th>
                  <th className="px-6 py-3.5  font-medium text-left  text-custom-sm text-gray-6">
                    Title
                  </th>
                  <th className="px-6 py-3.5  font-medium  text-custom-sm text-gray-6 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-3 text-dark">
                {categoryData.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-3.5">
                      <div className="inline-flex items-center justify-center border rounded-lg border-gray-3 size-13">
                        <Image
                          src={item.img}
                          alt="category"
                          width={48}
                          height={48}
                          className=""
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.title}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end items-center gap-2.5">
                        {/* delete category */}
                        <DeleteCategory id={item.id} />
                        {/* edit category */}
                        <Link
                          href={`/admin/categories/edit/${item.id}`}
                          aria-label="edit category"
                          className="p-1.5 border rounded-md text-gray-6 hover:text-blue size-8 inline-flex items-center justify-center border-gray-3"
                        >
                          <EditIcon />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-red py-9.5 text-center">No categories found</p>
          )}
        </div>
      )}
    </div>
  );
}
