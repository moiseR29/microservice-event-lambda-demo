# Arquitectura del Sistema de Comunicaciones

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Cliente / Aplicación                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          Microservicio de Comunicaciones (Node 18)          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express Server (Puerto 3000)                        │   │
│  │  - POST /api/communications/email                    │   │
│  │  - POST /api/communications/sms                      │   │
│  │  - POST /api/communications/push                     │   │
│  │  - GET  /health                                      │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│                     │ PutEvents (AWS SDK)                    │
│                     ▼                                        │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Eventos
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              EventBridge Custom Bus                          │
│              (communications-event-bus)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Reglas de Enrutamiento:                             │   │
│  │  - EmailEventRule → EmailProcessorFunction           │   │
│  │  - SMSEventRule → SMSProcessorFunction               │   │
│  │  - PushEventRule → PushProcessorFunction             │   │
│  │                                                       │   │
│  │  Retry Policy:                                       │   │
│  │  - MaximumRetryAttempts: 3                           │   │
│  │  - MaximumEventAgeInSeconds: 3600                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Lambda     │ │   Lambda     │ │   Lambda     │
│   Email      │ │   SMS        │ │   Push       │
│   Processor  │ │   Processor  │ │   Processor  │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ Memoria:     │ │ Memoria:     │ │ Memoria:     │
│ 2048 MB      │ │ 2048 MB      │ │ 2048 MB      │
│              │ │              │ │              │
│ Timeout:     │ │ Timeout:     │ │ Timeout:     │
│ 60 seg       │ │ 60 seg       │ │ 60 seg       │
│              │ │              │ │              │
│ Concurrencia:│ │ Concurrencia:│ │ Concurrencia:│
│ 50 simult.   │ │ 50 simult.   │ │ 50 simult.   │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       │                │                │
       └────────────────┼────────────────┘
                        │
                        │ Eventos fallidos
                        ▼
              ┌─────────────────────┐
              │  Dead Letter Queue  │
              │  (SQS)              │
              │  - Retención: 14d   │
              └─────────────────────┘
```

## Flujo de Datos

### 1. Recepción de Solicitud
- Cliente envía solicitud HTTP al microservicio
- Microservicio valida la solicitud
- Microservicio crea evento con formato EventBridge

### 2. Publicación de Evento
- Microservicio publica evento a EventBridge usando `PutEvents`
- EventBridge valida y acepta el evento
- EventBridge enruta el evento según las reglas configuradas

### 3. Procesamiento
- EventBridge invoca la función Lambda correspondiente
- Lambda procesa el evento (mock en este caso)
- Lambda retorna resultado exitoso o error

### 4. Manejo de Errores
- Si Lambda falla, EventBridge reintenta (hasta 3 veces)
- Si todos los reintentos fallan, evento va a DLQ
- Eventos en DLQ pueden ser procesados manualmente o con otra Lambda

## Componentes Principales

### Microservicio de Comunicaciones
- **Tecnología**: Node.js 18 + Express
- **Responsabilidad**: Recepción de solicitudes y publicación de eventos
- **Escalabilidad**: Horizontal (múltiples instancias)

### EventBridge
- **Tipo**: Custom Event Bus
- **Responsabilidad**: Enrutamiento y entrega de eventos
- **Ventajas**: Desacoplamiento, escalabilidad, confiabilidad

### Funciones Lambda
- **Tecnología**: Node.js 18
- **Responsabilidad**: Procesamiento de eventos
- **Escalabilidad**: Vertical (más memoria/CPU) y horizontal (múltiples invocaciones)

### Dead Letter Queue (DLQ)
- **Tipo**: SQS Queue
- **Responsabilidad**: Almacenamiento de eventos fallidos
- **Retención**: 14 días

## Escalado Vertical

El sistema está optimizado para escalado vertical mediante:

1. **Alta Memoria (2048 MB)**: Más memoria = más CPU asignada
2. **Concurrencia Reservada (50)**: Control de ejecuciones simultáneas
3. **Timeout Ajustado (60s)**: Tiempo suficiente para procesamiento complejo
4. **DLQ**: Manejo robusto de errores

### Ventajas
- Mayor rendimiento por ejecución
- Menor latencia
- Mejor uso de recursos para cargas de trabajo CPU-intensivas
- Predictibilidad en el rendimiento

## Seguridad

- **IAM Roles**: Permisos mínimos necesarios
- **EventBridge Rules**: Filtrado y enrutamiento seguro
- **DLQ**: Aislamiento de eventos fallidos
- **VPC**: Opcional para mayor seguridad

## Monitoreo

- **CloudWatch Logs**: Logs de todas las Lambdas
- **EventBridge Metrics**: Métricas de eventos procesados
- **Lambda Metrics**: Invocaciones, errores, duración
- **DLQ Metrics**: Mensajes en cola, edad de mensajes

## Costos

### Factores de Costo
- **EventBridge**: $1.00 por millón de eventos
- **Lambda**: Basado en invocaciones y GB-segundo
- **SQS**: Basado en solicitudes (DLQ)
- **CloudWatch**: Basado en logs y métricas

### Optimizaciones
- Concurrencia reservada para controlar costos
- DLQ para evitar procesamiento infinito de eventos fallidos
- Timeout ajustado para evitar ejecuciones largas innecesarias

