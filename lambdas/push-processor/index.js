/**
 * Lambda function para procesar eventos de push notifications desde EventBridge
 * Escala verticalmente mediante configuración de memoria y concurrencia
 */

exports.handler = async (event) => {
  console.log('Evento recibido en push-processor:', JSON.stringify(event, null, 2));

  try {
    // EventBridge envía el evento directamente en event.detail
    const eventDetail = event.detail || event;
    
    console.log('Procesando push notification:', {
      messageId: eventDetail.messageId,
      deviceToken: eventDetail.deviceToken?.substring(0, 20) + '...',
      title: eventDetail.title,
    });

    // Simular procesamiento de push notification (mock)
    const processingResult = await processPushNotification(eventDetail);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: eventDetail.messageId,
        status: 'processed',
        result: processingResult,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Error al procesar push notification:', error);
    throw error; // Lanza el error para que EventBridge lo maneje con retry
  }
};

/**
 * Función mock para procesar push notification
 * En producción, aquí se integraría con FCM, APNs, o otro servicio de push
 */
async function processPushNotification(pushDetail) {
  // Simular latencia de procesamiento
  await new Promise(resolve => setTimeout(resolve, 80));
  
  // Mock: Simular envío de push notification
  console.log(`🔔 Push notification enviada a dispositivo`);
  console.log(`   Título: ${pushDetail.title}`);
  console.log(`   Cuerpo: ${pushDetail.body}`);
  
  return {
    delivered: true,
    provider: 'mock-push-provider',
    estimatedDeliveryTime: 'instantáneo',
    platform: 'ios/android',
  };
}

