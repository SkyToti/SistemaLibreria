'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createUserAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string

  if (!email || !password || !role) {
    return { error: 'Faltan campos requeridos' }
  }

  try {
    // 1. Verificar que el usuario actual es ADMIN
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      return { error: 'No autenticado' }
    }

    const { data: currentUserData, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (roleError || currentUserData?.role !== 'admin') {
      console.error('❌ Error de permisos: Usuario no es admin o error al verificar', roleError)
      return { error: 'No tienes permisos para crear usuarios' }
    }

    console.log('✅ Permisos verificados. Intentando crear usuario en Auth...', { email, role })

    // 2. Crear usuario usando el cliente ADMIN
    const adminClient = createAdminClient()
    
    // Verificar si la llave se cargó correctamente
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ ERROR CRÍTICO: SUPABASE_SERVICE_ROLE_KEY no está definida')
      return { error: 'Error de configuración del servidor (Missing Key)' }
    }

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (createError) {
      console.error('❌ Error creando usuario en Supabase Auth:', createError)
      return { error: `Error de Auth: ${createError.message}` }
    }

    if (!newUser.user) {
      console.error('❌ Usuario creado pero objeto user es null')
      return { error: 'Error desconocido: Usuario nulo' }
    }

    console.log('✅ Usuario creado en Auth ID:', newUser.user.id)

    // 3. Asignar rol en la tabla pública 'users'
    console.log('🔄 Actualizando rol en tabla public.users...')
    
    // Esperar un momento para que el trigger de Supabase cree el usuario primero (si existe)
    await new Promise(r => setTimeout(r, 1000))

    const { error: updateError } = await adminClient
      .from('users')
      .update({ role: role, full_name: fullName })
      .eq('id', newUser.user.id)

    if (updateError) {
      // Si falla el update, intentamos INSERT por si el trigger falló
      console.warn('⚠️ Update falló, intentando INSERT manual...', updateError)
      
      const { error: insertError } = await adminClient
        .from('users')
        .insert({
          id: newUser.user.id,
          email: email,
          role: role,
          full_name: fullName
        })
        
      if (insertError) {
        console.error('❌ Error fatal asignando rol (Update e Insert fallaron):', insertError)
        return { success: true, warning: 'Usuario creado en Auth, pero falló al guardar en base de datos.' }
      }
    }

    console.log('✅ Usuario creado y configurado exitosamente')
    revalidatePath('/dashboard/users')
    return { success: true }

  } catch (error: any) {
    console.error('❌ Error NO MANEJADO en createUserAction:', error)
    return { error: error.message || 'Error interno del servidor' }
  }
}
