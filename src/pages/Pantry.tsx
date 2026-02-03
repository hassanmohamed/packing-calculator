import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageNavigation } from '@/components/layout/PageNavigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, calculateUnitPrice } from '@/lib/utils'
import type { Item } from '@/types/database'

const CATEGORIES = [
  'dryGoods',
  'liquids',
  'canned',
  'grains',
  'spices',
  'meat',
  'packaging',
  'other',
] as const

export function PantryPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [deletingItem, setDeletingItem] = useState<Item | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    bulk_price: '',
    units_per_bulk: '',
    unit_price: '',
    weight_kg: '',
    category: 'other' as string,
  })

  const fetchItems = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [user])

  const handleOpenDialog = (item?: Item) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name_ar: item.name_ar,
        name_en: item.name_en,
        bulk_price: item.bulk_price.toString(),
        units_per_bulk: item.units_per_bulk.toString(),
        unit_price: item.unit_price.toString(),
        weight_kg: (item.weight_kg || 0).toString(),
        category: item.category || 'other',
      })
    } else {
      setEditingItem(null)
      setFormData({
        name_ar: '',
        name_en: '',
        bulk_price: '',
        units_per_bulk: '',
        unit_price: '',
        weight_kg: '',
        category: 'other',
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const bulkPrice = parseFloat(formData.bulk_price) || 0
    const unitsPerBulk = parseFloat(formData.units_per_bulk) || 1
    // Use user-entered unit price if available, otherwise calculate from bulk price
    const unitPrice = formData.unit_price 
      ? parseFloat(formData.unit_price) 
      : calculateUnitPrice(bulkPrice, unitsPerBulk)

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('items')
          .update({
            name_ar: formData.name_ar,
            name_en: formData.name_en,
            bulk_price: bulkPrice,
            units_per_bulk: unitsPerBulk,
            unit_price: unitPrice,
            weight_kg: parseFloat(formData.weight_kg) || 0,
            category: formData.category,
          })
          .eq('id', editingItem.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('items').insert({
          name_ar: formData.name_ar,
          name_en: formData.name_en,
          bulk_price: bulkPrice,
          units_per_bulk: unitsPerBulk,
          unit_price: unitPrice,
          weight_kg: parseFloat(formData.weight_kg) || 0,
          category: formData.category,
          user_id: user.id,
        })

        if (error) throw error
      }

      setDialogOpen(false)
      fetchItems()
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  const handleDelete = async () => {
    if (!deletingItem) return

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', deletingItem.id)

      if (error) throw error
      setDeleteDialogOpen(false)
      setDeletingItem(null)
      fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const filteredItems = items.filter((item) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      item.name_ar.includes(searchQuery) ||
      item.name_en.toLowerCase().includes(searchLower) ||
      item.category?.toLowerCase().includes(searchLower)
    )
  })

  // Bi-directional price calculation handlers
  const handleBulkPriceChange = (value: string) => {
    const bulkPrice = parseFloat(value) || 0
    const unitsPerBulk = parseFloat(formData.units_per_bulk) || 1
    const unitPrice = unitsPerBulk > 0 ? bulkPrice / unitsPerBulk : 0
    setFormData({ 
      ...formData, 
      bulk_price: value, 
      unit_price: unitPrice > 0 ? unitPrice.toFixed(2) : '' 
    })
  }

  const handleUnitsPerBulkChange = (value: string) => {
    const unitsPerBulk = parseFloat(value) || 1
    const bulkPrice = parseFloat(formData.bulk_price) || 0
    const unitPrice = unitsPerBulk > 0 ? bulkPrice / unitsPerBulk : 0
    setFormData({ 
      ...formData, 
      units_per_bulk: value, 
      unit_price: unitPrice > 0 ? unitPrice.toFixed(2) : '' 
    })
  }

  const handleUnitPriceChange = (value: string) => {
    const unitPrice = parseFloat(value) || 0
    const unitsPerBulk = parseFloat(formData.units_per_bulk) || 1
    const bulkPrice = unitPrice * unitsPerBulk
    setFormData({ 
      ...formData, 
      unit_price: value, 
      bulk_price: bulkPrice > 0 ? bulkPrice.toFixed(2) : '' 
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('pantry.title')}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">{t('pantry.subtitle')}</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          {t('pantry.addItem')}
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder={t('common.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-sm"
        />
      </div>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t('common.noData')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.name')}</TableHead>
                  <TableHead>{t('pantry.bulkConfig')}</TableHead>
                  <TableHead>{t('pantry.bulkPrice')}</TableHead>
                  <TableHead>{t('pantry.unitPrice')}</TableHead>
                  <TableHead>{t('common.category')}</TableHead>
                  <TableHead className="text-end">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {i18n.language === 'ar' ? item.name_ar : item.name_en}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {i18n.language === 'ar' 
                        ? `${new Intl.NumberFormat('ar-EG').format(item.units_per_bulk)} ${t('common.units')}`
                        : `${item.units_per_bulk} ${t('common.units')}`}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.bulk_price)}
                    </TableCell>
                    <TableCell className="text-emerald-600 font-medium">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                        {t(`pantry.categories.${item.category || 'other'}`)}
                      </span>
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeletingItem(item)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? t('pantry.editItem') : t('pantry.addItem')}
            </DialogTitle>
            <DialogDescription>
              {t('pantry.subtitle')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name_ar">{t('pantry.nameAr')}</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    required
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_en">{t('pantry.nameEn')}</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    required
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk_price">{t('pantry.bulkPrice')}</Label>
                  <Input
                    id="bulk_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.bulk_price}
                    onChange={(e) => handleBulkPriceChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="units_per_bulk">{t('pantry.unitsPerBulk')}</Label>
                  <Input
                    id="units_per_bulk"
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.units_per_bulk}
                    onChange={(e) => handleUnitsPerBulkChange(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit_price">{t('pantry.unitPrice')}</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => handleUnitPriceChange(e.target.value)}
                    className="border-emerald-200 focus:border-emerald-500"
                    placeholder={t('pantry.unitPriceHint')}
                  />
                  <p className="text-xs text-muted-foreground">{t('pantry.unitPriceHint')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_kg">{t('pantry.weightKg')}</Label>
                  <Input
                    id="weight_kg"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t('common.category')}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {t(`pantry.categories.${cat}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.confirm')}</DialogTitle>
            <DialogDescription>{t('pantry.deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page Navigation */}
      <PageNavigation 
        previousPath="/" 
        previousLabel={t('nav.dashboard')} 
        nextPath="/calculator" 
        nextLabel={t('nav.calculator')} 
      />
    </div>
  )
}
