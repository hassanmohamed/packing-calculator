import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  // Use international format (10,000,000.25) for both English and Arabic
  // This is the global standard used in technology and banking
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount)
}

export function formatNumber(num: number): string {
  // Use international format (10,000,000.25) for both English and Arabic
  return new Intl.NumberFormat('en-US', {
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
