# SETTA

Proyecto SETTA con backend Express + Supabase.

## Qué hay en el proyecto

- `server.js`: backend con endpoints para registro, login, canciones y sets.
- `js/api.js`: funciones para consumir el backend desde el frontend.
- `js/explorar.js`, `js/sets.js`, `js/dashboard.js`: lógica de la app.
- `crear_tablas.sql`: script para crear tablas y políticas en Supabase.
- `.env`: configuración local con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.

## Cómo configurar Supabase

1. En Supabase, abre tu proyecto.
2. Copia `Project URL` sin `/rest/v1/`.
3. Copia la `service_role key` desde `API keys`.
4. Pega esos valores en `.env`.
5. En Supabase SQL editor, pega y ejecuta `crear_tablas.sql`.
   - Si te pide RLS, selecciona `Run and enable RLS`.

## Cómo iniciar el backend

Desde PowerShell en la carpeta del proyecto:

```powershell
cd "c:\Users\Janus\OneDrive\Desktop\Proyecti Final - Setta Definitivo"
npm.cmd install
npm.cmd start
```

Si quieres usar `npm install` directamente, primero ejecuta:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Cómo probar

Abre el navegador y prueba:

- `http://localhost:4000/api/health`
- `http://localhost:4000/api/songs`

Luego abre `index.html` en tu navegador y regístrate / entra.

## Estado actual

- El backend básico está funcionando.
- Las páginas `login.html` y `register.html` ya llaman al backend.
- `app.html` ahora carga canciones y guarda sets usando el backend cuando es posible.
- `crear_tablas.sql` contiene las tablas y políticas RLS para Supabase.
