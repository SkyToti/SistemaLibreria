'use client'

import { LayoutDashboard, Users, LogOut, BookOpen, ShoppingCart, BarChart3, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useEffect, useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isAdmin, setIsAdmin] = useState(false)
  
  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Verificar rol en la tabla pública users
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (data?.role === 'admin') setIsAdmin(true)
      }
    }
    checkRole()
  }, [])
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      router.push('/')
      router.refresh()
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }
  
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Punto de Venta", icon: ShoppingCart, href: "/dashboard/pos" },
    { name: "Historial de Ventas", icon: BarChart3, href: "/dashboard/reports" },
    { name: "Libros", icon: BookOpen, href: "/dashboard/books" },
    { name: "Proveedores", icon: Users, href: "/dashboard/suppliers" },
  ]

  if (isAdmin) {
    menuItems.push({ name: "Gestión de Usuarios", icon: ShieldCheck, href: "/dashboard/users" })
  }

  return (
    <div className="flex h-full w-72 flex-col border-r border-zinc-800 bg-zinc-900/80 backdrop-blur-xl px-4 py-6">
      {/* Logo Section */}
      <div className="mb-10 flex h-12 items-center px-4">
         <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              Mrbeelector
            </h1>
         </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-indigo-400 shadow-sm border border-indigo-500/20" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
              )}
            >
              <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300")} />
              <span>{item.name}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
              )}
            </Link>
          )
        })}
      </nav>
      
      {/* Footer / Logout */}
      <div className="mt-auto border-t border-zinc-800 pt-6 px-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 rounded-2xl px-4 py-6 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all" 
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  )
}
