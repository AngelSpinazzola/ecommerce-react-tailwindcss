import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';

const Invoice = () => {
    const { orderId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center print:hidden">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center print:hidden">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar la factura</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={handleBack}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Botones de acción - Solo visibles en pantalla, no en impresión */}
            <div className="print:hidden bg-gray-50 border-b border-gray-200 px-4 py-3">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        ← Volver
                    </button>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Imprimir Factura
                    </button>
                </div>
            </div>

            {/* Factura */}
            <div className="max-w-4xl mx-auto p-8 print:p-6">
                {/* Header de la empresa */}
                <div className="border-b-2 border-gray-300 pb-6 mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">🛒 TiendaNova</h1>
                            <p className="text-gray-600 mt-2">
                                Av. Corrientes 1234<br />
                                Buenos Aires, Argentina<br />
                                Tel: +54 11 4567-8900<br />
                                Email: info@tiendanova.com
                            </p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-900">FACTURA</h2>
                            <p className="text-gray-600 mt-2">
                                <strong>Número:</strong> #{order.id.toString().padStart(6, '0')}<br />
                                <strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString('es-AR')}<br />
                                <strong>Estado:</strong> {orderService.getStatusText(order.status)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Información del cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Facturar a:</h3>
                        <div className="text-gray-700">
                            <p className="font-medium">{order.customerName}</p>
                            <p>{order.customerEmail}</p>
                            {order.customerPhone && <p>{order.customerPhone}</p>}
                            {order.customerAddress && <p>{order.customerAddress}</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Detalles de la orden:</h3>
                        <div className="text-gray-700">
                            <p><strong>Orden ID:</strong> #{order.id}</p>
                            <p><strong>Fecha de orden:</strong> {orderService.formatDate(order.createdAt)}</p>
                            <p><strong>Total de artículos:</strong> {order.itemsCount}</p>
                            <p><strong>Estado:</strong> {orderService.getStatusText(order.status)}</p>
                        </div>
                    </div>
                </div>

                {/* Tabla de productos */}
                <div className="mb-8">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                                    Producto
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                                    Cantidad
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
                                    Precio Unit.
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
                                    Subtotal
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems?.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-3">
                                        <div className="flex items-center print:block">
                                            <img
                                                src={productService.getImageUrl(item.productImageUrl)}
                                                alt={item.productName}
                                                className="w-12 h-12 rounded object-cover mr-3 print:hidden"
                                                onError={(e) => {
                                                    e.target.src = 'https://picsum.photos/48/48?random=' + item.productId;
                                                }}
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">{item.productName}</p>
                                                <p className="text-sm text-gray-500">ID: {item.productId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center">
                                        {item.quantity}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-right">
                                        ${orderService.formatPrice(item.unitPrice)}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                                        ${orderService.formatPrice(item.subtotal)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totales */}
                <div className="flex justify-end mb-8">
                    <div className="w-full max-w-xs">
                        <div className="border border-gray-300">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">Subtotal:</span>
                                    <span className="font-medium text-gray-900">
                                        ${orderService.formatPrice(order.total)}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">IVA (21%):</span>
                                    <span className="font-medium text-gray-900">
                                        ${orderService.formatPrice(order.total * 0.21)}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-indigo-50 px-4 py-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Total:</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        ${orderService.formatPrice(order.total * 1.21)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información adicional */}
                <div className="border-t border-gray-300 pt-6 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Método de pago:</h3>
                            <p className="text-gray-700">
                                {order.status === 'completed' ? 'Pagado' : 'Pendiente de pago'}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Términos y condiciones:</h3>
                            <p className="text-sm text-gray-600">
                                • Los productos pueden ser devueltos dentro de 30 días<br />
                                • La garantía es de 12 meses para productos electrónicos<br />
                                • Para consultas, contactar a info@tiendanova.com
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-300 pt-6 mt-8 text-center text-sm text-gray-600">
                    <p>
                        <strong>TiendaNova</strong> - CUIT: 20-12345678-9<br />
                        Esta factura fue generada automáticamente el {new Date().toLocaleDateString('es-AR')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Invoice;