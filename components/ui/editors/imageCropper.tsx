import Cropper from "react-easy-crop";
import React, { useState } from "react";
import { getCroppedImg, base64ToFile } from "@/lib/ImageCrop";

type ImageCropperProps = {
  image: string;
  aspect?: number; // 1 = square, 16/9, etc.
  onCancel: () => void;
  onComplete: (base64: string, file: File) => void;
};

export const ImageCropper: React.FC<ImageCropperProps> = ({
  image,
  aspect = 1,
  onCancel,
  onComplete,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropComplete = (_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    const croppedBase64 = await getCroppedImg(image, croppedAreaPixels);
    const file = base64ToFile(croppedBase64, "image.png");

    onComplete(croppedBase64, file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999">
      <div className="bg-white rounded-xl p-4 w-[90%] max-w-md">
        <div className="relative w-full h-64">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 border rounded p-2 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white rounded p-2 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};