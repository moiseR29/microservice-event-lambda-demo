/**
 * Lambda function para procesar eventos de SMS desde EventBridge
 * Escala verticalmente mediante configuración de memoria y concurrencia
 */

exports.handler = async (event) => {
  console.log('Evento recibido en sms-processor:', JSON.stringify(event, null, 2));

  try {
    // EventBridge envía el evento directamente en event.detail
    const eventDetail = event.detail || event;
    
    console.log('Procesando SMS:', {
      messageId: eventDetail.messageId,
      to: eventDetail.to,
      messageLength: eventDetail.message?.length,
    });

    // Simular procesamiento de SMS (mock)
    const processingResult = await processSMS(eventDetail);
    
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
    console.error('Error al procesar SMS:', error);
    throw error; // Lanza el error para que EventBridge lo maneje con retry
  }
};

/**
 * Función mock para procesar SMS
 * En producción, aquí se integraría con un servicio de SMS (SNS, Twilio, etc.)
 */
async function processSMS(smsDetail) {
  // Simular latencia de procesamiento
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // Mock: Simular envío de SMS
  console.log(`📱 SMS enviado a ${smsDetail.to}`);
  console.log(`   Mensaje: ${smsDetail.message.substring(0, 50)}...`);
  
  return {
    delivered: true,
    provider: 'mock-sms-provider',
    estimatedDeliveryTime: '10-30 segundos',
    cost: 0.01,
  };
}

