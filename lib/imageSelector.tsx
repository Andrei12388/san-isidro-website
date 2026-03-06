import { useImageCropper } from "@/context/ImageCropperContext";
import React from "react";

type ImageSelectorProps = {
  setImage: (file: File) => void; // parent callback to store the file
  aspect?: number;
};

const ImageSelector: React.FC<ImageSelectorProps> = ({ setImage, aspect = 1 }) => {
  const { openCropper } = useImageCropper();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;

      const { base64: croppedBase64, file: croppedFile } = await openCropper(
        base64,
        aspect
      );

      setImage(croppedFile);
    };
    reader.readAsDataURL(file);
  };

  return (
    <input
      type="file"
      className="border rounded px-2 py-1 cursor-pointer"
      accept="image/*"
      onChange={handleFileChange}
    />
  );
};

export default ImageSelector;