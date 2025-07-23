import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import NavBar from '../components/Common/NavBar';

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const { isAuthenticated, user } = useAuth();
    const { getCartItemsCount } = useCart();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para subida de comprobante
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    if (user?.role === 'Admin') {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <NavBar />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h2>
                        <p className="text-gray-600 mb-6">
                            Los administradores no pueden ver confirmaciones de cliente.
                        </p>
                        <p className="text-gray-500 mb-6">
                            Para ver detalles de órdenes, utiliza el panel de administración.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Link
                                to="/admin/orders"
                                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                            >
                                Ir a Gestión de Órdenes
                            </Link>
                            <Link
                                to="/admin/dashboard"
                                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300"
                            >
                                Ir al Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const orderData = await orderService.getOrderById(orderId);
            setOrder(orderData);
        } catch (err) {
            setError(err.message || 'Error al cargar la orden');
            console.error('Error loading order:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validar archivo
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                setUploadError('Solo se permiten archivos JPG, PNG o PDF');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB
                setUploadError('El archivo no puede exceder 5MB');
                return;
            }
            
            setSelectedFile(file);
            setUploadError(null);
        }
    };

    const handleUploadReceipt = async () => {
        if (!selectedFile) {
            setUploadError('Por favor selecciona un archivo');
            return;
        }

        try {
            setUploadingReceipt(true);
            setUploadError(null);
            
            await orderService.uploadPaymentReceipt(orderId, selectedFile);
            setUploadSuccess(true);
            
            await loadOrder();
            
            // Limpiar archivo seleccionado
            setSelectedFile(null);
            
        } catch (err) {
            setUploadError(err.message || 'Error al subir el comprobante');
            console.error('Error uploading receipt:', err);
        } finally {
            setUploadingReceipt(false);
        }
    };

    const getProgressSteps = () => {
        const steps = [
            { key: 'pending_payment', label: 'Pedido creado', icon: '📋' },
            { key: 'payment_submitted', label: 'Comprobante enviado', icon: '📄' },
            { key: 'payment_approved', label: 'Pago aprobado', icon: '✅' },
            { key: 'shipped', label: 'Enviado', icon: '🚚' },
            { key: 'delivered', label: 'Entregado', icon: '📦' }
        ];

        const currentIndex = steps.findIndex(step => step.key === order?.status);
        
        return steps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            current: index === currentIndex
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 pt-60">
                <NavBar />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Orden no encontrada</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Link
                            to="/"
                            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const progressSteps = getProgressSteps();

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <NavBar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Mensaje de confirmación */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h1 className="text-2xl font-bold text-green-800">¡Pedido confirmado!</h1>
                            <p className="text-green-700 mt-1">
                                Tu pedido #{order.id} ha sido procesado exitosamente.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progreso de la orden */}
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Estado de tu pedido</h2>
                    
                    <div className="flex items-center justify-between mb-6">
                        {progressSteps.map((step, index) => (
                            <div key={step.key} className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                                    step.completed 
                                        ? 'bg-green-100 text-green-600' 
                                        : step.current 
                                            ? 'bg-blue-100 text-blue-600' 
                                            : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {step.icon}
                                </div>
                                <div className="text-xs text-center mt-2 max-w-20">
                                    {step.label}
                                </div>
                                {index < progressSteps.length - 1 && (
                                    <div className={`absolute h-0.5 w-16 translate-x-8 ${
                                        step.completed ? 'bg-green-300' : 'bg-gray-200'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">{orderService.getStatusText(order.status)}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {orderService.getStatusDescription(order.status)}
                        </p>
                    </div>
                </div>

                {/* Sección de pago por transferencia */}
                {orderService.canUploadReceipt(order.status) && (
                    <div className="bg-white shadow rounded-lg p-6 mb-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            📄 Comprobante de pago
                        </h2>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-medium text-blue-800 mb-2">
                                Instrucciones para el pago:
                            </h3>
                            <div className="text-sm text-blue-700 space-y-1">
                                <p>• Realiza una transferencia bancaria por <strong>${orderService.formatPrice(order.total)}</strong></p>
                                <p>• Adjunta tu comprobante de pago (JPG, PNG o PDF)</p>
                                <p>• Una vez enviado, revisaremos tu comprobante en 24-48 horas</p>
                            </div>
                        </div>

                        {uploadSuccess && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-green-800">
                                        ¡Comprobante enviado exitosamente! Revisaremos tu pago pronto.
                                    </p>
                                </div>
                            </div>
                        )}

                        {uploadError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-red-800">{uploadError}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Seleccionar comprobante
                                </label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={handleFileSelect}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Formatos permitidos: JPG, PNG, PDF (máximo 5MB)
                                </p>
                            </div>

                            {selectedFile && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-sm text-gray-600">
                                        Archivo seleccionado: <span className="font-medium">{selectedFile.name}</span>
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleUploadReceipt}
                                disabled={!selectedFile || uploadingReceipt}
                                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {uploadingReceipt ? 'Subiendo...' : 'Enviar comprobante'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Información de tracking */}
                {order.status === 'shipped' && order.trackingNumber && (
                    <div className="bg-white shadow rounded-lg p-6 mb-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            🚚 Información de envío
                        </h2>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-sm text-purple-800">
                                <strong>Número de seguimiento:</strong> {order.trackingNumber}
                            </p>
                            {order.shippingProvider && (
                                <p className="text-sm text-purple-700 mt-1">
                                    <strong>Transportista:</strong> {order.shippingProvider}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Detalles de la orden */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">Detalles del pedido</h2>

                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Número de orden</dt>
                                <dd className="text-lg font-semibold text-gray-900">#{order.id}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Fecha</dt>
                                <dd className="text-sm text-gray-900">{orderService.formatDate(order.createdAt)}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Total</dt>
                                <dd className="text-xl font-bold text-gray-900">${orderService.formatPrice(order.total)}</dd>
                            </div>

                            {order.adminNotes && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Notas</dt>
                                    <dd className="text-sm text-gray-900">{order.adminNotes}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Datos del cliente */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">Datos de contacto</h2>

                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                                <dd className="text-sm text-gray-900">{order.customerName}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="text-sm text-gray-900">{order.customerEmail}</dd>
                            </div>

                            {order.customerPhone && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                                    <dd className="text-sm text-gray-900">{order.customerPhone}</dd>
                                </div>
                            )}

                            {order.customerAddress && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                                    <dd className="text-sm text-gray-900">{order.customerAddress}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                {/* Productos ordenados */}
                <div className="bg-white shadow rounded-lg p-6 mt-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Productos ordenados</h2>

                    <div className="space-y-4">
                        {order.orderItems.map((item) => (
                            <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                                <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                                    <img
                                        src={productService.getImageUrl(item.productImageUrl)}
                                        alt={item.productName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://picsum.photos/64/64?random=' + item.productId;
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-gray-900">{item.productName}</h3>
                                    <p className="text-sm text-gray-500">
                                        ${orderService.formatPrice(item.unitPrice)} × {item.quantity}
                                    </p>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                    ${orderService.formatPrice(item.subtotal)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-6">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-medium text-gray-900">Total</span>
                            <span className="text-xl font-bold text-gray-900">
                                ${orderService.formatPrice(order.total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Link
                        to="/"
                        className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-md text-center font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Continuar comprando
                    </Link>

                    {isAuthenticated && (
                        <Link
                            to="/my-orders"
                            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-md text-center font-medium hover:bg-gray-300 transition-colors"
                        >
                            Ver mis compras
                        </Link>
                    )}
                </div>
            </main>
        </div>
    );
};

export default OrderConfirmation;