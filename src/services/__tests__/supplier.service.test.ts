import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supplierService } from '../supplier.service'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => {
  const rows: any[] = []
  return {
    createClient: () => ({
      from: (table: string) => {
        if (table !== 'suppliers') throw new Error('Unexpected table')
        return {
          select: () => ({ select: () => ({ single: () => ({ data: rows[0], error: null }) }) }),
          order: () => ({ data: rows, error: null }),
          insert: (payload: any[]) => {
            rows.unshift({ id: '1', ...payload[0] })
            return { select: () => ({ single: () => ({ data: rows[0], error: null }) }) }
          },
          update: (payload: any) => ({
            eq: () => ({ select: () => ({ single: () => ({ data: { id: '1', ...payload }, error: null }) }) }),
          }),
          delete: () => ({ eq: () => ({ error: null }) }),
          eq: () => ({ single: () => ({ data: rows[0], error: null }) }),
        }
      },
    }),
  }
})

describe('supplierService', () => {
  beforeEach(() => {
    // reset mock state if needed
  })

  it('create inserts a supplier and returns it', async () => {
    const data = await supplierService.create({
      name: 'Editorial Test',
      contact_person: 'Juan',
      phone: '555-000',
      email: 'test@example.com',
      address: 'Calle 1',
      status: 'active',
    })
    expect(data.name).toBe('Editorial Test')
  })

  it('getAll returns list of suppliers', async () => {
    const list = await supplierService.getAll()
    expect(Array.isArray(list)).toBe(true)
  })

  it('update modifies fields and returns the updated row', async () => {
    const updated = await supplierService.update('1', { phone: '555-123' })
    expect(updated.phone).toBe('555-123')
  })
})

