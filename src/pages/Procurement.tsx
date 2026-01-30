import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Package, AlertCircle, Truck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBagStore } from '@/hooks/useBagStore'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatNumber, calculateProcurement } from '@/lib/utils'
import type { ProcurementItem, BagTemplate, Item } from '@/types/database'

interface BagItem {
  item: Item
  quantity: number
}

export function ProcurementPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const { currentBag, totalBudget: storeBudget, getCostPerBag: getStoreCostPerBag } = useBagStore()
  
  const [savedBags, setSavedBags] = useState<BagTemplate[]>([])
  const [selectedBagId, setSelectedBagId] = useState<string>('current')
  const [selectedBagItems, setSelectedBagItems] = useState<BagItem[]>([])
  const [budget, setBudget] = useState<number>(storeBudget)
  const [loading, setLoading] = useState(true)
  const [loadingBag, setLoadingBag] = useState(false)

  // Fetch saved bag templates
  useEffect(() => {
    async function fetchBags() {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('bag_templates')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setSavedBags(data || [])
      } catch (error) {
        console.error('Error fetching bags:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBags()
  }, [user])

  // When a saved bag is selected, fetch its items
  useEffect(() => {
    async function loadBagItems() {
      if (selectedBagId === 'current') {
        setSelectedBagItems([])
        return
      }
      
      setLoadingBag(true)
      try {
        // Fetch bag items with their item details
        const { data, error } = await supabase
          .from('bag_items')
          .select('*, item:items(*)')
          .eq('bag_id', selectedBagId)
        
        if (error) throw error
        
        const items: BagItem[] = (data || []).map((bi: any) => ({
          item: bi.item,
          quantity: bi.quantity
        }))
        
        setSelectedBagItems(items)
        
        // Also load the template's budget if available
        const template = savedBags.find(b => b.id === selectedBagId)
        if (template?.total_budget && template.total_budget > 0) {
          setBudget(template.total_budget)
        }
      } catch (error) {
        console.error('Error loading bag items:', error)
      } finally {
        setLoadingBag(false)
      }
    }
    
    loadBagItems()
  }, [selectedBagId, savedBags])

  // Use current bag or selected saved bag
  const activeBag = selectedBagId === 'current' ? currentBag : selectedBagItems
  const activeBudget = selectedBagId === 'current' ? storeBudget : budget

  // Calculate cost per bag for active selection
  const costPerBag = useMemo(() => {
    if (selectedBagId === 'current') {
      return getStoreCostPerBag()
    }
    return activeBag.reduce((total, bi) => total + (bi.quantity * bi.item.unit_price), 0)
  }, [selectedBagId, activeBag, getStoreCostPerBag])

  // Calculate max bags from budget
  const bagCount = costPerBag > 0 ? Math.floor(activeBudget / costPerBag) : 0

  // Calculate procurement for each item
  const procurementItems: ProcurementItem[] = activeBag.map((bagItem) => {
    const { totalNeeded, bulksToBuy, looseUnits, estimatedCost } = calculateProcurement(
      bagCount,
      bagItem.quantity,
      bagItem.item.units_per_bulk,
      bagItem.item.bulk_price,
      bagItem.item.unit_price
    )

    // Calculate total weight for this item
    const totalWeight = totalNeeded * (bagItem.item.weight_kg || 0)

    return {
      item: bagItem.item,
      quantityPerBag: bagItem.quantity,
      totalNeeded,
      totalWeight,
      bulksToBuy,
      looseUnits,
      estimatedCost,
    }
  })

  const grandTotal = procurementItems.reduce((sum, pi) => sum + pi.estimatedCost, 0)
  const totalWeight = procurementItems.reduce((sum, pi) => sum + pi.totalWeight, 0)
  const trucksNeeded = Math.ceil(totalWeight / 1000) // 1000 kg per pickup truck

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('procurement.title')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">{t('procurement.subtitle')}</p>
      </div>

      {/* Bag Selector & Budget */}
      <Card className="animate-slide-up stagger-1">
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Bag Selector */}
            <div className="space-y-2">
              <Label>{t('procurement.selectBag')}</Label>
              <Select value={selectedBagId} onValueChange={setSelectedBagId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder={t('procurement.selectBag')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    {t('procurement.currentBag')} ({currentBag.length} {t('procurement.totalItems').toLowerCase()})
                  </SelectItem>
                  {savedBags.map((bag) => (
                    <SelectItem key={bag.id} value={bag.id}>
                      {bag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget Input (for saved bags) */}
            {selectedBagId !== 'current' && (
              <div className="space-y-2">
                <Label htmlFor="budget">{t('calculator.totalBudget')}</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  value={budget || ''}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  className="text-lg font-semibold"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loadingBag && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Empty state */}
      {!loadingBag && (activeBag.length === 0 || bagCount === 0) && (
        <Card className="animate-slide-up stagger-2">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <p className="text-lg font-medium">{t('procurement.noBagSelected')}</p>
            <p className="text-muted-foreground mt-1">
              {activeBag.length === 0
                ? t('procurement.addItems')
                : t('procurement.setBudget')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Procurement content */}
      {!loadingBag && activeBag.length > 0 && bagCount > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <Card className="card-hover animate-slide-up stagger-2">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground">{t('calculator.totalBudget')}</p>
                <p className="text-xl sm:text-2xl font-bold">{formatCurrency(activeBudget, i18n.language)}</p>
              </CardContent>
            </Card>
            <Card className="card-hover animate-slide-up stagger-3">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground">{t('calculator.maxBags')}</p>
                <p className="text-xl sm:text-2xl font-bold">{bagCount}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(costPerBag, i18n.language)}/{t('calculator.perBag')}</p>
              </CardContent>
            </Card>
            <Card className="card-hover animate-slide-up stagger-4">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground">{t('procurement.totalItems')}</p>
                <p className="text-xl sm:text-2xl font-bold">{procurementItems.length}</p>
              </CardContent>
            </Card>
            <Card className="card-hover animate-slide-up stagger-5">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground">{t('procurement.totalWeight')}</p>
                <p className="text-xl sm:text-2xl font-bold">{formatNumber(totalWeight, i18n.language)} kg</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white card-hover animate-slide-up stagger-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <p className="text-sm font-medium text-blue-100">{t('procurement.trucksNeeded')}</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold">{trucksNeeded}</p>
                <p className="text-xs text-blue-100">{t('procurement.perTruck')}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white card-hover animate-slide-up stagger-7">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-emerald-100">{t('procurement.grandTotal')}</p>
                <p className="text-xl sm:text-2xl font-bold">{formatCurrency(grandTotal, i18n.language)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Procurement Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {procurementItems.map((pi, index) => (
              <Card key={pi.item.id} className={`overflow-hidden card-hover animate-slide-up stagger-${Math.min(index + 6, 8)}`}>
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
                      <Package className="h-4 w-4" />
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
                    <div className="text-xs text-muted-foreground mt-1">
                      {pi.bulksToBuy > 0 && (
                        <span>
                          {formatNumber(pi.bulksToBuy, i18n.language)} × {formatCurrency(pi.item.bulk_price, i18n.language)}
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
        </>
      )}
    </div>
  )
}
