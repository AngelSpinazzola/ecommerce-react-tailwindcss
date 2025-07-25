import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import NavBar from '../components/Common/NavBar';
import AddressDropdown from '../components/AddressDropdown';

const Checkout = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { cartItems, getCartTotal, getCartItemsCount, clearCart } = useCart();

    const [customerData, setCustomerData] = useState({
        name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
        email: user?.email || '',
        phone: ''
    });

    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Redirigir si el carrito está vacío
    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpia error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleAddressSelect = (addressId) => {
        setSelectedAddressId(addressId);
        // Limpiar error de dirección si existe
        if (errors.address) {
            setErrors(prev => ({
                ...prev,
                address: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // 1. Valida datos del cliente
            const validation = orderService.validateCustomerData(customerData);
            if (!validation.isValid) {
                setErrors(validation.errors);
            }

            // 2. Valida que haya dirección seleccionada
            if (!selectedAddressId) {
                setErrors(prev => ({
                    ...prev,
                    address: 'Debes seleccionar una dirección de envío'
                }));
            }

            // Si hay errores, no continuar
            if (!validation.isValid || !selectedAddressId) {
                setLoading(false);
                return;
            }

            // 3. Valida carrito
            const cartValidation = orderService.validateCart(cartItems);
            if (!cartValidation.isValid) {
                alert(cartValidation.message);
                setLoading(false);
                return;
            }

            // 4. Crea la orden con la dirección seleccionada
            const orderData = orderService.formatOrderData(cartItems, customerData, selectedAddressId);
            const createdOrder = await orderService.createOrder(orderData);

            // 5. Limpia carrito
            clearCart();

            // 6. Redirigir a página de confirmación
            navigate(`/order-confirmation/${createdOrder.id}`);

        } catch (error) {
            console.error('Error en checkout:', error);
            alert(error.message || 'Error al procesar la orden');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return null;
    }

    if (user?.role === 'Admin') {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavBar />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h2>
                        <p className="text-gray-600 mb-6">Los administradores no pueden realizar compras</p>
                        <Link
                            to="/admin/dashboard"
                            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                        >
                            Ir al Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <NavBar />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
                    <p className="text-gray-600 mt-2">Completa tus datos para procesar el pedido</p>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                    {/* Formulario de datos del cliente */}
                    <div className="lg:col-span-7">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-6">Datos de contacto</h2>

                            <div className="space-y-6">
                                {/* Nombre */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Nombre completo *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={customerData.name}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.name ? 'border-red-500' : ''
                                            }`}
                                        placeholder="Tu nombre completo"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={customerData.email}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.email ? 'border-red-500' : ''
                                            }`}
                                        placeholder="tu@email.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Teléfono */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={customerData.phone}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.phone ? 'border-red-500' : ''
                                            }`}
                                        placeholder="+54 11 1234-5678"
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>

                                {/* Dropdown de Direcciones */}
                                <AddressDropdown 
                                    onAddressSelect={handleAddressSelect}
                                    selectedAddressId={selectedAddressId}
                                    error={errors.address}
                                />

                                {/* Botones */}
                                <div className="flex space-x-4 pt-4">
                                    <Link
                                        to="/cart"
                                        className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md text-center font-medium hover:bg-gray-300 transition-colors"
                                    >
                                        ← Volver al carrito
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Procesando...' : 'Confirmar Pedido'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resumen del pedido */}
                    <div className="mt-10 lg:mt-0 lg:col-span-5">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-6">Resumen del pedido</h2>

                            {/* Lista de productos */}
                            <div className="space-y-4 mb-6">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-4">
                                        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                                            <img
                                                src={productService.getImageUrl(item.mainImageUrl)}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://picsum.photos/64/64?random=' + item.id;
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                                            <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex justify-between items-center text-lg font-medium text-gray-900">
                                    <span>Total</span>
                                    <span>${getCartTotal().toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {getCartItemsCount()} artículos en total
                                </p>
                            </div>

                            {/* Nota de seguridad */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-md">
                                <div className="flex">
                                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h3 className="text-sm font-medium text-blue-800">Pago por transferencia</h3>
                                        <p className="text-sm text-blue-700">
                                            Después de confirmar el pedido podrás subir tu comprobante de pago.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;