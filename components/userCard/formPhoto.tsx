import Cropper from "react-easy-crop";
import { IconCamera } from "@tabler/icons-react";
import React, { useRef, useState } from "react";

type FormPhotoProps = {
  link?: string; // original image URL or base64
  size: number;
  editable?: boolean;
  onChange?: (base64: string, file: File) => void;
};

export const FormPhoto: React.FC<FormPhotoProps> = ({
  link,
  size,
  editable = false,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState(link || ""); // original or saved image
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null); // temporary cropped preview

  const [imageSrc, setImageSrc] = useState<string | null>(null); // image loaded for cropping
  const [showCrop, setShowCrop] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  React.useEffect(() => {
    setPreview(link || "");
  }, [link]);

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleFile = async (file: File) => {
    const base64 = await fileToDataURL(file);
    setImageSrc(base64);
    setShowCrop(true);
  };

  const onCropComplete = (_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const saveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
    const file = base64ToFile(cropped, "photo.png");

    // Update temporary cropped preview
    setCroppedPreview(cropped);

    // Notify parent
    onChange?.(cropped.split(",")[1], file);

    setShowCrop(false);
  };

  const cancelCrop = () => {
    setShowCrop(false);
    setImageSrc(null);
    setCroppedAreaPixels(null);
  };

  const displayImage = croppedPreview || preview;

  return (
    <>
      <div className="relative inline-block">
        <div
          onClick={editable ? openFileDialog : undefined}
          className={`relative overflow-hidden border-2 bg-muted flex items-center justify-center rounded-full ${
            editable ? "cursor-pointer group hover:opacity-90" : ""
          }`}
          style={{ width: size, height: size }}
        >
          {displayImage ? (
            <img
              src={displayImage}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-xs text-muted-foreground">No photo</span>
          )}

          {editable && (
            <div className="absolute inset-0 bg-background opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <IconCamera className="text-foreground text-xl" />
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {/* Crop Modal */}
      {showCrop && imageSrc && (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-4 w-[320px]">
            <div className="relative w-full h-64">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} // strict 1:1
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={cancelCrop}
                className="flex-1 border rounded p-2 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={saveCrop}
                className="flex-1 bg-background text-foreground rounded p-2 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ========== Helpers ==========

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

function base64ToFile(dataUrl: string, filename: string) {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);

  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) u8arr[n] = bstr.charCodeAt(n);

  return new File([u8arr], filename, { type: mime });
}

async function getCroppedImg(imageSrc: string, crop: any) {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return canvas.toDataURL("image/png");
}

function createImage(url: string) {
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
  });
}