export interface Item {
  id: string
  name_ar: string
  name_en: string
  unit_price: number
  bulk_price: number
  units_per_bulk: number
  category: string | null
  created_at?: string
  user_id?: string
}

export interface BagTemplate {
  id: string
  name: string
  target_count: number
  total_budget: number
  created_at?: string
  user_id?: string
}

export interface BagItem {
  id: string
  bag_id: string
  item_id: string
  quantity: number
  item?: Item
}

export interface BagItemWithDetails extends BagItem {
  item: Item
  cost: number
}

export interface ProcurementItem {
  item: Item
  quantityPerBag: number
  totalNeeded: number
  bulksToBuy: number
  looseUnits: number
  estimatedCost: number
}

// Supabase Database types
export interface Database {
  public: {
    Tables: {
      items: {
        Row: Item
        Insert: {
          name_ar: string
          name_en: string
          unit_price: number
          bulk_price: number
          units_per_bulk: number
          category?: string | null
          user_id?: string
        }
        Update: {
          name_ar?: string
          name_en?: string
          unit_price?: number
          bulk_price?: number
          units_per_bulk?: number
          category?: string | null
        }
      }
      bag_templates: {
        Row: BagTemplate
        Insert: {
          name: string
          target_count?: number
          total_budget?: number
          user_id?: string
        }
        Update: {
          name?: string
          target_count?: number
          total_budget?: number
        }
      }
      bag_items: {
        Row: BagItem
        Insert: {
          bag_id: string
          item_id: string
          quantity: number
        }
        Update: {
          bag_id?: string
          item_id?: string
          quantity?: number
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
