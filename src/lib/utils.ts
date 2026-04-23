import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  const formatted = price % 1 === 0 ? price.toFixed(0) : price.toFixed(2);
  return `${formatted} د.م`;
}

/**
 * Remove all non-digit characters from phone number
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

/**
 * Format phone number for WhatsApp (international format with country code)
 * Handles Moroccan numbers: converts 0XXXXXXXXX or XXXXXXXXX to 212XXXXXXXXX
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const digits = normalizePhone(phone);

  // If starts with 0 (local Moroccan format with leading 0), remove 0 and add 212
  if (digits.startsWith("0") && digits.length === 10) {
    return "212" + digits.substring(1);
  }

  // If 9 digits without leading 0, add 212 prefix (local Moroccan format)
  if (digits.length === 9 && !digits.startsWith("212")) {
    return "212" + digits;
  }

  // If already starts with 212, keep as is
  if (digits.startsWith("212")) {
    return digits;
  }

  // Otherwise return digits as is
  return digits;
}

/**
 * Format phone number for display (with + prefix)
 * Handles Moroccan numbers: converts 0XXXXXXXXX or XXXXXXXXX to +212XXXXXXXXX
 */
export function formatPhoneInternational(phone: string): string {
  const digits = normalizePhone(phone);

  // If starts with 0 (local format with leading 0), remove 0 and add +212
  if (digits.startsWith("0") && digits.length === 10) {
    return "+212" + digits.substring(1);
  }

  // If 9 digits without leading 0, add +212 prefix (local Moroccan format)
  if (digits.length === 9 && !digits.startsWith("212")) {
    return "+212" + digits;
  }

  // If starts with 212, add +
  if (digits.startsWith("212")) {
    return "+" + digits;
  }

  // Return original with + prefix
  return "+" + digits;
}
