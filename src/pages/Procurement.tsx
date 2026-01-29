import { useTranslation } from 'react-i18next'
import { ShoppingCart, Package, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBagStore } from '@/hooks/useBagStore'
import { formatCurrency, formatNumber, calculateProcurement } from '@/lib/utils'
import type { ProcurementItem } from '@/types/database'

export function ProcurementPage() {
  const { t, i18n } = useTranslation()
  const { currentBag, totalBudget, getMaxBags, getCostPerBag } = useBagStore()

  // Calculate bags based on budget (not target count)
  const bagCount = getMaxBags()
  const costPerBag = getCostPerBag()

  // Calculate procurement for each item
  const procurementItems: ProcurementItem[] = currentBag.map((bagItem) => {
    const { totalNeeded, bulksToBuy, looseUnits, estimatedCost } = calculateProcurement(
      bagCount,
      bagItem.quantity,
      bagItem.item.units_per_bulk,
      bagItem.item.bulk_price,
      bagItem.item.unit_price
    )

    return {
      item: bagItem.item,
      quantityPerBag: bagItem.quantity,
      totalNeeded,
      bulksToBuy,
      looseUnits,
      estimatedCost,
    }
  })

  const grandTotal = procurementItems.reduce((sum, pi) => sum + pi.estimatedCost, 0)

  if (currentBag.length === 0 || bagCount === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('procurement.title')}</h1>
          <p className="text-muted-foreground">{t('procurement.subtitle')}</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <p className="text-lg font-medium">{t('procurement.noBagSelected')}</p>
            <p className="text-muted-foreground mt-1">
              {totalBudget === 0
                ? t('procurement.setBudget')
                : t('procurement.addItems')}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('procurement.title')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">{t('procurement.subtitle')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">{t('calculator.totalBudget')}</p>
            <p className="text-2xl font-bold">{formatCurrency(totalBudget, i18n.language)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">{t('calculator.maxBags')}</p>
            <p className="text-2xl font-bold">{bagCount}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(costPerBag, i18n.language)}/{t('calculator.perBag')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">{t('procurement.totalItems')}</p>
            <p className="text-2xl font-bold">{procurementItems.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-emerald-100">{t('procurement.grandTotal')}</p>
            <p className="text-2xl font-bold">{formatCurrency(grandTotal, i18n.language)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Procurement Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {procurementItems.map((pi) => (
          <Card key={pi.item.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {i18n.language === 'ar' ? pi.item.name_ar : pi.item.name_en}
                  </CardTitle>
                  <CardDescription>
                    {pi.quantityPerBag} × {bagCount} {t('calculator.maxBags').toLowerCase()}
                  </CardDescription>
                </div>
                <div className="rounded-full bg-muted p-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Total Needed */}
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">{t('common.total')}</p>
                <p className="text-xl font-bold">{formatNumber(pi.totalNeeded, i18n.language)} {t('common.units')}</p>
              </div>

              {/* What to Buy */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t('procurement.buy')}:</p>
                <div className="flex flex-wrap gap-2">
                  {pi.bulksToBuy > 0 && (
                    <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300">
                      <ShoppingCart className="h-3 w-3 me-1" />
                      {formatNumber(pi.bulksToBuy, i18n.language)} {t('procurement.sacks')} ({formatNumber(pi.item.units_per_bulk, i18n.language)} {t('common.unitsEach')})
                    </div>
                  )}
                  {pi.looseUnits > 0 && (
                    <div className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-300">
                      + {formatNumber(pi.looseUnits, i18n.language)} {t('common.units')} {t('procurement.extra')}
                    </div>
                  )}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('procurement.estimatedCost')}</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {formatCurrency(pi.estimatedCost, i18n.language)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {pi.bulksToBuy > 0 && (
                    <span>
                      {pi.bulksToBuy} × {formatCurrency(pi.item.bulk_price, i18n.language)}
                    </span>
                  )}
                  {pi.bulksToBuy > 0 && pi.looseUnits > 0 && <span> + </span>}
                  {pi.looseUnits > 0 && (
                    <span>
                      {formatNumber(pi.looseUnits, i18n.language)} × {formatCurrency(pi.item.unit_price, i18n.language)}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
