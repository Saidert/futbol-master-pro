import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases condicionales de Tailwind CSS de manera segura
 */
export function cn(...inputs: ClassValue[]) {
  try {
    return twMerge(clsx(inputs));
  } catch {
    return inputs.filter(Boolean).join(" ");
  }
}
