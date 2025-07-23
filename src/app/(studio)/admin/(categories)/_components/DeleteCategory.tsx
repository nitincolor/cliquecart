"use client";
import { useState, useTransition } from "react";
import { TrashIcon } from "@/assets/icons";
import { confirmDialog, successDialog } from "@/utils/confirmDialog";
import toast from "react-hot-toast";
import { deleteCategory } from "@/app/actions/category";

export default function DeleteCategory({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    startTransition(async () => {
      try {
        const isConfirmed = await confirmDialog(
          "Are you sure?",
          "Delete this category?"
        );

        if (!isConfirmed) {
          return;
        }
        const response = await deleteCategory(id);
        if (response?.success) {
          const msg = response?.message || "category deleted successfully";
          successDialog(msg);
        } else {
          toast.error(response?.message || "Failed to delete category");
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete category");
        setError("Failed to delete category");
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={` p-1.5 border rounded-md text-gray-6 hover:text-red size-8 inline-flex items-center justify-center border-gray-3`}
      title="Delete"
    >
      {isPending ? (
        <span className="w-5 h-5 border-2 border-gray-300 rounded-full border-blue animate-spin" />
      ) : (
        <TrashIcon />
      )}
    </button>
  );
}
