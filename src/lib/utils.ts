// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Agregar estas funciones ↓

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "-"

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("es-ES", options || defaultOptions).format(dateObj)
  } catch {
    return "-"
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj)
  } catch {
    return "-"
  }
}