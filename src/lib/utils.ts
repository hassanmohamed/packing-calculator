import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount)
}

export function formatNumber(num: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
  }).format(num)
}

export function calculateUnitPrice(bulkPrice: number, unitsPerBulk: number): number {
  if (unitsPerBulk <= 0) return 0
  return bulkPrice / unitsPerBulk
}

export function calculateProcurement(
  bagCount: number,
  quantityPerBag: number,
  unitsPerBulk: number,
  bulkPrice: number,
  unitPrice: number
) {
  const totalNeeded = bagCount * quantityPerBag
  const bulksToBuy = Math.floor(totalNeeded / unitsPerBulk)
  const looseUnits = totalNeeded % unitsPerBulk
  const estimatedCost = (bulksToBuy * bulkPrice) + (looseUnits * unitPrice)
  
  return {
    totalNeeded,
    bulksToBuy,
    looseUnits,
    estimatedCost,
  }
}
