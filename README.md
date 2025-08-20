Servidor Express mínimo para desarrollo local.

Endpoints:
- POST /api/admins/login { usuario, contraseña } -> { response: { token, usuario, rol } }
- GET /api/protected (Authorization: Bearer <token>) -> protected data

Instalación:

npm install

Arrancar:

npm run dev
