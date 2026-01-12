'use client'

import { useRef, useEffect, useState } from 'react'
import { SalesTable } from '@/components/reports/SalesTable'
import { InventoryReportTable } from '@/components/reports/InventoryReportTable'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SaleWithItems, salesService } from '@/services/sales.service'
import { dashboardService, InventoryReportItem } from '@/services/dashboard.service'
import { toast } from 'sonner'
import { FileText, Package, Filter, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { exportToExcel } from '@/lib/excel-utils'

export default function ReportsPage() {
  const containerRef = useRef(null)
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory'>('sales')
  const [loading, setLoading] = useState(true)
  
  // Data
  const [sales, setSales] = useState<SaleWithItems[]>([])
  const [inventory, setInventory] = useState<InventoryReportItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')

  // Derived Data (Filtered)
  const filteredInventory = inventory.filter(item => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
    if (supplierFilter !== 'all' && item.supplier !== supplierFilter) return false
    return true
  })

  // Ya no filtramos ventas en cliente
  const filteredSales = sales

  // Unique options for filters
  const categories = Array.from(new Set(inventory.map(i => i.category))).sort()
  const suppliers = Array.from(new Set(inventory.map(i => i.supplier))).sort()

  const handleExportExcel = async () => {
    const dataToExport = activeTab === 'sales' ? sales : inventory
    
    if (dataToExport.length === 0) {
      toast.error('No hay datos para exportar')
      return
    }

    if (activeTab === 'sales') {
      const columns = [
        { header: 'ID Venta', key: 'id', width: 36 },
        { header: 'Fecha', key: 'date', width: 20 },
        { header: 'Cliente', key: 'customer', width: 25 },
        { header: 'Total', key: 'total', width: 15, format: '"$"#,##0.00' },
        { header: 'Método Pago', key: 'method', width: 15 }
      ]

      const rows = (dataToExport as SaleWithItems[]).map(sale => ({
        id: sale.id,
        date: new Date(sale.sale_date).toLocaleDateString(),
        customer: sale.user?.full_name || 'N/A',
        total: Number(sale.total_amount),
        method: sale.payment_method === 'card' ? 'Tarjeta' : 
                sale.payment_method === 'transfer' ? 'Transferencia' : 'Efectivo'
      }))

      await exportToExcel(rows, columns, `Ventas_${new Date().toISOString().split('T')[0]}`, 'Historial de Ventas')
    } else {
      const columns = [
        { header: 'ID Libro', key: 'id', width: 36 },
        { header: 'Título', key: 'title', width: 40 },
        { header: 'Categoría', key: 'category', width: 20 },
        { header: 'Proveedor', key: 'supplier', width: 25 },
        { header: 'Stock', key: 'stock', width: 10 },
        { header: 'Precio Venta', key: 'price', width: 15, format: '"$"#,##0.00' },
        { header: 'Valor Total', key: 'totalValue', width: 15, format: '"$"#,##0.00' },
        { header: 'Estado', key: 'status', width: 15 }
      ]

      const rows = (dataToExport as InventoryReportItem[]).map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        supplier: item.supplier,
        stock: item.stock,
        price: item.price,
        totalValue: item.totalValue,
        status: item.status === 'active' ? 'Activo' : 
                item.status === 'low_stock' ? 'Stock Bajo' : 'Agotado'
      }))

      await exportToExcel(rows, columns, `Inventario_${new Date().toISOString().split('T')[0]}`, 'Reporte de Inventario')
    }
    
    toast.success('Reporte Excel generado correctamente')
  }

  useGSAP(() => {
    gsap.from(".page-header", {
      y: -20,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out"
    })
    
    gsap.from(".filter-bar", {
      y: 10,
      opacity: 0,
      duration: 0.6,
      delay: 0.2,
      ease: "power3.out"
    })
  }, { scope: containerRef })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        let startDate, endDate
        const now = new Date()

        if (timeFilter === 'today') {
          startDate = new Date(now.setHours(0,0,0,0)).toISOString()
          endDate = new Date(now.setHours(23,59,59,999)).toISOString()
        } else if (timeFilter === 'week') {
          startDate = new Date(now.setDate(now.getDate() - 7)).toISOString()
        } else if (timeFilter === 'month') {
          startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString()
        }

        const [{ data: salesData, count: salesCount }, inventoryData] = await Promise.all([
          salesService.getSales({
            page,
            limit: 20,
            startDate,
            endDate
          }),
          dashboardService.getInventoryReport()
        ])
        setSales(salesData)
        setTotalPages(Math.ceil(salesCount / 20))
        setInventory(inventoryData)
      } catch (error) {
        toast.error('Error al cargar datos de reportes')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page, timeFilter, activeTab])

  // Reset page on filter change
  useEffect(() => {
    setPage(1)
  }, [timeFilter])

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Reportes</h2>
          <p className="text-zinc-400 mt-1">Análisis detallado de ventas e inventario.</p>
        </div>
        
        {/* Tabs Switcher */}
        <div className="flex p-1 bg-zinc-900/80 rounded-xl border border-white/10 backdrop-blur-sm self-start">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'sales' 
                ? 'bg-zinc-800 text-white shadow-lg shadow-black/20' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            Ventas
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'inventory' 
                ? 'bg-zinc-800 text-white shadow-lg shadow-black/20' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Package className="h-4 w-4" />
            Inventario
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar flex flex-wrap items-center gap-4 p-4 rounded-xl bg-zinc-900/30 border border-white/5">
        <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium mr-2">
          <Filter className="h-4 w-4" />
          Filtros:
        </div>

        {activeTab === 'inventory' ? (
          <>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] bg-zinc-950/50 border-white/10 text-zinc-300">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Categorías</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-[180px] bg-zinc-950/50 border-white/10 text-zinc-300">
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Proveedores</SelectItem>
                {suppliers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </>
        ) : (
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px] bg-zinc-950/50 border-white/10 text-zinc-300">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Histórico Completo</SelectItem>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Últimos 7 días</SelectItem>
              <SelectItem value="month">Último Mes</SelectItem>
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-white/10"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-zinc-700 border-t-zinc-400 animate-spin" />
            Cargando datos...
          </div>
        </div>
      ) : (
        <div className="min-h-[400px]">
          {activeTab === 'sales' ? (
            <>
              <SalesTable sales={filteredSales} />
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4 pb-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="bg-zinc-900/50 border-white/10 text-zinc-300 hover:bg-zinc-800"
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4 text-sm text-zinc-400">
                    Página {page} de {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="bg-zinc-900/50 border-white/10 text-zinc-300 hover:bg-zinc-800"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          ) : (
            <InventoryReportTable data={filteredInventory} />
          )}
        </div>
      )}
    </div>
  )
}
