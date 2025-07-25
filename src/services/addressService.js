import apiService from './api';

class AddressService {
  async getMyAddresses() {
    try {
      const response = await apiService.get('/shippingaddress/my-addresses');
      return response.data;
    } catch (error) {
      console.error('Error getting addresses:', error);
      throw this.handleError(error);
    }
  }

  async getAddressById(id) {
    try {
      const response = await apiService.get(`/shippingaddress/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting address:', error);
      throw this.handleError(error);
    }
  }

  async createAddress(addressData) {
    try {
      const response = await apiService.post('/shippingaddress', addressData);
      return response.data;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  }

  async updateAddress(id, addressData) {
    try {
      const response = await apiService.put(`/shippingaddress/${id}`, addressData);
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  async deleteAddress(id) {
    try {
      const response = await apiService.delete(`/shippingaddress/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw this.handleError(error);
    }
  }

  async setDefaultAddress(id) {
    try {
      const response = await apiService.put(`/shippingaddress/${id}/set-default`);
      return response.data;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw this.handleError(error);
    }
  }

  // Valida datos de dirección
  validateAddressData(addressData) {
    const errors = {};

    // Datos de quien recibe
    if (!addressData.authorizedPersonFirstName?.trim()) {
      errors.authorizedPersonFirstName = 'El nombre es requerido';
    }

    if (!addressData.authorizedPersonLastName?.trim()) {
      errors.authorizedPersonLastName = 'El apellido es requerido';
    }

    if (!addressData.authorizedPersonPhone?.trim()) {
      errors.authorizedPersonPhone = 'El teléfono es requerido';
    }

    if (!addressData.authorizedPersonDni?.trim()) {
      errors.authorizedPersonDni = 'El DNI es requerido';
    }

    // Dirección
    if (!addressData.addressType?.trim()) {
      errors.addressType = 'El tipo de domicilio es requerido';
    }

    if (!addressData.street?.trim()) {
      errors.street = 'La calle es requerida';
    }

    if (!addressData.number?.trim()) {
      errors.number = 'La altura es requerida';
    }

    if (!addressData.postalCode?.trim()) {
      errors.postalCode = 'El código postal es requerido';
    }

    if (!addressData.province?.trim()) {
      errors.province = 'La provincia es requerida';
    }

    if (!addressData.city?.trim()) {
      errors.city = 'La localidad es requerida';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Formatea dirección para mostrar
  formatAddressDisplay(address) {
    let display = `${address.street} ${address.number}`;

    if (address.floor) display += `, Piso ${address.floor}`;
    if (address.apartment) display += `, Dto ${address.apartment}`;
    if (address.tower) display += `, Torre ${address.tower}`;

    display += `, ${address.city}, ${address.province}`;

    return display;
  }

  // Formatea dirección completa para el checkout
  formatFullAddress(address) {
    return {
      line1: `${address.street} ${address.number}`,
      line2: [address.floor && `Piso ${address.floor}`,
      address.apartment && `Dto ${address.apartment}`,
      address.tower && `Torre ${address.tower}`]
        .filter(Boolean).join(', ') || null,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      betweenStreets: address.betweenStreets,
      observations: address.observations,
      receiver: `${address.authorizedPersonFirstName} ${address.authorizedPersonLastName}`,
      receiverPhone: address.authorizedPersonPhone,
      receiverDni: address.authorizedPersonDni
    };
  }

  handleError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error('Error de conexión. Intenta nuevamente.');
  }

  // Opciones predefinidas para formularios
  getAddressTypeOptions() {
    return [
      { value: 'Casa', label: 'Casa' },
      { value: 'Trabajo', label: 'Trabajo' }
    ];
  }

  // Provincias argentinas (ejemplo)
  getProvinceOptions() {
    return [
      'Buenos Aires',
      'CABA',
      'Catamarca',
      'Chaco',
      'Chubut',
      'Córdoba',
      'Corrientes',
      'Entre Ríos',
      'Formosa',
      'Jujuy',
      'La Pampa',
      'La Rioja',
      'Mendoza',
      'Misiones',
      'Neuquén',
      'Río Negro',
      'Salta',
      'San Juan',
      'San Luis',
      'Santa Cruz',
      'Santa Fe',
      'Santiago del Estero',
      'Tierra del Fuego',
      'Tucumán'
    ].map(province => ({ value: province, label: province }));



  }
}

export const addressService = new AddressService();