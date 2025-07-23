import CustomSelect from "./CustomSelect";

type PropsType = {
  allProductsCount: number;
  showingProductsCount: number;
  sortBy?: string;
};

export default function TopBar({
  allProductsCount,
  showingProductsCount,
  sortBy,
}: PropsType) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <CustomSelect />

      <p className="hidden sm:block text-dark text-custom-sm">
        Showing{" "}
        <span className="text-dark">
          {" "}
          {showingProductsCount} of {allProductsCount}{" "}
        </span>{" "}
        Products
      </p>
    </div>
  );
}
