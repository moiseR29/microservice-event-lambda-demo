const express = require('express');
const cors = require('cors');
const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de EventBridge
const eventBridgeClient = new EventBridgeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'communications-event-bus';

// Función helper para publicar eventos
async function publishEvent(detailType, detail) {
  const params = {
    Entries: [
      {
        Source: 'communications.service',
        DetailType: detailType,
        Detail: JSON.stringify(detail),
        EventBusName: EVENT_BUS_NAME,
      },
    ],
  };

  try {
    const command = new PutEventsCommand(params);
    const result = await eventBridgeClient.send(command);
    console.log('Evento publicado:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error al publicar evento:', error);
    throw error;
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'communications-microservice',
    timestamp: new Date().toISOString(),
  });
});

// Endpoint para enviar email
app.post('/api/communications/email', async (req, res) => {
  try {
    const { to, subject, body, from } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        error: 'Campos requeridos: to, subject, body',
      });
    }

    const eventDetail = {
      to,
      subject,
      body,
      from: from || 'noreply@example.com',
      timestamp: new Date().toISOString(),
      messageId: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    await publishEvent('EmailNotification', eventDetail);

    res.json({
      success: true,
      message: 'Email enviado a EventBridge',
      messageId: eventDetail.messageId,
    });
  } catch (error) {
    console.error('Error al procesar email:', error);
    res.status(500).json({
      error: 'Error al procesar la solicitud de email',
      details: error.message,
    });
  }
});

// Endpoint para enviar SMS
app.post('/api/communications/sms', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        error: 'Campos requeridos: to, message',
      });
    }

    const eventDetail = {
      to,
      message,
      timestamp: new Date().toISOString(),
      messageId: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    await publishEvent('SMSNotification', eventDetail);

    res.json({
      success: true,
      message: 'SMS enviado a EventBridge',
      messageId: eventDetail.messageId,
    });
  } catch (error) {
    console.error('Error al procesar SMS:', error);
    res.status(500).json({
      error: 'Error al procesar la solicitud de SMS',
      details: error.message,
    });
  }
});

// Endpoint para enviar push notification
app.post('/api/communications/push', async (req, res) => {
  try {
    const { deviceToken, title, body, data } = req.body;

    if (!deviceToken || !title || !body) {
      return res.status(400).json({
        error: 'Campos requeridos: deviceToken, title, body',
      });
    }

    const eventDetail = {
      deviceToken,
      title,
      body,
      data: data || {},
      timestamp: new Date().toISOString(),
      messageId: `push-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    await publishEvent('PushNotification', eventDetail);

    res.json({
      success: true,
      message: 'Push notification enviada a EventBridge',
      messageId: eventDetail.messageId,
    });
  } catch (error) {
    console.error('Error al procesar push notification:', error);
    res.status(500).json({
      error: 'Error al procesar la solicitud de push notification',
      details: error.message,
    });
  }
});

// Endpoint para obtener estadísticas
app.get('/api/communications/stats', (req, res) => {
  res.json({
    service: 'communications-microservice',
    status: 'running',
    eventBus: EVENT_BUS_NAME,
    region: process.env.AWS_REGION || 'us-east-1',
    uptime: process.uptime(),
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    details: err.message,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Microservicio de comunicaciones ejecutándose en puerto ${PORT}`);
  console.log(`📡 EventBridge Bus: ${EVENT_BUS_NAME}`);
  console.log(`🌍 Región: ${process.env.AWS_REGION || 'us-east-1'}`);
});

module.exports = app;

