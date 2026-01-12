import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecentSales } from '../RecentSales'

describe('RecentSales', () => {
  it('renders sales list correctly', () => {
    render(<RecentSales />)
    const title = screen.getByText(/Ventas Recientes/i)
    expect(title).toBeInTheDocument()
    
    // Check for list items
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBeGreaterThan(0)
  })

  it('filters by card when clicked', () => {
    render(<RecentSales />)
    const cardFilter = screen.getByRole('button', { name: /Tarjeta/i })
    
    fireEvent.click(cardFilter)
    expect(cardFilter).toHaveAttribute('aria-pressed', 'true')
  })
})

