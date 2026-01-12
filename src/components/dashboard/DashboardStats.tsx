import { Card } from "@/components/ui/card"
import { BookOpen, DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useAnimatedCounter } from "@/hooks/use-gsap-animations"
import { DashboardMetrics } from "@/services/dashboard.service"

import { LucideIcon } from "lucide-react"

interface StatItem {
  title: string
  rawValue: number
  prefix: string
  change: string
  trend: string
  icon: LucideIcon
  color: string
  iconColor: string
}

function StatCard({ stat }: { stat: StatItem }) {
  const Icon = stat.icon
  const counterRef = useAnimatedCounter(stat.rawValue, stat.prefix)

  return (
    <Card 
      className={`relative overflow-hidden border-none bg-zinc-900/40 backdrop-blur-xl p-6 transition-all hover:scale-[1.02] hover:bg-zinc-900/60 group`}
    >
      {/* Background Gradient Blob */}
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.color} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative flex flex-col justify-between h-full space-y-4">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-2xl bg-zinc-950/50 border border-white/5 ${stat.iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
          {stat.trend !== "neutral" && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {stat.change}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-zinc-400">{stat.title}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span ref={counterRef} className="text-3xl font-bold text-white tracking-tight">0</span>
            {stat.trend === "neutral" && <span className="text-xs text-zinc-500">{stat.change}</span>}
          </div>
        </div>
      </div>
    </Card>
  )
}

interface DashboardStatsProps {
  metrics: DashboardMetrics | null
}

export function DashboardStats({ metrics }: DashboardStatsProps) {
  const stats = [
    {
      title: "Ventas Totales",
      rawValue: metrics?.totalSales || 0,
      prefix: "",
      change: "Histórico",
      trend: "up", // Could calculate trend if I had previous period data
      icon: DollarSign,
      color: "from-emerald-500/20 to-teal-500/5",
      iconColor: "text-emerald-400",
    },
    {
      title: "Ingresos Totales",
      rawValue: metrics?.totalRevenue || 0,
      prefix: "$",
      change: "Histórico",
      trend: "up",
      icon: TrendingUp,
      color: "from-blue-500/20 to-indigo-500/5",
      iconColor: "text-blue-400",
    },
    {
      title: "Libros en Inventario",
      rawValue: metrics?.totalBooks || 0,
      prefix: "",
      change: "Total",
      trend: "neutral",
      icon: BookOpen,
      color: "from-violet-500/20 to-fuchsia-500/5",
      iconColor: "text-violet-400",
    },
    {
      title: "Stock Bajo",
      rawValue: metrics?.lowStockCount || 0,
      prefix: "",
      change: "Atención Requerida",
      trend: metrics?.lowStockCount ? "down" : "neutral",
      icon: AlertTriangle,
      color: "from-amber-500/20 to-orange-500/5",
      iconColor: "text-amber-400",
      alert: true,
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  )
}
