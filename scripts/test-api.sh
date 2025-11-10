#!/bin/bash

# Script para probar la API del microservicio
# Uso: ./scripts/test-api.sh [base-url]

BASE_URL=${1:-http://localhost:3000}

echo "🧪 Probando API en: ${BASE_URL}"

# Health check
echo ""
echo "1. Health Check:"
curl -s "${BASE_URL}/health" | jq '.'

# Stats
echo ""
echo "2. Estadísticas:"
curl -s "${BASE_URL}/api/communications/stats" | jq '.'

# Enviar Email
echo ""
echo "3. Enviar Email:"
curl -s -X POST "${BASE_URL}/api/communications/email" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "Este es un email de prueba"
  }' | jq '.'

# Enviar SMS
echo ""
echo "4. Enviar SMS:"
curl -s -X POST "${BASE_URL}/api/communications/sms" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Este es un SMS de prueba"
  }' | jq '.'

# Enviar Push Notification
echo ""
echo "5. Enviar Push Notification:"
curl -s -X POST "${BASE_URL}/api/communications/push" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceToken": "device-token-123",
    "title": "Notificación",
    "body": "Este es un push de prueba"
  }' | jq '.'

echo ""
echo "✅ Tests completados!"

