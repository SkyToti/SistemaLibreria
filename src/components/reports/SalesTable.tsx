'use client'

import { SaleWithItems } from '@/services/sales.service'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ShoppingBag, CreditCard, Banknote, Calendar, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { useState } from 'react'
import { useStaggeredEntrance } from '@/hooks/use-gsap-animations'
import { useRef } from 'react'
import { SaleDetailsDialog } from './SaleDetailsDialog'

interface SalesTableProps {
  sales: SaleWithItems[]
}

export function SalesTable({ sales }: SalesTableProps) {
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null)
  const [selectedSale, setSelectedSale] = useState<SaleWithItems | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useStaggeredEntrance(containerRef, ".sale-row")

  const toggleExpand = (id: string) => {
    setExpandedSaleId(expandedSaleId === id ? null : id)
  }

  const handleOpenDetails = (e: React.MouseEvent, sale: SaleWithItems) => {
    e.stopPropagation()
    setSelectedSale(sale)
    setDetailsOpen(true)
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p>No hay ventas registradas aún.</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="space-y-3">
      {sales.map((sale) => (
        <Card 
          key={sale.id}
          className="sale-row border-none bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors overflow-hidden"
        >
          <div 
            className="p-4 flex items-center justify-between cursor-pointer"
            onClick={() => toggleExpand(sale.id)}
          >
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                sale.payment_method === 'card' 
                  ? 'bg-indigo-500/10 text-indigo-400' 
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {sale.payment_method === 'card' ? <CreditCard className="h-5 w-5" /> : <Banknote className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm font-medium text-white">Venta #{sale.id.slice(0, 8)}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(sale.sale_date), "d 'de' MMMM, yyyy - HH:mm", { locale: es })}</span>
                  <span>•</span>
                  <span>{sale.user?.full_name || sale.user?.email || 'Usuario desconocido'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-bold text-white">${sale.total_amount.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">{sale.sale_items.length} productos</p>
              </div>

              <button 
                onClick={(e) => handleOpenDetails(e, sale)}
                className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Ver Recibo"
              >
                <Eye className="h-4 w-4" />
              </button>

              <div className="text-zinc-500">
                {expandedSaleId === sale.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
          </div>

          {/* Detalles Expandibles */}
          {expandedSaleId === sale.id && (
            <div className="bg-zinc-950/30 border-t border-white/5 p-4 animate-in slide-in-from-top-2 duration-200">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Detalle de Productos</h4>
              <div className="space-y-2">
                {sale.sale_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex gap-3">
                      <span className="text-zinc-500 w-6 text-center">{item.quantity}x</span>
                      <span className="text-zinc-300">{item.book?.title || 'Producto eliminado'}</span>
                    </div>
                    <span className="text-zinc-400 font-mono">${item.total_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
      
      <SaleDetailsDialog 
        sale={selectedSale} 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen} 
      />
    </div>
  )
}
