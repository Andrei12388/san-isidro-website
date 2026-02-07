import { IconCamera } from "@tabler/icons-react";
import React, { useRef, useState } from "react";

type FormPhotoProps = {
  link?: string;          // base64 string
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
  const [preview, setPreview] = useState(link);

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleFile = async (file: File) => {
    const base64 = await fileToBase64(file);
    setPreview(base64);
    onChange?.(base64, file);
  };

  return (
    <div className=" relative inline-block">
      <div
        onClick={editable ? openFileDialog : undefined}
        className={`
          relative overflow-hidden border-2
          bg-muted flex items-center justify-center  rounded-full
          transition
          ${editable ? "cursor-pointer group hover:opacity-90" : ""}
        `}
        style={{ width: size, height: size }}
      >
        {preview ? (
          <img
            src={`data:image/png;base64,${preview}`}
            className="w-full h-full rounded-full object-cover"
            alt="photo"
          />
        ) : (
          <span className="text-muted-foreground text-xs">No photo</span>
        )}

        {editable && (
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
            <span className="text-white text-xl"><IconCamera/></span>
          </div>
        )}
      </div>

      {/* Hidden native file input */}
      {editable && (
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
      )}
    </div>
  );
};


// helper
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // remove prefix
    };

    reader.onerror = reject;
  });
}
