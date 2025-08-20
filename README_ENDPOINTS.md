# Pruebas rápidas de API - GestionRentameCarmen Backend v2

Instrucciones rápidas para probar los endpoints principales (local o en producción).

Variables útiles:
- BASE_URL: URL base de la API (por defecto http://localhost:8085)
- USERNAME / PASSWORD: credenciales para login (usar un administrador existente o user)

Ejemplos curl

1) Login (obtén token JWT)

curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"TU_USUARIO","password":"TU_PASSWORD"}'

Respuesta esperada (ejemplo):
{
  "response": {
    "token": "<JWT>",
    "username": "admin",
    "rol": "admin",
    "refresh": "<REFRESH_TOKEN>"
  }
}

2) Obtener info del usuario autenticado (/api/auth/me)

curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer <TU_TOKEN>"

Respuesta esperada (ejemplo):
{
  "usuario": "admin",
  "_id": "64...",
  "rol": 1
}

3) Listar equipos (requiere token)

curl -s -X GET "$BASE_URL/api/equipos" \
  -H "Authorization: Bearer <TU_TOKEN>"

4) Endpoint legacy (ejemplo)

curl -s -X GET "$BASE_URL/v1/clients"

Script de prueba automático disponible en `scripts/test_endpoints.sh`.

Notas:
- Reemplaza `BASE_URL` y las credenciales según corresponda.
- Si obtienes errores relacionados con token, verifica que el login haya devuelto `token` y que lo pases con el prefijo `Bearer `.
- Si usas Railway, asegúrate de configurar la variable de entorno LINK_DB y SECRET_KEY en el panel de Railway.

Si quieres, genero un README más detallado o un script en Node.js para integrarlo en npm run test.
