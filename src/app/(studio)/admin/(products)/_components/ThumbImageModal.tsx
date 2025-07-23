import { useEffect, useState } from "react";
import ImageUpload from "../../_components/ImageUpload";
import toast from "react-hot-toast";

interface Thumbnail {
  color: string;
  size: string;
  image: File | null;
  isDefault: boolean;
}

type PropsType = {
  isOpen: boolean;
  closeModal: () => void;
  tempProductvariant: Thumbnail;
  setTempProductvariant: (thumb: Thumbnail) => void;
  saveProductvariant: () => void;
};

const ThumbImageModal = ({
  isOpen,
  closeModal,
  tempProductvariant,
  setTempProductvariant,
  saveProductvariant,
}: PropsType) => {
  const [size, setSize] = useState("");

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (!event.target.closest(".modal-content")) {
        closeModal();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeModal]);

  const handleImageChange = (files: File[] | null) => {
    setTempProductvariant({
      ...tempProductvariant,
      image: files ? files[0] : null,
    });
  };

  const handleColorChange = (color: string) => {
    setTempProductvariant({ ...tempProductvariant, color });
  };
  const handleSizeChange = (size: string) => {
    setTempProductvariant({ ...tempProductvariant, size });
    setSize(size);
  };

  const handleSave = () => {
    if (!tempProductvariant.image || !tempProductvariant.color) {
      toast.error("Please select an image and a color.");
      return;
    }

    const newVariant = {
      ...tempProductvariant,
      isDefault: tempProductvariant.isDefault
    };

    setTempProductvariant(newVariant);
    saveProductvariant();
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full h-screen p-5  flex items-center justify-center ${
        isOpen ? "block z-999" : "hidden"
      }`}
    >
      <div className="fixed inset-0 bg-dark/70" onClick={closeModal}></div>
      <div className="w-full max-w-[600px] rounded-xl shadow-3 bg-white p-5 sm:p-7.5 relative modal-content">
        <button
          onClick={closeModal}
          className="absolute inline-flex items-center justify-center duration-200 ease-out rounded-full top-3 right-3 size-8 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red bg-gray-2"
        >
          <span className="sr-only">Close modal</span>
          <svg
            className="size-5"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <h2 className="mb-4 text-base font-semibold">Product Variants</h2>

        {/* Image Upload */}
        <ImageUpload
          label="Select Thumbnail (Recommended: 570x510)"
          images={tempProductvariant.image ? [tempProductvariant.image] : []}
          setImages={handleImageChange}
          multiple={false}
          showTitle={true}
          setColor={handleColorChange}
        />

        <div className="w-full my-5">
          <label className="block text-sm font-normal text-gray-600 mb-1.5">
            Size
          </label>
          <input
            value={size}
            type="text"
            onChange={(e) => handleSizeChange(e.target.value)}
            placeholder="Enter size"
            className="rounded-lg border border-gray-3 text-sm placeholder:text-dark-5 w-full py-2.5 px-4 h-11 focus:ring-0 duration-200 focus:border-blue focus:outline-0"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-3 text-sm font-normal text-white duration-200 ease-out rounded-lg bg-blue hover:bg-blue-dark"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ThumbImageModal;
