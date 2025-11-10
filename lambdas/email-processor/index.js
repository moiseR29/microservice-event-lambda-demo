/**
 * Lambda function para procesar eventos de email desde EventBridge
 * Escala verticalmente mediante configuración de memoria y concurrencia
 */

exports.handler = async (event) => {
  console.log('Evento recibido en email-processor:', JSON.stringify(event, null, 2));

  try {
    // EventBridge envía el evento directamente en event.detail
    const eventDetail = event.detail || event;
    
    console.log('Procesando email:', {
      messageId: eventDetail.messageId,
      to: eventDetail.to,
      subject: eventDetail.subject,
    });

    // Simular procesamiento de email (mock)
    const processingResult = await processEmail(eventDetail);
    
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
    console.error('Error al procesar email:', error);
    throw error; // Lanza el error para que EventBridge lo maneje con retry
  }
};

/**
 * Función mock para procesar email
 * En producción, aquí se integraría con un servicio de email (SES, SendGrid, etc.)
 */
async function processEmail(emailDetail) {
  // Simular latencia de procesamiento
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock: Simular envío de email
  console.log(`📧 Email enviado a ${emailDetail.to}`);
  console.log(`   Asunto: ${emailDetail.subject}`);
  console.log(`   De: ${emailDetail.from}`);
  
  return {
    delivered: true,
    provider: 'mock-email-provider',
    estimatedDeliveryTime: '1-2 minutos',
  };
}

