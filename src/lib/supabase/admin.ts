import { createClient } from '@supabase/supabase-js'

// Nota: Este cliente SOLO debe usarse en el servidor (Server Actions o API Routes)
// NUNCA importar esto en componentes de cliente ('use client')
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
