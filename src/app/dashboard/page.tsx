'use client'

import { useRef, useEffect, useState } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { SkeletonChart } from "@/components/ui/Skeletons"
import { dashboardService, DashboardMetrics } from "@/services/dashboard.service"
import { toast } from "sonner"

const RevenueChart = dynamic(
  () => import("@/components/dashboard/RevenueChart").then(m => m.RevenueChart),
  { ssr: false, loading: () => <SkeletonChart /> }
)
const DonutOverview = dynamic(
  () => import("@/components/dashboard/DonutOverview").then(m => m.DonutOverview),
  { ssr: false, loading: () => <SkeletonChart /> }
)
import { RecentSales } from "@/components/dashboard/RecentSales"
import { TopSellingBooks } from "@/components/dashboard/TopSellingBooks"

export default function DashboardPage() {
  const containerRef = useRef(null)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useGSAP(() => {
    if (!loading) {
      gsap.from(".dashboard-item", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all"
      })
    }
  }, { scope: containerRef, dependencies: [loading] })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await dashboardService.getMetrics()
        setMetrics(data)
        
        // Alerta de stock bajo
        if (data.lowStockCount > 0) {
          toast.warning(`Atención: Tienes ${data.lowStockCount} productos con stock bajo.`, {
            description: "Revisa el inventario para reabastecer.",
            duration: 6000,
            action: {
              label: "Ver Inventario",
              onClick: () => window.location.href = '/dashboard/reports' // Simple navigation
            }
          })
        }
      } catch (error) {
        toast.error('Error al cargar métricas del dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  if (loading) {
    return <div className="text-zinc-500 p-8">Cargando dashboard...</div>
  }

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Header con saludo */}
      <div className="dashboard-item flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
          <p className="text-zinc-400 mt-1">Resumen general de tu librería hoy.</p>
        </div>
      </div>
      
      {/* Sección Superior: Métricas Clave */}
      <div className="dashboard-item">
        <DashboardStats metrics={metrics} />
      </div>

      {/* Sección Principal: Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Gráficas Principales (Ancho 8/12) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Gráfico de Ingresos */}
          <Card className="dashboard-item flat-card border-none bg-zinc-900/50 backdrop-blur-xl p-1 overflow-hidden">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-xl text-white">Evolución de Ingresos</CardTitle>
              <CardDescription className="text-zinc-400">Comparativa diaria de ventas netas.</CardDescription>
            </CardHeader>
            <CardContent className="pl-0 pr-2 pb-2 h-[350px]">
              <RevenueChart data={metrics?.revenueByDay} />
            </CardContent>
          </Card>

          {/* Ranking de Libros y Ventas Recientes en fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dashboard-item h-full">
              <TopSellingBooks data={metrics?.topProducts || []} />
            </div>
            <div className="dashboard-item h-full">
              <RecentSales 
                data={metrics?.recentSales.map(sale => ({
                  ...sale,
                  user: sale.user || undefined
                })) || []} 
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Categorías y Avisos (Ancho 4/12) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Donut Chart - Ventas por Categoría (Mocked por ahora hasta tener más datos reales) */}
          <Card className="dashboard-item flat-card border-none bg-zinc-900/50 backdrop-blur-xl h-full min-h-[400px]">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-xl text-white">Categorías Top</CardTitle>
              <CardDescription className="text-zinc-400">Distribución de ventas.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 h-[350px]">
              <DonutOverview />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
