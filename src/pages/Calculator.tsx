import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Minus, Save, Trash2, Package, ShoppingBag, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useBagStore } from '@/hooks/useBagStore'
import { formatCurrency } from '@/lib/utils'
import type { Item, BagTemplate } from '@/types/database'

export function CalculatorPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const {
    currentBag,
    bagName,
    targetCount,
    totalBudget,
    addItem,
    removeItem,
    updateQuantity,
    setTargetCount,
    setTotalBudget,
    setBagName,
    clearBag,
    loadBag,
    getCostPerBag,
    getMaxBags,
    getTotalCostRequired,
  } = useBagStore()

  const [items, setItems] = useState<Item[]>([])
  const [savedBags, setSavedBags] = useState<BagTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingBag, setLoadingBag] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      try {
        // Fetch items
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .order('name_en')

        if (itemsError) throw itemsError
        setItems(itemsData || [])

        // Fetch saved bag templates
        const { data: bagsData, error: bagsError } = await supabase
          .from('bag_templates')
          .select('*')
          .order('created_at', { ascending: false })

        if (bagsError) throw bagsError
        setSavedBags(bagsData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleSaveBag = async () => {
    if (!user || !bagName.trim()) return

    setSaving(true)
    try {
      // Create bag template
      const { data: bagTemplate, error: bagError } = await supabase
        .from('bag_templates')
        .insert({
          name: bagName,
          target_count: targetCount,
          total_budget: totalBudget,
          user_id: user.id,
        })
        .select()
        .single()

      if (bagError) throw bagError

      // Insert bag items
      const bagItems = currentBag.map((bi) => ({
        bag_id: bagTemplate.id,
        item_id: bi.item.id,
        quantity: bi.quantity,
      }))

      if (bagItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('bag_items')
          .insert(bagItems)

        if (itemsError) throw itemsError
      }

      // Refresh saved bags list
      const { data: updatedBags } = await supabase
        .from('bag_templates')
        .select('*')
        .order('created_at', { ascending: false })
      
      setSavedBags(updatedBags || [])
      setSaveDialogOpen(false)
    } catch (error) {
      console.error('Error saving bag:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleLoadBag = async (bagId: string) => {
    if (!bagId) return

    setLoadingBag(true)
    try {
      // Fetch bag template
      const { data: template, error: templateError } = await supabase
        .from('bag_templates')
        .select('*')
        .eq('id', bagId)
        .single()

      if (templateError) throw templateError

      // Fetch bag items with their item details
      const { data: bagItems, error: itemsError } = await supabase
        .from('bag_items')
        .select('*, item:items(*)')
        .eq('bag_id', bagId)

      if (itemsError) throw itemsError

      // Transform and load into store
      const itemsWithDetails = (bagItems || []).map((bi: any) => ({
        ...bi,
        item: bi.item,
        cost: bi.quantity * bi.item.unit_price,
      }))

      loadBag(template, itemsWithDetails)
      setLoadDialogOpen(false)
    } catch (error) {
      console.error('Error loading bag:', error)
    } finally {
      setLoadingBag(false)
    }
  }

  const filteredItems = items.filter((item) => {
    const searchLower = searchQuery.toLowerCase()
    const inBag = currentBag.some((bi) => bi.item.id === item.id)
    return (
      !inBag &&
      (item.name_ar.includes(searchQuery) ||
        item.name_en.toLowerCase().includes(searchLower))
    )
  })

  const costPerBag = getCostPerBag()
  const maxBags = getMaxBags()
  const totalCostRequired = getTotalCostRequired()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('calculator.title')}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">{t('calculator.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setLoadDialogOpen(true)} disabled={savedBags.length === 0}>
            <FolderOpen className="h-4 w-4 sm:me-2" />
            <span className="hidden sm:inline">{t('calculator.loadBag')}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={clearBag}>
            <Trash2 className="h-4 w-4 sm:me-2" />
            <span className="hidden sm:inline">{t('common.delete')}</span>
          </Button>
          <Button size="sm" onClick={() => setSaveDialogOpen(true)} disabled={currentBag.length === 0}>
            <Save className="h-4 w-4 sm:me-2" />
            <span className="hidden sm:inline">{t('calculator.saveBag')}</span>
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-emerald-100">{t('calculator.costPerBag')}</p>
            <p className="text-2xl font-bold">{formatCurrency(costPerBag, i18n.language)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Label htmlFor="totalBudget" className="text-sm text-muted-foreground">
              {t('calculator.totalBudget')}
            </Label>
            <Input
              id="totalBudget"
              type="number"
              min="0"
              value={totalBudget || ''}
              onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
              className="mt-1 text-lg font-semibold"
            />
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">{t('calculator.maxBags')}</p>
            <p className="text-2xl font-bold text-blue-600">{maxBags}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Label htmlFor="targetCount" className="text-sm text-muted-foreground">
              {t('calculator.targetBags')}
            </Label>
            <Input
              id="targetCount"
              type="number"
              min="0"
              value={targetCount || ''}
              onChange={(e) => setTargetCount(parseInt(e.target.value) || 0)}
              className="mt-1 text-lg font-semibold"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('calculator.totalCost')}: {formatCurrency(totalCostRequired, i18n.language)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Item Palette */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('calculator.itemPalette')}
            </CardTitle>
            <CardDescription>
              {items.length} {t('dashboard.stats.totalItems').toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">
                        {i18n.language === 'ar' ? item.name_ar : item.name_en}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unit_price, i18n.language)}/{t('common.unit')}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => addItem(item)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bag Contents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              {t('calculator.bagContents')}
            </CardTitle>
            <CardDescription>
              {currentBag.length} items • {formatCurrency(costPerBag, i18n.language)} {t('calculator.perBag')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentBag.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">{t('calculator.emptyBag')}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {currentBag.map((bagItem) => (
                  <div
                    key={bagItem.item.id}
                    className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {i18n.language === 'ar' ? bagItem.item.name_ar : bagItem.item.name_en}
                      </p>
                      <p className="text-sm text-emerald-600 font-medium">
                        {formatCurrency(bagItem.quantity * bagItem.item.unit_price, i18n.language)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-1 sm:gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 shrink-0"
                        onClick={() => updateQuantity(bagItem.item.id, bagItem.quantity - 0.5)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={bagItem.quantity}
                        onChange={(e) =>
                          updateQuantity(bagItem.item.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-16 sm:w-20 text-center"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 shrink-0"
                        onClick={() => updateQuantity(bagItem.item.id, bagItem.quantity + 0.5)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0 text-destructive"
                        onClick={() => removeItem(bagItem.item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('calculator.saveBag')}</DialogTitle>
            <DialogDescription>{t('calculator.subtitle')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bagName">{t('calculator.bagName')}</Label>
              <Input
                id="bagName"
                value={bagName}
                onChange={(e) => setBagName(e.target.value)}
                placeholder="Ramadan 2024 Standard Bag"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveBag} disabled={saving || !bagName.trim()}>
              {saving ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('calculator.loadBag')}</DialogTitle>
            <DialogDescription>{t('calculator.selectTemplate')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('calculator.savedBags')}</Label>
              <Select onValueChange={handleLoadBag} disabled={loadingBag}>
                <SelectTrigger>
                  <SelectValue placeholder={t('calculator.selectTemplate')} />
                </SelectTrigger>
                <SelectContent>
                  {savedBags.map((bag) => (
                    <SelectItem key={bag.id} value={bag.id}>
                      {bag.name} ({bag.target_count} bags)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoadDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
