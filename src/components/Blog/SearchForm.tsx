"use client";
import { SearchIcon } from "@/assets/icons";
import React from "react";
import GlobalSearchModal from "../Common/GlobalSearch";

const SearchForm = () => {
  const [searchModalOpen, setSearchModalOpen] = React.useState(false);

  return (
    <>
      <div className="bg-white shadow-1 rounded-xl">
        <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
          <h2 className="text-lg font-medium text-dark">Search</h2>
        </div>

        <div className="p-4 sm:p-6">
          <form>
            <div className="relative">
              <input
                onClick={() => setSearchModalOpen(true)}
                type="text"
                placeholder="Search here..."
                className="w-full h-12 px-4 py-3 duration-200 border rounded-lg p-13 border-gray-3 placeholder:text-sm placeholder:text-dark-5 outline-hidden focus:border-blue focus:ring-0"
              />
              <button className="text-dark-2 absolute right-0 top-0 px-4 py-3.5 ease-out duration-200 hover:text-blue">
                <SearchIcon />
              </button>
            </div>
          </form>
        </div>
      </div>

      {searchModalOpen && (
        <GlobalSearchModal
          searchModalOpen={searchModalOpen}
          setSearchModalOpen={setSearchModalOpen}
          currentFilter={"blogs"}
        />
      )}
    </>
  );
};

export default SearchForm;
