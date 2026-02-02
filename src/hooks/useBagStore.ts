import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Item, BagTemplate, BagItemWithDetails } from '@/types/database'

interface BagItem {
  item: Item
  quantity: number
}

interface BagStore {
  // Current bag being edited
  currentBag: BagItem[]
  bagName: string
  targetCount: number
  totalBudget: number
  
  // Actions
  addItem: (item: Item) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  setTargetCount: (count: number) => void
  setTotalBudget: (budget: number) => void
  setBagName: (name: string) => void
  clearBag: () => void
  loadBag: (template: BagTemplate, items: BagItemWithDetails[]) => void
  
  // Computed values
  getCostPerBag: () => number
  getMaxBags: () => number
  getTotalCostRequired: () => number
}

export const useBagStore = create<BagStore>()(
  persist(
    (set, get) => ({
      currentBag: [],
      bagName: '',
      targetCount: 0,
      totalBudget: 0,
      
      addItem: (item) => {
        const { currentBag } = get()
        const existingItem = currentBag.find(bi => bi.item.id === item.id)
        
        if (existingItem) {
          // Already exists, don't add duplicate
          return
        }
        
        set({
          currentBag: [...currentBag, { item, quantity: 1 }]
        })
      },
      
      removeItem: (itemId) => {
        set({
          currentBag: get().currentBag.filter(bi => bi.item.id !== itemId)
        })
      },
      
      updateQuantity: (itemId, quantity) => {
        if (quantity < 0) return
        
        set({
          currentBag: get().currentBag.map(bi =>
            bi.item.id === itemId ? { ...bi, quantity } : bi
          )
        })
      },
      
      setTargetCount: (count) => {
        if (count < 0) return
        set({ targetCount: count })
      },
      
      setTotalBudget: (budget) => {
        if (budget < 0) return
        set({ totalBudget: budget })
      },
      
      setBagName: (name) => {
        set({ bagName: name })
      },
      
      clearBag: () => {
        set({
          currentBag: [],
          bagName: '',
          targetCount: 0,
          totalBudget: 0
        })
      },
      
      loadBag: (template, items) => {
        set({
          bagName: template.name,
          targetCount: template.target_count,
          totalBudget: template.total_budget,
          currentBag: items.map(bi => ({
            item: bi.item,
            quantity: bi.quantity
          }))
        })
      },
      
      getCostPerBag: () => {
        const { currentBag } = get()
        return currentBag.reduce((total, bi) => {
          return total + (bi.quantity * bi.item.unit_price)
        }, 0)
      },
      
      getMaxBags: () => {
        const { totalBudget } = get()
        const costPerBag = get().getCostPerBag()
        if (costPerBag <= 0) return 0
        return Math.floor(totalBudget / costPerBag)
      },
      
      getTotalCostRequired: () => {
        const { targetCount } = get()
        const costPerBag = get().getCostPerBag()
        return targetCount * costPerBag
      }
    }),
    {
      name: 'charity-bag-store',
      partialize: (state) => ({
        currentBag: state.currentBag,
        bagName: state.bagName,
        targetCount: state.targetCount,
        totalBudget: state.totalBudget,
      }),
    }
  )
)
