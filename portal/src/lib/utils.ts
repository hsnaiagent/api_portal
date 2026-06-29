import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export function maskSecret(secret: string) {
  if (secret.length <= 8) return '••••••••';
  return secret.slice(0, 4) + '••••••••' + secret.slice(-4);
}
