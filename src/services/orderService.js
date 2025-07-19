import apiService from './api';

class OrderService {
  async createOrder(orderData) {
    try {
      const response = await apiService.post('/order', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw this.handleError(error);
    }
  }

  async getOrderById(id) {
    try {
      const response = await apiService.get(`/order/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting order:', error);
      throw this.handleError(error);
    }
  }

  async getMyOrders() {
    try {
      const response = await apiService.get('/order/my-orders');
      return response.data;
    } catch (error) {
      console.error('Error getting my orders:', error);
      throw this.handleError(error);
    }
  }

  async getAllOrders() {
    try {
      const response = await apiService.get('/order');
      return response.data;
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw this.handleError(error);
    }
  }

  async getOrdersByStatus(status) {
    try {
      const response = await apiService.get(`/order/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error getting orders by status:', error);
      throw this.handleError(error);
    }
  }

  async uploadPaymentReceipt(orderId, file) {
    try {
      const formData = new FormData();
      formData.append('receiptFile', file);

      const response = await apiService.post(`/order/${orderId}/payment-receipt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading payment receipt:', error);
      throw this.handleError(error);
    }
  }

  async getOrdersPendingReview() {
    try {
      const response = await apiService.get('/order/pending-review');
      return response.data;
    } catch (error) {
      console.error('Error getting pending orders:', error);
      throw this.handleError(error);
    }
  }

  async approvePayment(orderId, adminNotes = '') {
    try {
      const response = await apiService.put(`/order/${orderId}/approve-payment`, {
        adminNotes
      });
      return response.data;
    } catch (error) {
      console.error('Error approving payment:', error);
      throw this.handleError(error);
    }
  }

  async rejectPayment(orderId, adminNotes) {
    try {
      const response = await apiService.put(`/order/${orderId}/reject-payment`, {
        adminNotes
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting payment:', error);
      throw this.handleError(error);
    }
  }

  async markAsShipped(orderId, trackingNumber, shippingProvider, adminNotes = '') {
    try {
      const response = await apiService.put(`/order/${orderId}/mark-shipped`, {
        trackingNumber,
        shippingProvider,
        adminNotes
      });
      return response.data;
    } catch (error) {
      console.error('Error marking as shipped:', error);
      throw this.handleError(error);
    }
  }

  async markAsDelivered(orderId, adminNotes = '') {
    try {
      const response = await apiService.put(`/order/${orderId}/mark-delivered`, {
        adminNotes
      });
      return response.data;
    } catch (error) {
      console.error('Error marking as delivered:', error);
      throw this.handleError(error);
    }
  }

  // Obtiene URL del comprobante de pago
  async getPaymentReceipt(orderId) {
    try {
      const response = await apiService.get(`/order/${orderId}/payment-receipt`);
      return response.data;
    } catch (error) {
      console.error('Error getting payment receipt:', error);
      throw this.handleError(error);
    }
  }

  async updateOrderStatus(orderId, status, adminNotes = '') {
    try {
      const response = await apiService.put(`/order/${orderId}/status`, {
        status,
        adminNotes
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error('Error de conexión. Intenta nuevamente.');
  }

  // Formatea datos de orden para el API
  formatOrderData(cartItems, customerData) {
    return {
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone || '',
      customerAddress: customerData.address || '',
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };
  }

  // Calcula total (útil para validaciones del frontend)
  calculateTotal(cartItems) {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Valida datos del cliente
  validateCustomerData(customerData) {
    const errors = {};

    if (!customerData.name?.trim()) {
      errors.name = 'El nombre es requerido';
    }

    if (!customerData.email?.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      errors.email = 'El email no es válido';
    }

    if (customerData.phone && !/^[\d\s\-\+\(\)]{7,}$/.test(customerData.phone)) {
      errors.phone = 'El teléfono no es válido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Valida carrito antes del checkout
  validateCart(cartItems) {
    if (!cartItems || cartItems.length === 0) {
      return {
        isValid: false,
        message: 'El carrito está vacío'
      };
    }

    for (const item of cartItems) {
      if (item.quantity <= 0) {
        return {
          isValid: false,
          message: `Cantidad inválida para ${item.name}`
        };
      }

      if (item.quantity > item.stock) {
        return {
          isValid: false,
          message: `Stock insuficiente para ${item.name}. Disponible: ${item.stock}`
        };
      }
    }

    return {
      isValid: true,
      message: 'Carrito válido'
    };
  }

  // Formatea fecha para mostrar
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Formatea precio
  formatPrice(price) {
    return price.toFixed(2);
  }

  getStatusColor(status) {
    const colors = {
      'pending_payment': 'text-yellow-600 bg-yellow-50',
      'payment_submitted': 'text-blue-600 bg-blue-50',
      'payment_approved': 'text-green-600 bg-green-50',
      'payment_rejected': 'text-red-600 bg-red-50',
      'shipped': 'text-purple-600 bg-purple-50',
      'delivered': 'text-green-700 bg-green-100',
      'cancelled': 'text-red-600 bg-red-50',
      'pending': 'text-yellow-600 bg-yellow-50',
      'completed': 'text-green-600 bg-green-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  }

  getStatusText(status) {
    const texts = {
      'pending_payment': 'Esperando comprobante',
      'payment_submitted': 'Comprobante en revisión',
      'payment_approved': 'Pago aprobado',
      'payment_rejected': 'Comprobante rechazado',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado',
      'pending': 'Pendiente',
      'completed': 'Completada'
    };
    return texts[status] || status;
  }

  getStatusDescription(status) {
    const descriptions = {
      'pending_payment': 'Adjunta tu comprobante de pago para continuar',
      'payment_submitted': 'Estamos revisando tu comprobante de pago',
      'payment_approved': 'Tu pago fue aprobado. Preparando envío',
      'payment_rejected': 'Tu comprobante fue rechazado. Intenta nuevamente',
      'shipped': 'Tu pedido está en camino',
      'delivered': 'Tu pedido fue entregado exitosamente',
      'cancelled': 'Esta orden fue cancelada'
    };
    return descriptions[status] || '';
  }

  canUploadReceipt(status) {
    return status === 'pending_payment' || status === 'payment_rejected';
  }

  canAdminModify(status) {
    return ['payment_submitted', 'payment_approved', 'shipped'].includes(status);
  }

  async downloadReceipt(orderId) {
    try {
        const response = await apiService.get(`/order/${orderId}/download-receipt`, {
            responseType: 'blob' // ← Importante para archivos
        });

        // Crear descarga automática
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprobante_orden_${orderId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error('Error downloading receipt:', error);
        throw error;
    }
  }

  async getReceiptViewUrl(orderId) {
    try {
        // Para "ver en nueva pestaña", generamos una URL temporal
        const token = localStorage.getItem('token');
        return `${apiService.defaults.baseURL}/order/${orderId}/download-receipt?token=${token}`;
    } catch (error) {
        throw error;
    }
  }
}

export const orderService = new OrderService();