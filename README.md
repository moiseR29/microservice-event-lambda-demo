# Sistema de Microservicios de Comunicaciones con EventBridge

Arquitectura de microservicios basada en eventos usando AWS EventBridge, Lambda y Node.js 18. El sistema está diseñado para escalar verticalmente y manejar comunicaciones (email, SMS, push notifications) de forma asíncrona.

## 🏗️ Arquitectura

```
Microservicio de Comunicaciones (Node 18)
         │
         ▼
    EventBridge Bus
         │
    ┌────┴────┬──────────┐
    ▼         ▼          ▼
Email Lambda SMS Lambda Push Lambda
```

## 📋 Componentes

### 1. Microservicio de Comunicaciones
- **Tecnología**: Node.js 18 + Express
- **Función**: Recibe solicitudes HTTP y publica eventos a EventBridge
- **Endpoints**:
  - `POST /api/communications/email` - Enviar email
  - `POST /api/communications/sms` - Enviar SMS
  - `POST /api/communications/push` - Enviar push notification
  - `GET /health` - Health check
  - `GET /api/communications/stats` - Estadísticas del servicio

### 2. EventBridge
- **Función**: Bus de eventos centralizado
- **Reglas**: Enrutamiento de eventos basado en `detail-type`
- **Eventos soportados**:
  - `EmailNotification`
  - `SMSNotification`
  - `PushNotification`

### 3. Funciones Lambda
- **Email Processor**: Procesa eventos de email
- **SMS Processor**: Procesa eventos de SMS
- **Push Processor**: Procesa eventos de push notifications
- **Configuración de escalado vertical**:
  - Memoria: 2048 MB (más memoria = más CPU asignada)
  - Timeout: 60 segundos
  - Concurrencia reservada: 50 ejecuciones simultáneas
  - Dead Letter Queue (DLQ): Manejo de eventos fallidos

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+
- AWS SAM CLI
- AWS CLI configurado
- Credenciales de AWS configuradas
- Docker (opcional, para desarrollo local)

### Instalación local

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd microservices-events-demo-2
```

2. Instalar dependencias del microservicio:
```bash
cd microservice
npm install
```

3. Instalar dependencias de las Lambdas:
```bash
cd ../lambdas/email-processor && npm install
cd ../sms-processor && npm install
cd ../push-processor && npm install
```

4. Configurar variables de entorno:
```bash
cd ../../microservice
cp env.example .env
# Editar .env con tus credenciales de AWS
```

### Desarrollo con Docker

```bash
# Construir y ejecutar el microservicio
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## 🏃 Ejecución

### Microservicio Local

```bash
cd microservice
npm start
```

El microservicio estará disponible en `http://localhost:3000`

### Despliegue en AWS

1. Construir la aplicación:
```bash
sam build
```

2. Desplegar (primera vez):
```bash
sam deploy --guided
```

3. Desplegar (siguientes veces):
```bash
sam deploy
```

## 📡 Uso de la API

### Enviar Email
```bash
curl -X POST http://localhost:3000/api/communications/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "usuario@example.com",
    "subject": "Test Email",
    "body": "Este es un email de prueba",
    "from": "noreply@example.com"
  }'
```

### Enviar SMS
```bash
curl -X POST http://localhost:3000/api/communications/sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Este es un SMS de prueba"
  }'
```

### Enviar Push Notification
```bash
curl -X POST http://localhost:3000/api/communications/push \
  -H "Content-Type: application/json" \
  -d '{
    "deviceToken": "device-token-123",
    "title": "Notificación",
    "body": "Este es un push de prueba",
    "data": {
      "key": "value"
    }
  }'
```

### Health Check
```bash
curl http://localhost:3000/health
```

## 🔧 Configuración de Escalado Vertical

El sistema está configurado para escalar verticalmente mediante:

1. **Memoria de Lambda**: 2048 MB (más memoria = más CPU asignada por AWS)
2. **Concurrencia Reservada**: 50 ejecuciones simultáneas por función
3. **Timeout**: 60 segundos (suficiente para procesar eventos complejos)
4. **Dead Letter Queue**: Maneja eventos que fallan después de los reintentos

### Ajustar Escalado

Edita `template.yaml` y modifica los valores de:
- `MemorySize`: Aumenta para más CPU (128 MB - 10240 MB)
  - Más memoria = más CPU proporcionalmente
  - AWS asigna CPU linealmente: 1792 MB = 1 vCPU completo
- `ReservedConcurrentExecutions`: Limita ejecuciones simultáneas (control de costos)
- `Timeout`: Tiempo máximo de ejecución (ajustar según carga de trabajo)

### Ventajas del Escalado Vertical

- **Mayor rendimiento por ejecución**: Más CPU permite procesar eventos más rápido
- **Mejor uso de recursos**: Menos overhead de gestión de múltiples instancias
- **Predictibilidad**: Comportamiento más predecible con recursos dedicados
- **Costo eficiente**: Para cargas de trabajo con alto uso de CPU, es más eficiente

## 🧪 Testing

### Probar el microservicio localmente
```bash
cd microservice
npm start
# En otra terminal
curl http://localhost:3000/health
```

### Probar las Lambdas localmente
```bash
sam local start-api
# O para una función específica
sam local invoke EmailProcessorFunction -e events/email-event.json
```

## 📁 Estructura del Proyecto

```
microservices-events-demo-2/
├── microservice/           # Microservicio Node.js 18
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── lambdas/                # Funciones Lambda
│   ├── email-processor/
│   ├── sms-processor/
│   └── push-processor/
├── template.yaml           # SAM template
├── samconfig.toml          # Configuración SAM
└── README.md
```

## 🔒 Seguridad

- Las Lambdas tienen permisos mínimos necesarios (IAM roles)
- EventBridge usa reglas específicas para enrutamiento
- El microservicio requiere credenciales AWS para publicar eventos

## 📊 Monitoreo

- CloudWatch Logs: Logs de todas las Lambdas
- EventBridge Metrics: Métricas de eventos procesados
- Lambda Metrics: Invocaciones, errores, duración

## 📝 Licencia

ISC

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

