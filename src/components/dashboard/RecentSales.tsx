'use client'

import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, ShoppingBag, CreditCard, Banknote, Landmark } from 'lucide-react'
import { useStaggeredEntrance } from '@/hooks/use-gsap-animations'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface RecentSalesProps {
  data?: { 
    id: string
    total_amount: number
    sale_date: string
    payment_method: string
    user?: { full_name: string, email: string }
    sale_items?: { id: string }[]
  }[]
}

export function RecentSales({ data = [] }: RecentSalesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Animación de entrada para la lista
  useStaggeredEntrance(containerRef as React.RefObject<HTMLElement>, ".sale-item")

  const getMethodIcon = (method: string) => {
    switch(method) {
      case 'card': return CreditCard
      case 'transfer': return Landmark
      default: return Banknote
    }
  }

  const getMethodLabel = (method: string) => {
    switch(method) {
      case 'card': return 'Tarjeta'
      case 'transfer': return 'Transf.'
      default: return 'Efectivo'
    }
  }

  return (
    <Card className="flat-card h-full border-none bg-zinc-900/50 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <CardTitle className="text-xl text-white">Ventas Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="space-y-2">
          {data.length === 0 ? (
             <p className="text-zinc-500 text-sm text-center py-4">No hay ventas recientes.</p>
          ) : (
            data.map((tx) => {
              const Icon = getMethodIcon(tx.payment_method)
              const date = new Date(tx.sale_date)
              const formattedTime = format(date, 'h:mm a', { locale: es })
              const itemsCount = tx.sale_items?.length || 0

              return (
                <div 
                  key={tx.id} 
                  className="sale-item flex items-center justify-between group p-3 rounded-2xl hover:bg-zinc-800/40 transition-colors duration-200 border border-transparent hover:border-white/5 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 transition-colors duration-300
                      ${tx.payment_method === 'card' ? 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20'}
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                        {tx.user?.full_name || 'Cliente General'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-500">{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
                        <span className="text-[10px] text-zinc-600">•</span>
                        <span className="text-xs text-zinc-500 capitalize">{formattedTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white tabular-nums">${Number(tx.total_amount).toFixed(2)}</p>
                      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                        {getMethodLabel(tx.payment_method)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
