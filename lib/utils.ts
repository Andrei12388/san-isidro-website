import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const copyToClipboard = async (text: string, callback?: () => void) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Copied to clipboard:", text);
    if (callback) callback(); // call your function after copy
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};
