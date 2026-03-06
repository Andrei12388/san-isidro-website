import React, { createContext, useState, useContext } from "react";
import { ImageCropper } from "@/components/ui/editors/imageCropper";

type CropperContextType = {
  openCropper: (
    image: string,
    aspect: number
  ) => Promise<{ base64: string; file: File }>;
};

const CropperContext = createContext<CropperContextType | undefined>(undefined);

export const ImageCropperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [image, setImage] = useState<string | null>(null);
  const [aspect, setAspect] = useState(1);
  const [promiseResolver, setPromiseResolver] = useState<
    ((value: { base64: string; file: File }) => void) | null
  >(null);

  const openCropper = (img: string, asp: number) =>
    new Promise<{ base64: string; file: File }>((resolve) => {
      setImage(img);
      setAspect(asp);
      setPromiseResolver(() => resolve);
    });

  const handleCancel = () => {
    setImage(null);
    setPromiseResolver(null);
  };

  const handleComplete = (base64: string, file: File) => {
    promiseResolver?.({ base64, file });
    setImage(null);
    setPromiseResolver(null);
  };

  return (
    <CropperContext.Provider value={{ openCropper }}>
      {children}
      {image && (
        <ImageCropper
          image={image}
          aspect={aspect}
          onCancel={handleCancel}
          onComplete={handleComplete}
        />
      )}
    </CropperContext.Provider>
  );
};

export const useImageCropper = () => {
  const context = useContext(CropperContext);
  if (!context) throw new Error("useImageCropper must be used within ImageCropperProvider");
  return context;
};