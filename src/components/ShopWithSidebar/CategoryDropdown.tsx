"use client";
import { CheckMarkIcon2, SidebarChevronDownIcon } from "@/assets/icons";
import { Category } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type PropsType = {
  categories: (Category & { productCount: number })[];
};

const CategoryDropdown = ({ categories }: PropsType) => {
  const [isOpen, setIsOpen] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleCategory = (categoryId: string, isChecked: boolean) => {
    const params = new URLSearchParams(searchParams);
    const categoryParam = params.get("category");

    if (isChecked) {
      params.set(
        "category",
        categoryParam ? `${categoryParam},${categoryId}` : categoryId
      );
    } else {
      const newParam = categoryParam
        ?.split(",")
        .filter((id) => id !== categoryId);

      if (newParam?.length) {
        params.set("category", newParam.join(","));
      } else {
        params.delete("category");
      }
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (!categories.length) return null;

  return (
    <div className="bg-white rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 w-full ${
          isOpen && "shadow-filter"
        }`}
      >
        <span className="text-dark">Category</span>

        <SidebarChevronDownIcon
          className={`text-dark ease-out duration-200 ${
            isOpen && "rotate-180"
          }`}
        />
      </button>

      <div className="flex flex-col gap-3 px-6 py-5" hidden={!isOpen}>
        {categories.map((category) => (
          <label
            htmlFor={category.slug}
            key={category.slug}
            className="flex items-center justify-start gap-2 cursor-pointer group hover:text-blue"
          >
            <input
              type="checkbox"
              className="sr-only peer"
              defaultChecked={searchParams
                .get("category")
                ?.split(",")
                .includes(category.slug)}
              onChange={(e) => {
                handleCategory(category.slug, e.target.checked);
              }}
              id={category.slug}
            />

            <span className="flex-1 text-base font-normal peer-checked:text-blue">
              {category.title}
            </span>

            <span className="peer-checked:text-white peer-checked:bg-blue bg-gray-2 inline-flex rounded-[30px] text-custom-xs px-2 ease-out duration-200 group-hover:text-white group-hover:bg-blue">
              {category.productCount}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CategoryDropdown;
