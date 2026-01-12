### Plan de Acción: Implementación de Roles y Gestión de Usuarios

1.  **Fase 1: Promoción a Admin (Inmediato)**
    *   Crear y ejecutar un script SQL (`migrations/20251220_promote_admin.sql`) para actualizar tu usuario actual (`skytotifama123@gmail.com`) a rol `admin`.
    *   Esto desbloqueará inmediatamente los permisos RLS para que puedas operar sin restricciones mientras desarrollamos lo demás.

2.  **Fase 2: Interfaz de Gestión de Usuarios**
    *   Crear nueva página `src/app/dashboard/users/page.tsx`.
    *   Implementar `UsersList` para ver todos los empleados.
    *   Implementar `CreateUserForm` que use la API de administración de Supabase (o una función RPC segura) para crear nuevos usuarios con rol específico.
    *   Asegurar que esta página esté protegida y solo sea visible para admins.

3.  **Fase 3: Ajuste de Permisos RPC**
    *   Revisar la función `process_sale_transaction` para asegurar que funcione correctamente tanto para admins como para empleados (cuando los crees), manteniendo la seguridad `SECURITY DEFINER` pero validando roles.

Empezaremos con la Fase 1 para que puedas probar las ventas exitosamente ya mismo.