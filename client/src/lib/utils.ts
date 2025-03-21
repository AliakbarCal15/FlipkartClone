import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price into Indian Rupee format
 */
export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Format a date into a readable format
 */
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Date(date).toLocaleDateString('en-IN', options);
}

/**
 * Truncate a string to a certain length and add an ellipsis
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0 || salePrice <= 0) return 0;
  if (salePrice >= originalPrice) return 0;
  
  const discount = originalPrice - salePrice;
  const percentage = (discount / originalPrice) * 100;
  
  return Math.round(percentage);
}

/**
 * Generate random time delay for countdown (for demo purposes)
 */
export function getRandomTimeDelay(): { hours: number, minutes: number, seconds: number } {
  return {
    hours: Math.floor(Math.random() * 5) + 1,
    minutes: Math.floor(Math.random() * 60),
    seconds: Math.floor(Math.random() * 60)
  };
}
