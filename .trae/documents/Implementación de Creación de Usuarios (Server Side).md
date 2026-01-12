### Solución: Corrección de RLS para Visibilidad del Menú Admin

El problema es que la política RLS actual crea un bloqueo circular: necesitas ser admin para leer datos, pero necesitas leer datos para saber si eres admin.

Vamos a aplicar una política RLS que garantice el acceso al propio perfil **siempre**, rompiendo el ciclo.

#### Pasos:
1.  **Crear Script SQL Corregido (`migrations/20251220_fix_users_rls_final.sql`):**
    *   Eliminar políticas anteriores conflictivas.
    *   Crear política **"Users can read own data"**: Permite `SELECT` donde `auth.uid() = id`.
    *   Crear política **"Admins can read all data"**: Permite `SELECT` si el usuario que consulta tiene rol `admin` (usando una función de seguridad o subquery optimizada que evite recursión infinita).

2.  **Instrucción de Ejecución:**
    *   Tendrás que ejecutar este script en el SQL Editor de Supabase.

3.  **Verificación:**
    *   Al recargar la página, el Sidebar podrá leer tu rol correctamente y mostrará la opción "Gestión de Usuarios".

¿Procedemos con el script?