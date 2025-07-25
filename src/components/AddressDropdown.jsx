import React, { useState, useEffect } from 'react';
import { addressService } from '../services/addressService';
import AddressModal from './AddressModal';

const AddressDropdown = ({ onAddressSelect, selectedAddressId, error }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        setLoading(true);
        try {
            const data = await addressService.getMyAddresses();
            setAddresses(data);
            setLoadError('');

            // Si hay direcciones y no hay una seleccionada, seleccionar la predeterminada
            if (data.length > 0 && !selectedAddressId) {
                const defaultAddress = data.find(addr => addr.isDefault) || data[0];
                onAddressSelect(defaultAddress.id);
            }
        } catch (error) {
            setLoadError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSelect = (addressId) => {
        onAddressSelect(addressId);
        setIsOpen(false);
    };

    const handleNewAddress = () => {
        setIsModalOpen(true);
        setIsOpen(false);
    };

    const handleModalSave = () => {
        loadAddresses();
    };

    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

    if (loading) {
        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Dirección de Envío *
                </label>
                <div className="flex items-center justify-center py-8 border border-gray-300 rounded-md">
                    <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-gray-600">Cargando direcciones...</span>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Dirección de Envío *
                </label>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">{loadError}</p>
                    <button
                        onClick={loadAddresses}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Intentar nuevamente
                    </button>
                </div>
            </div>
        );
    }

    if (addresses.length === 0) {
        return (
            <>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Dirección de Envío *
                    </label>
                    <div className="border border-gray-300 rounded-md p-4 text-center">
                        <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm text-gray-600 mb-3">No tienes direcciones guardadas</p>
                        <button
                            onClick={handleNewAddress}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Crear Primera Dirección
                        </button>
                    </div>
                </div>

                <AddressModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleModalSave}
                />
            </>
        );
    }

    return (
        <>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Dirección de Envío *
                </label>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`relative w-full bg-white border rounded-md pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'
                            }`}
                    >
                        {selectedAddress ? (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${selectedAddress.addressType === 'Casa'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-purple-100 text-purple-800'
                                        }`}>
                                        {selectedAddress.addressType}
                                    </span>
                                    {selectedAddress.isDefault && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Principal
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                    {selectedAddress.authorizedPersonFirstName} {selectedAddress.authorizedPersonLastName}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {addressService.formatAddressDisplay(selectedAddress)}
                                </div>
                            </div>
                        ) : (
                            <span className="text-gray-500">Selecciona una dirección</span>
                        )}

                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                        </span>
                    </button>

                    {isOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                            {addresses.map((address) => (
                                <button
                                    key={address.id}
                                    type="button"
                                    onClick={() => handleAddressSelect(address.id)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${selectedAddressId === address.id ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${address.addressType === 'Casa'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {address.addressType}
                                            </span>
                                            {address.isDefault && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Principal
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {address.authorizedPersonFirstName} {address.authorizedPersonLastName}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {addressService.formatAddressDisplay(address)}
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {/* Opción para crear nueva dirección */}
                            <button
                                type="button"
                                onClick={handleNewAddress}
                                className="w-full text-left px-4 py-3 text-blue-600 hover:bg-blue-50 border-t border-gray-200 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="text-sm font-medium">Agregar Nueva Dirección</span>
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                {/* Mostrar detalles de la dirección seleccionada */}
                {selectedAddress && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Detalles de entrega:</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div><strong>Recibe:</strong> {selectedAddress.authorizedPersonFirstName} {selectedAddress.authorizedPersonLastName}</div>
                            <div><strong>DNI:</strong> {selectedAddress.authorizedPersonDni}</div>
                            <div><strong>Teléfono:</strong> {selectedAddress.authorizedPersonPhone}</div>
                            {selectedAddress.observations && (
                                <div><strong>Observaciones:</strong> {selectedAddress.observations}</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <AddressModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleModalSave}
            />
        </>
    );
};

export default AddressDropdown;