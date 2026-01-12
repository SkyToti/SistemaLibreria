import { describe, it, expect, vi, beforeEach } from 'vitest'
import { salesService } from '../sales.service'

// Mock functions need to be hoisted to be used in vi.mock
const mocks = vi.hoisted(() => {
  const mockSelect = vi.fn()
  const mockOrder = vi.fn()
  const mockRange = vi.fn()
  const mockGte = vi.fn()
  const mockLte = vi.fn()
  const mockInsert = vi.fn()
  const mockSingle = vi.fn()
  const mockUpdate = vi.fn()
  const mockEq = vi.fn()
  const mockAuthGetUser = vi.fn()
  
  // Chainable query builder mock
  const mockQueryBuilder = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    order: mockOrder,
    range: mockRange,
    gte: mockGte,
    lte: mockLte,
    single: mockSingle,
    eq: mockEq,
    // Add 'then' to make it thenable (awaitable)
    then: vi.fn((resolve) => resolve({ data: [], count: 0, error: null }))
  }

  // Setup default return values for chain
  mockSelect.mockReturnValue(mockQueryBuilder)
  mockOrder.mockReturnValue(mockQueryBuilder)
  mockRange.mockReturnValue(mockQueryBuilder) // range returns builder which is awaitable
  mockGte.mockReturnValue(mockQueryBuilder)
  mockLte.mockReturnValue(mockQueryBuilder)
  mockInsert.mockReturnValue(mockQueryBuilder)
  mockUpdate.mockReturnValue(mockQueryBuilder)
  mockEq.mockReturnValue(mockQueryBuilder)
  mockSingle.mockReturnValue(mockQueryBuilder)

  return {
    mockSelect,
    mockOrder,
    mockRange,
    mockGte,
    mockLte,
    mockInsert,
    mockSingle,
    mockUpdate,
    mockEq,
    mockAuthGetUser,
    mockQueryBuilder,
    mockSupabase: {
      from: vi.fn(() => mockQueryBuilder),
      auth: {
        getUser: mockAuthGetUser
      }
    }
  }
})

// Mockear el módulo @/lib/supabase/client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mocks.mockSupabase
}))

describe('salesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset default behavior
    mocks.mockQueryBuilder.then.mockImplementation((resolve) => resolve({ data: [], count: 0, error: null }))
    
    // Default chain returns
    mocks.mockSelect.mockReturnValue(mocks.mockQueryBuilder)
    mocks.mockOrder.mockReturnValue(mocks.mockQueryBuilder)
    mocks.mockRange.mockReturnValue(mocks.mockQueryBuilder)
    mocks.mockInsert.mockReturnValue(mocks.mockQueryBuilder)
    mocks.mockSingle.mockReturnValue(mocks.mockQueryBuilder)
  })

  describe('getSales', () => {
    it('debería llamar a supabase con paginación por defecto', async () => {
      // Setup successful response
      mocks.mockQueryBuilder.then.mockImplementation((resolve) => resolve({ 
        data: [{ id: '1' }], 
        count: 1, 
        error: null 
      }))

      const result = await salesService.getSales({ page: 1, limit: 10 })

      expect(mocks.mockSupabase.from).toHaveBeenCalledWith('sales')
      expect(mocks.mockSelect).toHaveBeenCalled()
      expect(mocks.mockOrder).toHaveBeenCalledWith('sale_date', { ascending: false })
      expect(mocks.mockRange).toHaveBeenCalledWith(0, 9)
      expect(result.data).toHaveLength(1)
      expect(result.count).toBe(1)
    })

    it('debería aplicar filtros de fecha si se proporcionan', async () => {
      await salesService.getSales({ 
        startDate: '2024-01-01', 
        endDate: '2024-01-31' 
      })

      expect(mocks.mockGte).toHaveBeenCalledWith('sale_date', '2024-01-01')
      expect(mocks.mockLte).toHaveBeenCalledWith('sale_date', '2024-01-31')
    })

    it('debería lanzar error si supabase falla', async () => {
      // Simulate error response
      mocks.mockQueryBuilder.then.mockImplementation((resolve) => resolve({ 
        data: null, 
        count: null, 
        error: { message: 'DB Error' } 
      }))

      await expect(salesService.getSales())
        .rejects
        .toThrow('Error al cargar historial de ventas')
    })
  })

  describe('processSale', () => {
    const mockItems = [
      { id: 'book-1', title: 'Book 1', sale_price: 100, quantity: 2, stock_quantity: 10 }
    ]

    it('debería procesar una venta correctamente', async () => {
      // 1. Mock Usuario
      mocks.mockAuthGetUser.mockResolvedValue({ 
        data: { user: { id: 'user-123' } }, 
        error: null 
      })

      // 2. Mock Insert Sale Response
      // Cuando se llame a insert(...).select().single(), debe devolver la venta
      // Mockeamos la respuesta final de la cadena
      mocks.mockQueryBuilder.then.mockImplementation((resolve) => resolve({
        data: { id: 'sale-123' }, // Para insert -> select -> single
        error: null
      }))

      // 2. Ejecutar
      await salesService.processSale(mockItems as any, 200, 'cash')

      // 3. Verificaciones
      expect(mocks.mockSupabase.auth.getUser).toHaveBeenCalled()

      // Insert Venta
      expect(mocks.mockSupabase.from).toHaveBeenCalledWith('sales')
      expect(mocks.mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 'user-123',
        total_amount: 200
      }))

      // Insert Items
      expect(mocks.mockSupabase.from).toHaveBeenCalledWith('sale_items')
      expect(mocks.mockInsert).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          book_id: 'book-1', 
          quantity: 2
        })
      ]))

      // Update Stock
      expect(mocks.mockSupabase.from).toHaveBeenCalledWith('books')
      expect(mocks.mockUpdate).toHaveBeenCalledWith({ stock_quantity: 8 })
      expect(mocks.mockEq).toHaveBeenCalledWith('id', 'book-1')
    })

    it('debería fallar si el usuario no está autenticado', async () => {
      mocks.mockAuthGetUser.mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      })

      await expect(salesService.processSale(mockItems as any, 200, 'cash'))
        .rejects
        .toThrow('Usuario no autenticado')
    })
  })
})
