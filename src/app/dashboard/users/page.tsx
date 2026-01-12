'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { UserPlus, Shield, User, Mail, Loader2 } from 'lucide-react'

import { createUserAction } from './actions'

interface UserData {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const supabase = createClient()

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await createUserAction(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Usuario creado exitosamente')
        // Limpiar formulario
        e.currentTarget.reset()
        fetchUsers() // Recargar lista
      }
    } catch (error) {
      toast.error('Error inesperado al crear usuario')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Gestión de Usuarios</h2>
          <p className="text-zinc-400 mt-1">Administra el acceso y roles de tus empleados.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Formulario de Creación */}
        <div className="md:col-span-4">
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-400" />
                Nuevo Usuario
              </CardTitle>
              <CardDescription>Crea una cuenta para un nuevo empleado.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      name="fullName"
                      placeholder="Juan Pérez"
                      className="pl-9 bg-zinc-950/50 border-zinc-800"
                      required
                      data-testid="input-fullname"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="empleado@empresa.com"
                      className="pl-9 bg-zinc-950/50 border-zinc-800"
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Contraseña</label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="bg-zinc-950/50 border-zinc-800"
                    required
                    minLength={6}
                    data-testid="input-password"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Rol</label>
                  <Select name="role" defaultValue="employee">
                    <SelectTrigger className="bg-zinc-950/50 border-zinc-800" data-testid="select-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Empleado (Vendedor)</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={creating} data-testid="submit-user-btn">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  Crear Usuario
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Usuarios */}
        <div className="md:col-span-8">
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-xl h-full">
            <CardHeader>
              <CardTitle className="text-white">Usuarios del Sistema</CardTitle>
              <CardDescription>Lista de todos los usuarios registrados y sus roles.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-10 text-zinc-500">Cargando usuarios...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-10 text-zinc-500">No hay usuarios registrados.</div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/30 border border-zinc-800 hover:border-zinc-700 transition-all" data-testid={`user-row-${user.email}`}>
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {user.role === 'admin' ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{user.full_name || 'Sin Nombre'}</h4>
                          <p className="text-sm text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user.role === 'admin'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}>
                          {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                        </span>
                        <span className="text-xs text-zinc-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
