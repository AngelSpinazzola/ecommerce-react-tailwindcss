import apiService from './api';

class OrderService {
  // Crea nueva orden
  async createOrder(orderData) {
    try {
      const response = await apiService.post('/order', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw this.handleError(error);
    }
  }

  // Obtiene orden por ID
  async getOrderById(id) {
    try {
      const response = await apiService.get(`/order/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting order:', error);
      throw this.handleError(error);
    }
  }

  // Obtiene mis órdenes (usuario logueado)
  async getMyOrders() {
    try {
      const response = await apiService.get('/order/my-orders');
      return response.data;
    } catch (error) {
      console.error('Error getting my orders:', error);
      throw this.handleError(error);
    }
  }

  // Obtiene todas las órdenes (solo admin)
  async getAllOrders() {
    try {
      const response = await apiService.get('/order');
      return response.data;
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw this.handleError(error);
    }
  }

  // Obtiene órdenes por estado (solo admin)
  async getOrdersByStatus(status) {
    try {
      const response = await apiService.get(`/order/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error getting orders by status:', error);
      throw this.handleError(error);
    }
  }

  // Maneja errores
  handleError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error('Error de conexión. Intenta nuevamente.');
  }

  // Formatear datos de orden para el API
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

  // Obtiene color del estado para UI
  getStatusColor(status) {
    const colors = {
      pending: 'text-yellow-600',
      completed: 'text-green-600',
      cancelled: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  }

  // Obtiene texto amigable del estado
  getStatusText(status) {
    const texts = {
      pending: 'Pendiente',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return texts[status] || status;
  }
}

export const orderService = new OrderService();