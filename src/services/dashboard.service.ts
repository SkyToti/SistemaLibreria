import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface RecentSale {
  id: string
  total_amount: number
  sale_date: string
  payment_method: 'cash' | 'card' | 'transfer'
  user: {
    full_name: string
    email: string
  } | null
}

export interface TopProduct {
  title: string
  sales: number
  revenue: number
}

export interface DashboardMetrics {
  totalSales: number
  totalRevenue: number
  totalBooks: number
  lowStockCount: number
  recentSales: RecentSale[]
  topProducts: TopProduct[]
  revenueByDay: { date: string; amount: number }[]
}

export interface InventoryReportItem {
  id: string
  title: string
  category: string
  supplier: string
  stock: number
  cost: number
  price: number
  totalValue: number
  status: 'active' | 'low_stock' | 'out_of_stock'
}

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    try {
      // Ejecutar consultas en paralelo para máxima velocidad
      const [
        statsResponse,
        topProductsResponse,
        revenueByDayResponse,
        recentSalesResponse
      ] = await Promise.all([
        supabase.rpc('get_dashboard_stats'),
        supabase.rpc('get_top_products', { limit_count: 5 }),
        supabase.rpc('get_revenue_by_day', { days_limit: 7 }),
        supabase
          .from('sales')
          .select(`
            id, 
            total_amount, 
            sale_date,
            payment_method,
            user:users (full_name, email)
          `)
          .order('sale_date', { ascending: false })
          .limit(5)
      ])

      // Procesar Stats Generales
      // @ts-ignore: RPC types
      const stats = statsResponse.data?.[0] || { total_sales: 0, total_revenue: 0, total_books: 0, low_stock_count: 0 }

      // Procesar Top Products
      // @ts-ignore: RPC types
      const topProducts: TopProduct[] = topProductsResponse.data?.map((p: any) => ({
        title: p.title,
        sales: Number(p.sales),
        revenue: Number(p.revenue)
      })) || []

      // Procesar Revenue
      // @ts-ignore: RPC types
      const revenueByDay = revenueByDayResponse.data?.map((r: any) => ({
        date: r.date,
        amount: Number(r.amount)
      })) || []

      return {
        totalSales: Number(stats.total_sales),
        totalRevenue: Number(stats.total_revenue),
        totalBooks: Number(stats.total_books),
        lowStockCount: Number(stats.low_stock_count),
        recentSales: (recentSalesResponse.data as unknown as RecentSale[]) || [],
        topProducts,
        revenueByDay
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
      // Fallback a valores vacíos para no romper la UI
      return {
        totalSales: 0,
        totalRevenue: 0,
        totalBooks: 0,
        lowStockCount: 0,
        recentSales: [],
        topProducts: [],
        revenueByDay: []
      }
    }
  },

  getInventoryReport: async (): Promise<InventoryReportItem[]> => {
    const { data: books, error } = await supabase
      .from('books')
      .select(`
        id,
        title,
        category,
        stock_quantity,
        purchase_price,
        sale_price,
        supplier:suppliers(name)
      `)
      .order('title')

    if (error) {
      console.error('Error fetching inventory report:', error)
      return []
    }

    return books.map((book) => {
      const stock = book.stock_quantity || 0
      let status: InventoryReportItem['status'] = 'active'
      if (stock === 0) status = 'out_of_stock'
      else if (stock < 5) status = 'low_stock'

      // @ts-ignore: Supabase join types
      const supplierName = book.supplier?.name || 'Sin proveedor'

      return {
        id: book.id,
        title: book.title,
        category: book.category,
        supplier: supplierName,
        stock,
        cost: Number(book.purchase_price),
        price: Number(book.sale_price),
        totalValue: stock * Number(book.sale_price),
        status
      }
    })
  }
}
