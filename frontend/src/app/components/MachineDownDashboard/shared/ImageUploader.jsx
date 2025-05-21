// ./src/app/components/MachineDownDashboard/shared/ImageUploader.jsx
import React, { useState } from "react";
import { Upload } from "lucide-react";
import Image from "next/image";

export default function ImageUploader({ onImageChange, darkMode }) {
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed");
        return;
      }

      onImageChange(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    onImageChange(null);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 ${
        darkMode ? "border-gray-600" : "border-gray-300"
      }`}
    >
      {imagePreview ? (
        <div className="space-y-2">
          <Image
            src={imagePreview}
            alt="Preview"
            width={400}
            height={200}
            className="max-h-40 rounded-lg mx-auto"
          />
          <div className="flex justify-center">
            <button
              type="button"
              onClick={removeImage}
              className={`text-sm px-3 py-1 rounded ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <Upload
            className={`h-10 w-10 mx-auto mb-2 ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          />
          <label className="cursor-pointer">
            <span
              className={`text-sm ${
                darkMode ? "text-blue-400" : "text-blue-500"
              } hover:underline`}
            >
              Click to upload
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <p
            className={`text-xs mt-1 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            PNG, JPG or JPEG (max. 5MB)
          </p>
        </div>
      )}
    </div>
  );
}
