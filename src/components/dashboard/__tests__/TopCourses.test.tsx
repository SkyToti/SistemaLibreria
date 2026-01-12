import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TopSellingBooks } from '../TopSellingBooks'

describe('TopSellingBooks', () => {
  it('renders tab buttons and switches content', () => {
    render(<TopSellingBooks />)
    const topBtn = screen.getByRole('tab', { name: /Más Vendidos/i })
    const trendingBtn = screen.getByRole('tab', { name: /Tendencia/i })
    expect(topBtn).toBeInTheDocument()
    expect(trendingBtn).toBeInTheDocument()

    // Default is "Top" (Más Vendidos)
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'panel-top')

    fireEvent.click(trendingBtn)
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'panel-trending')
  })
})

