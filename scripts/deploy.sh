#!/bin/bash

# Script de deployment para el sistema de microservicios
# Uso: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-dev}
STACK_NAME="communications-microservices-stack-${ENVIRONMENT}"

echo "🚀 Iniciando deployment para ambiente: ${ENVIRONMENT}"
echo "📦 Stack name: ${STACK_NAME}"

# Verificar que AWS CLI está configurado
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI no está instalado. Por favor, instálalo primero."
    exit 1
fi

# Verificar que SAM CLI está instalado
if ! command -v sam &> /dev/null; then
    echo "❌ AWS SAM CLI no está instalado. Por favor, instálalo primero."
    exit 1
fi

# Construir la aplicación
echo "🔨 Construyendo la aplicación..."
sam build

# Desplegar
echo "📤 Desplegando a AWS..."
if [ "$ENVIRONMENT" == "prod" ]; then
    sam deploy \
        --stack-name "${STACK_NAME}" \
        --capabilities CAPABILITY_IAM \
        --confirm-changeset \
        --region us-east-1
else
    sam deploy \
        --stack-name "${STACK_NAME}" \
        --capabilities CAPABILITY_IAM \
        --confirm-changeset \
        --region us-east-1 \
        --parameter-overrides Environment=${ENVIRONMENT}
fi

echo "✅ Deployment completado!"
echo "📊 Para ver los outputs del stack:"
echo "   aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query 'Stacks[0].Outputs'"

