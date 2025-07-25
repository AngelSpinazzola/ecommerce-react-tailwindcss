import React, { useState, useEffect } from 'react';
import { addressService } from '../services/addressService';

const AddressModal = ({ isOpen, onClose, onSave, editingAddress = null }) => {
    const [formData, setFormData] = useState({
        // Datos de quien recibirá el pedido
        authorizedPersonFirstName: '',
        authorizedPersonLastName: '',
        authorizedPersonPhone: '',
        authorizedPersonDni: '',

        // Dirección de envío
        addressType: 'Casa',
        street: '',
        number: '',
        floor: '',
        apartment: '',
        tower: '',
        betweenStreets: '',
        postalCode: '',
        province: '',
        city: '',
        observations: '',
        isDefault: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Llenar formulario cuando se edita una dirección
    useEffect(() => {
        if (editingAddress) {
            setFormData({
                authorizedPersonFirstName: editingAddress.authorizedPersonFirstName || '',
                authorizedPersonLastName: editingAddress.authorizedPersonLastName || '',
                authorizedPersonPhone: editingAddress.authorizedPersonPhone || '',
                authorizedPersonDni: editingAddress.authorizedPersonDni || '',
                addressType: editingAddress.addressType || 'Casa',
                street: editingAddress.street || '',
                number: editingAddress.number || '',
                floor: editingAddress.floor || '',
                apartment: editingAddress.apartment || '',
                tower: editingAddress.tower || '',
                betweenStreets: editingAddress.betweenStreets || '',
                postalCode: editingAddress.postalCode || '',
                province: editingAddress.province || '',
                city: editingAddress.city || '',
                observations: editingAddress.observations || '',
                isDefault: editingAddress.isDefault || false
            });
        } else {
            // Reset form for new address
            setFormData({
                authorizedPersonFirstName: '',
                authorizedPersonLastName: '',
                authorizedPersonPhone: '',
                authorizedPersonDni: '',
                addressType: 'Casa',
                street: '',
                number: '',
                floor: '',
                apartment: '',
                tower: '',
                betweenStreets: '',
                postalCode: '',
                province: '',
                city: '',
                observations: '',
                isDefault: false
            });
        }
        setErrors({});
    }, [editingAddress, isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const mapBackendFieldToFrontend = (backendField) => {
        const fieldMapping = {
            'AuthorizedPersonFirstName': 'authorizedPersonFirstName',
            'AuthorizedPersonLastName': 'authorizedPersonLastName',
            'AuthorizedPersonPhone': 'authorizedPersonPhone',
            'AuthorizedPersonDni': 'authorizedPersonDni',
            'AddressType': 'addressType',
            'Street': 'street',
            'Number': 'number',
            'PostalCode': 'postalCode',
            'Province': 'province',
            'City': 'city'
        };

        return fieldMapping[backendField] || null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // Validate form
            const validation = addressService.validateAddressData(formData);
            if (!validation.isValid) {
                setErrors(validation.errors);
                return;
            }

            // Call API
            if (editingAddress) {
                await addressService.updateAddress(editingAddress.id, formData);
            } else {
                await addressService.createAddress(formData);
            }

            onSave();
            onClose();
        } catch (error) {
            console.log('Error completo:', error);
            console.log('Error response:', error.response);
            console.log('Error response data:', error.response?.data);
            // Manejo específico de errores de validación del backend
            if (error.response?.status === 400) {
                if (error.response?.data?.errors) {
                    // Errores de validación del modelo (.NET ModelState)
                    const validationErrors = error.response.data.errors;
                    const newErrors = {};

                    // Mapear errores específicos del backend a campos del frontend
                    Object.keys(validationErrors).forEach(key => {
                        const frontendKey = mapBackendFieldToFrontend(key);
                        if (frontendKey) {
                            newErrors[frontendKey] = validationErrors[key][0];
                        }
                    });

                    setErrors(newErrors);
                } else {
                    // Errores de lógica de negocio (ArgumentException)
                    const message = error.response.data.message;

                    if (message.includes("Provincia")) {
                        setErrors({ province: message });
                    } else if (message.includes("DNI")) {
                        setErrors({ authorizedPersonDni: message });
                    } else if (message.includes("código postal") || message.includes("Código postal")) {
                        setErrors({ postalCode: message });
                    } else {
                        setErrors({ general: message });
                    }
                }
            } else {
                setErrors({ general: error.message || 'Error al procesar la solicitud' });
            }
        } finally {
            setLoading(false);
        }
    };

    const provinces = addressService.getProvinceOptions();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* Error general */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-700">{errors.general}</p>
                        </div>
                    )}

                    {/* DATOS DE QUIÉN RECIBIRÁ EL PEDIDO */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                            Datos de quién recibirá el pedido
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre persona autorizada*
                                </label>
                                <input
                                    type="text"
                                    name="authorizedPersonFirstName"
                                    value={formData.authorizedPersonFirstName}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.authorizedPersonFirstName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Ingresa el nombre"
                                />
                                {errors.authorizedPersonFirstName && (
                                    <p className="text-sm text-red-600 mt-1">{errors.authorizedPersonFirstName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Apellido persona autorizada*
                                </label>
                                <input
                                    type="text"
                                    name="authorizedPersonLastName"
                                    value={formData.authorizedPersonLastName}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.authorizedPersonLastName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Ingresa el apellido"
                                />
                                {errors.authorizedPersonLastName && (
                                    <p className="text-sm text-red-600 mt-1">{errors.authorizedPersonLastName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono persona autorizada*
                                </label>
                                <input
                                    type="tel"
                                    name="authorizedPersonPhone"
                                    value={formData.authorizedPersonPhone}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.authorizedPersonPhone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Ej: 11 1234-5678"
                                />
                                {errors.authorizedPersonPhone && (
                                    <p className="text-sm text-red-600 mt-1">{errors.authorizedPersonPhone}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    DNI persona autorizada*
                                </label>
                                <input
                                    type="text"
                                    name="authorizedPersonDni"
                                    value={formData.authorizedPersonDni}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.authorizedPersonDni ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Ej: 12345678"
                                />
                                {errors.authorizedPersonDni && (
                                    <p className="text-sm text-red-600 mt-1">{errors.authorizedPersonDni}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* DIRECCIÓN DE ENVÍO */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                            Dirección de envío
                        </h3>

                        {/* Tipo de domicilio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de domicilio *
                            </label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="addressType"
                                        value="Casa"
                                        checked={formData.addressType === 'Casa'}
                                        onChange={handleInputChange}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2">Casa</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="addressType"
                                        value="Trabajo"
                                        checked={formData.addressType === 'Trabajo'}
                                        onChange={handleInputChange}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2">Trabajo</span>
                                </label>
                            </div>
                            {errors.addressType && (
                                <p className="text-sm text-red-600 mt-1">{errors.addressType}</p>
                            )}
                        </div>

                        {/* Calle y Altura */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Calle *
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.street ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Ej: Av. Corrientes"
                                />
                                {errors.street && (
                                    <p className="text-sm text-red-600 mt-1">{errors.street}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Altura *
                                </label>
                                <input
                                    type="text"
                                    name="number"
                                    value={formData.number}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.number ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="1234"
                                />
                                {errors.number && (
                                    <p className="text-sm text-red-600 mt-1">{errors.number}</p>
                                )}
                            </div>
                        </div>

                        {/* Piso, Departamento, Torre */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Piso
                                </label>
                                <input
                                    type="text"
                                    name="floor"
                                    value={formData.floor}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ej: 3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Departamento
                                </label>
                                <input
                                    type="text"
                                    name="apartment"
                                    value={formData.apartment}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ej: A"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Torre
                                </label>
                                <input
                                    type="text"
                                    name="tower"
                                    value={formData.tower}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ej: Norte"
                                />
                            </div>
                        </div>

                        {/* Entrecalles */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Entrecalles
                            </label>
                            <input
                                type="text"
                                name="betweenStreets"
                                value={formData.betweenStreets}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ej: Entre Callao y Riobamba"
                            />
                        </div>

                        {/* Código Postal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Código Postal *
                                </label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.postalCode ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Ej: 1043"
                                />
                                {errors.postalCode && (
                                    <p className="text-sm text-red-600 mt-1">{errors.postalCode}</p>
                                )}
                            </div>
                            {/* Provincia*/}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Provincia *
                                </label>
                                <select
                                    name="province"
                                    value={formData.province}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.province ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Selecciona una provincia</option>
                                    {provinces.map(province => (
                                        <option key={province.value} value={province.value}>
                                            {province.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.province && (
                                    <p className="text-sm text-red-600 mt-1">{errors.province}</p>
                                )}
                            </div>
                        </div>

                        {/* Localidad */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Localidad *
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Ej: Buenos Aires"
                            />
                            {errors.city && (
                                <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                            )}
                        </div>

                        {/* Observaciones */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Observaciones
                            </label>
                            <textarea
                                name="observations"
                                value={formData.observations}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Instrucciones adicionales para la entrega..."
                            />
                        </div>

                        {/* Dirección predeterminada */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleInputChange}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <label className="ml-2 text-sm text-gray-700">
                                Establecer como dirección principal
                            </label>
                        </div>

                        <div className="text-sm text-gray-500 mt-2">
                            * Campo requerido
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                editingAddress ? 'Actualizar Dirección' : 'Guardar Dirección'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressModal;