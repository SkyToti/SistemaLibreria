import { createClient } from '@/lib/supabase/client'
import { CartItem } from '@/store/cart.store'

const supabase = createClient()

export interface Sale {
  id: string
  user_id: string
  total_amount: number
  discount_amount: number
  payment_method: 'cash' | 'card' | 'transfer'
  notes?: string
  sale_date: string
}

export interface SaleItem {
  id: string
  sale_id: string
  book_id: string
  quantity: number
  unit_price: number
  total_price: number
  book?: {
    title: string
    isbn: string
  }
}

export interface SaleWithItems extends Sale {
  sale_items: SaleItem[]
  user?: {
    full_name: string
    email: string
  }
}

export interface GetSalesParams {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}

export interface PaginatedSales {
  data: SaleWithItems[]
  count: number
}

export const salesService = {
  getSales: async (params: GetSalesParams = {}): Promise<PaginatedSales> => {
    const { page = 1, limit = 50, startDate, endDate } = params
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          *,
          book:books (title, isbn)
        ),
        user:users (full_name, email)
      `, { count: 'exact' })
      .order('sale_date', { ascending: false })
      .range(from, to)

    if (startDate) {
      query = query.gte('sale_date', startDate)
    }

    if (endDate) {
      query = query.lte('sale_date', endDate)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching sales:', error)
      throw new Error('Error al cargar historial de ventas')
    }

    return {
      data: data || [],
      count: count || 0
    }
  },

  processSale: async (items: CartItem[], totalAmount: number, paymentMethod: 'cash' | 'card') => {
    try {
      // 1. Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Usuario no autenticado')

      // 2. Preparar payload para RPC
      const itemsPayload = items.map(item => ({
        book_id: item.id,
        quantity: item.quantity,
        unit_price: item.sale_price
      }))

      // 3. Ejecutar transacción atómica en BD
      const { data, error } = await supabase.rpc('process_sale_transaction', {
        p_user_id: user.id,
        p_total_amount: totalAmount,
        p_payment_method: paymentMethod,
        p_items: itemsPayload
      })

      if (error) {
        console.error('RPC Error:', error)
        throw new Error(error.message || 'Error al procesar la venta en el servidor')
      }

      return data
    } catch (error) {
      console.error('Error procesando venta:', error)
      throw error
    }
  }
}
