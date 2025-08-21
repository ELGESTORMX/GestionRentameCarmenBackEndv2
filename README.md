# Archivo actualizado para forzar un despliegue en Railway

Servidor Express mínimo para desarrollo local.

# Endpoints REST principales

## Autenticación
- POST /api/auth/login
- POST /api/auth/refresh

## Usuarios
- GET /api/users
- GET /api/users/:id
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

## Clientes
- GET /api/clients
- GET /api/clients/:id
- POST /api/clients
- PUT /api/clients/:id
- DELETE /api/clients/:id

## Equipos
- GET /api/equipos
- GET /api/equipos/:id
- POST /api/equipos
- PUT /api/equipos/:id
- DELETE /api/equipos/:id

## Rentas
- GET /api/rentas
- GET /api/rentas/:id
- POST /api/rentas
- PUT /api/rentas/:id
- DELETE /api/rentas/:id

## Notas de Remisión
- GET /api/notasRemision
- GET /api/notasRemision/:id
- POST /api/notasRemision
- PUT /api/notasRemision/:id
- DELETE /api/notasRemision/:id

## Categorías
- GET /api/categorias
- GET /api/categorias/:id
- POST /api/categorias
- PUT /api/categorias/:id
- DELETE /api/categorias/:id

Endpoints:
- POST /api/admins/login { usuario, contraseña } -> { response: { token, usuario, rol } }
- GET /api/protected (Authorization: Bearer <token>) -> protected data

Instalación:

npm install

Arrancar:

npm run dev
