-- PROMOVER A ADMIN
-- Ejecuta este script para convertir tu usuario actual en Administrador.
-- Esto te dará acceso total al sistema (incluyendo editar libros y ver gestión de usuarios).

UPDATE public.users
SET role = 'admin'
WHERE email = 'skytotifama123@gmail.com';

-- Verificar el cambio
SELECT * FROM public.users WHERE email = 'skytotifama123@gmail.com';
