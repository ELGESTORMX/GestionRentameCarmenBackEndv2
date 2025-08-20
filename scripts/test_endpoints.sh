#!/usr/bin/env bash
# Script de prueba rápida para endpoints principales
# Ajusta BASE_URL, USERNAME y PASSWORD antes de ejecutar.

BASE_URL=${BASE_URL:-http://localhost:8085}
USERNAME=${USERNAME:-admin}
PASSWORD=${PASSWORD:-admin}

echo "Usando BASE_URL=$BASE_URL"

# 1) Login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d '{"username":"'$USERNAME'","password":"'$PASSWORD'"}')
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.response.token')
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "Login falló o no devolvió token. Respuesta completa:" >&2
  echo "$LOGIN_RESPONSE" >&2
  exit 1
fi

echo "Token obtenido: $TOKEN"

# 2) /api/auth/me
curl -s -X GET "$BASE_URL/api/auth/me" -H "Authorization: Bearer $TOKEN" | jq

# 3) Listar equipos
curl -s -X GET "$BASE_URL/api/equipos" -H "Authorization: Bearer $TOKEN" | jq
