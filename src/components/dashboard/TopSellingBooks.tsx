'use client'

import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import { useStaggeredEntrance } from '@/hooks/use-gsap-animations'

interface TopSellingBooksProps {
  data?: { title: string; sales: number; revenue: number }[]
}

export function TopSellingBooks({ data = [] }: TopSellingBooksProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Animamos la lista
  useStaggeredEntrance(containerRef as React.RefObject<HTMLElement>, ".book-item")

  return (
    <Card className="flat-card h-full border-none bg-zinc-900/50 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <CardTitle className="text-xl text-white">Ranking de Libros</CardTitle>
        <div 
          className="flex space-x-1 rounded-full bg-zinc-950/50 p-1 border border-white/5"
        >
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium bg-zinc-800 text-white shadow-sm ring-1 ring-white/10"
          >
            <Trophy className="h-3.5 w-3.5" />
            Más Vendidos
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="space-y-2">
          {data.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-4">No hay datos de ventas aún.</p>
          ) : (
            data.map((book, index) => (
              <div 
                key={index}
                className="book-item flex items-center justify-between group p-3 rounded-2xl hover:bg-zinc-800/40 transition-colors duration-200 border border-transparent hover:border-white/5 cursor-default"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm transition-colors duration-300
                    ${index === 0 ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' : 
                      index === 1 ? 'bg-zinc-700/30 text-zinc-300' : 
                      index === 2 ? 'bg-orange-900/20 text-orange-400' : 'bg-zinc-800/30 text-zinc-500'}
                  `}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{book.title}</p>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">Ventas totales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white tabular-nums">{book.sales} <span className="text-xs font-normal text-zinc-500">un.</span></p>
                  <p className="text-xs text-zinc-500 tabular-nums">${book.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
