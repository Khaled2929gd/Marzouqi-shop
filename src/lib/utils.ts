import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  const formatted = price % 1 === 0 ? price.toFixed(0) : price.toFixed(2);
  return `${formatted} د.م`;
}
