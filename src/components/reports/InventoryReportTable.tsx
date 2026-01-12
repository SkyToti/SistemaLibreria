'use client'

import { useRef, useState } from 'react'
import { InventoryReportItem } from '@/services/dashboard.service'
import { Card } from '@/components/ui/card'
import { useStaggeredEntrance } from '@/hooks/use-gsap-animations'
import { Badge } from 'lucide-react'

interface InventoryReportTableProps {
  data: InventoryReportItem[]
}

export function InventoryReportTable({ data }: InventoryReportTableProps) {
  const containerRef = useRef<HTMLTableSectionElement>(null)
  
  // Use a simple ref for stagger instead of the hook if re-renders are frequent, 
  // but hook is fine for initial load.
  useStaggeredEntrance(containerRef as React.RefObject<HTMLElement>, ".inv-row")

  // Calcular totales para el footer de la tabla
  const totalStock = data.reduce((acc, item) => acc + item.stock, 0)
  const totalValue = data.reduce((acc, item) => acc + item.totalValue, 0)

  return (
    <div className="rounded-xl border border-white/5 bg-zinc-900/50 backdrop-blur-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-950/50 text-zinc-400 font-medium border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Libro</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Proveedor</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Stock</th>
              <th className="px-6 py-4 text-right">Precio Venta</th>
              <th className="px-6 py-4 text-right">Valor Total</th>
            </tr>
          </thead>
          <tbody ref={containerRef} className="divide-y divide-white/5">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                  No hay datos de inventario disponibles.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="inv-row group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-200">
                    {item.title}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    <span className="px-2 py-1 rounded-full bg-zinc-800/50 text-xs border border-white/5">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {item.supplier}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium border
                      ${item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        item.status === 'low_stock' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'}
                    `}>
                      {item.status === 'active' ? 'Activo' : 
                       item.status === 'low_stock' ? 'Stock Bajo' : 'Agotado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-zinc-300">
                    {item.stock}
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-400">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-400/90">
                    ${item.totalValue.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-zinc-950/30 font-medium text-zinc-300 border-t border-white/5">
            <tr>
              <td colSpan={4} className="px-6 py-4 text-right text-zinc-400">Totales:</td>
              <td className="px-6 py-4 text-right text-white">{totalStock}</td>
              <td className="px-6 py-4"></td>
              <td className="px-6 py-4 text-right text-emerald-400">${totalValue.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
