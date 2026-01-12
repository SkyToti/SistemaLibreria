import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SaleWithItems } from "@/services/sales.service"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Printer, Share2 } from "lucide-react"

interface SaleDetailsDialogProps {
  sale: SaleWithItems | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaleDetailsDialog({ sale, open, onOpenChange }: SaleDetailsDialogProps) {
  if (!sale) return null

  const subtotal = sale.sale_items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold tracking-tight">
            Ticket de Venta
          </DialogTitle>
          <div className="text-center text-xs text-zinc-500 uppercase tracking-widest mt-1">
            MrBeelector POS
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info General */}
          <div className="flex justify-between text-sm text-zinc-400 border-b border-zinc-800 pb-4">
            <div className="space-y-1">
              <p>Fecha: <span className="text-zinc-200">{format(new Date(sale.sale_date), "dd/MM/yyyy")}</span></p>
              <p>Hora: <span className="text-zinc-200">{format(new Date(sale.sale_date), "HH:mm")}</span></p>
            </div>
            <div className="space-y-1 text-right">
              <p>Folio: <span className="font-mono text-zinc-200">#{sale.id.slice(0, 8)}</span></p>
              <p>Cajero: <span className="text-zinc-200">{sale.user?.full_name?.split(' ')[0] || 'N/A'}</span></p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              <div className="col-span-6">Producto</div>
              <div className="col-span-2 text-center">Cant</div>
              <div className="col-span-4 text-right">Total</div>
            </div>
            {sale.sale_items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 text-sm items-start">
                <div className="col-span-6 pr-2">
                  <p className="font-medium text-zinc-200 line-clamp-2">{item.book?.title || 'Producto desconocido'}</p>
                  <p className="text-xs text-zinc-500 font-mono">${item.unit_price.toFixed(2)} c/u</p>
                </div>
                <div className="col-span-2 text-center text-zinc-400">
                  {item.quantity}
                </div>
                <div className="col-span-4 text-right font-mono text-zinc-300">
                  ${item.total_price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="border-t border-zinc-800 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Subtotal</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            {sale.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-emerald-400">
                <span>Descuento</span>
                <span className="font-mono">-${sale.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-2 border-t border-dashed border-zinc-800">
              <span className="text-base font-bold text-white">Total</span>
              <span className="text-xl font-bold text-white font-mono">${sale.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500 pt-1">
              <span className="uppercase">Método de Pago</span>
              <span className="uppercase font-medium text-zinc-400">
                {sale.payment_method === 'card' ? 'Tarjeta Crédito/Débito' : 
                 sale.payment_method === 'transfer' ? 'Transferencia' : 'Efectivo'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-medium transition-colors border border-zinc-800"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-sm font-medium transition-colors border border-indigo-500/20">
              <Share2 className="h-4 w-4" />
              Compartir
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
