const API_URL = 'http://localhost:3006/api/invoices';

// ====================== FACTURAS ======================

export async function getAllInvoices(userId = null, estado = null) {
  try {
    let url = API_URL;
    const params = new URLSearchParams();
    
    if (userId) params.append('user_id', userId);
    if (estado) params.append('estado', estado);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Error obteniendo facturas');
    
    const data = await response.json();
    return data.invoices;
  } catch (error) {
    console.error('Error en getAllInvoices:', error);
    throw error;
  }
}

export async function getInvoiceById(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Factura no encontrada');
    
    return await response.json();
  } catch (error) {
    console.error('Error en getInvoiceById:', error);
    throw error;
  }
}

export async function getInvoiceByReservationId(reservaId) {
  try {
    const response = await fetch(`${API_URL}/reservation/${reservaId}`);
    if (!response.ok) throw new Error('Factura no encontrada para esta reserva');
    
    return await response.json();
  } catch (error) {
    console.error('Error en getInvoiceByReservationId:', error);
    throw error;
  }
}

export async function createInvoice(invoiceData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error creando factura');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en createInvoice:', error);
    throw error;
  }
}

export async function updateInvoiceStatus(id, estado) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado }),
    });

    if (!response.ok) throw new Error('Error actualizando factura');
    
    return await response.json();
  } catch (error) {
    console.error('Error en updateInvoiceStatus:', error);
    throw error;
  }
}

export async function deleteInvoice(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Error eliminando factura');
    
    return await response.json();
  } catch (error) {
    console.error('Error en deleteInvoice:', error);
    throw error;
  }
}

export async function getInvoiceStats(userId) {
  try {
    const response = await fetch(`${API_URL}/stats/${userId}`);
    if (!response.ok) throw new Error('Error obteniendo estadísticas');
    
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error en getInvoiceStats:', error);
    throw error;
  }
}

// ====================== HELPERS ======================

// Mapear métodos de pago del frontend a los valores de la BD
function mapPaymentMethod(frontendMethod) {
  const methodMap = {
    'card': 'tarjeta',
    'pse': 'transferencia',
    'nequi': 'transferencia',
    'daviplata': 'transferencia',
    'paypal': 'paypal',
    'cash': 'efectivo',
  };
  
  return methodMap[frontendMethod] || 'tarjeta';
}

// Crear factura para vuelo
export async function createFlightInvoice({ reservation, paymentData, flightData }) {
  const invoice = {
    reserva_id: reservation.id,
    user_id: reservation.user_id,
    tipo_item: 'Vuelo',
    descripcion: `${flightData.origin} → ${flightData.destination} - ${flightData.airline}`,
    fecha_inicio: flightData.departureDate,
    fecha_fin: flightData.returnDate || null,
    cantidad: flightData.passengers || 1,
    subtotal: reservation.total_price,
    impuestos: 0,
    total: reservation.total_price,
    moneda: reservation.moneda || 'USD',
    metodo_pago: mapPaymentMethod(paymentData.paymentMethod),
    estado: 'pagada',
    nombre_cliente: paymentData.cardholderName || paymentData.email,
    identificacion_fiscal: paymentData.documentNumber || null,
    direccion_fiscal: null,
  };

  return await createInvoice(invoice);
}

// Crear factura para alojamiento
export async function createLodgingInvoice({ reservation, paymentData, lodgingData }) {
  const nights = lodgingData.nights || 1;
  
  const invoice = {
    reserva_id: reservation.id,
    user_id: reservation.user_id,
    tipo_item: 'Alojamiento',
    descripcion: `${lodgingData.name} - ${lodgingData.city}, ${lodgingData.country}`,
    fecha_inicio: lodgingData.checkIn,
    fecha_fin: lodgingData.checkOut,
    cantidad: nights,
    subtotal: reservation.total_price,
    impuestos: 0,
    total: reservation.total_price,
    moneda: reservation.moneda || 'USD',
    metodo_pago: mapPaymentMethod(paymentData.paymentMethod),
    estado: 'pagada',
    nombre_cliente: paymentData.cardholderName || paymentData.email,
    identificacion_fiscal: paymentData.documentNumber || null,
    direccion_fiscal: null,
  };

  return await createInvoice(invoice);
}

// Crear factura para vehículo
export async function createVehicleInvoice({ reservation, paymentData, vehicleData }) {
  const days = vehicleData.days || 1;
  
  const invoice = {
    reserva_id: reservation.id,
    user_id: reservation.user_id,
    tipo_item: 'Vehículo',
    descripcion: `${vehicleData.brand} ${vehicleData.model} - ${vehicleData.type}`,
    fecha_inicio: vehicleData.startDate,
    fecha_fin: vehicleData.endDate,
    cantidad: days,
    subtotal: reservation.total_price,
    impuestos: 0,
    total: reservation.total_price,
    moneda: reservation.moneda || 'USD',
    metodo_pago: mapPaymentMethod(paymentData.paymentMethod),
    estado: 'pagada',
    nombre_cliente: paymentData.cardholderName || paymentData.email,
    identificacion_fiscal: paymentData.documentNumber || null,
    direccion_fiscal: null,
  };

  return await createInvoice(invoice);
}
