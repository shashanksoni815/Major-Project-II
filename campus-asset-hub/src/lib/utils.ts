import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveImageUrl(imagePath: string): string {
  if (!imagePath) return "";
  // If it's already an absolute URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  // If it's a data URL, return as is
  if (imagePath.startsWith("data:")) {
    return imagePath;
  }
  // If it's a blob URL (from URL.createObjectURL), return as is
  if (imagePath.startsWith("blob:")) {
    return imagePath;
  }
  // If it's a relative path to uploads, prepend the API base
  if (imagePath.startsWith("/uploads/")) {
    const apiBase = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";
    return `${apiBase}${imagePath}`;
  }
  return imagePath;
}
