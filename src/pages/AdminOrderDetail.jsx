import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import NavBar from '../components/Common/NavBar';

const AdminOrderDetail = () => {
    const { orderId } = useParams();
    const { isAuthenticated, user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Verifica que sea admin
    if (!isAuthenticated || user?.role !== 'Admin') {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavBar />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
                        <p className="text-gray-600 mb-6">Solo los administradores pueden acceder a esta página</p>
                        <Link to="/" className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700">
                            Volver al Inicio
                        </Link>
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

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <NavBar />
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <NavBar />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Orden no encontrada</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Link to="/admin/orders" className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700">
                            Volver a órdenes
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <NavBar />

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Orden #{order.id}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Detalles completos de la orden
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
                                {orderService.getStatusText(order.status)}
                            </span>
                            <button onClick={handlePrint} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                <span>Imprimir</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Información general */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Información General</h2>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">ID de Orden</dt>
                                <dd className="text-sm text-gray-900 font-mono">#{order.id}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Fecha de Creación</dt>
                                <dd className="text-sm text-gray-900">{orderService.formatDate(order.createdAt)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Estado</dt>
                                <dd className={`text-sm font-medium ${orderService.getStatusColor(order.status)}`}>
                                    {orderService.getStatusText(order.status)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Total de Artículos</dt>
                                <dd className="text-sm text-gray-900">{order.itemsCount} productos</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Total</dt>
                                <dd className="text-lg font-bold text-gray-900">${orderService.formatPrice(order.total)}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Información del cliente */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Datos del Cliente</h2>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
                                <dd className="text-sm text-gray-900">{order.customerName}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="text-sm text-gray-900">
                                    <a href={`mailto:${order.customerEmail}`} className="text-indigo-600 hover:text-indigo-800">
                                        {order.customerEmail}
                                    </a>
                                </dd>
                            </div>
                            {order.customerPhone && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                                    <dd className="text-sm text-gray-900">
                                        <a href={`tel:${order.customerPhone}`} className="text-indigo-600 hover:text-indigo-800">
                                            {order.customerPhone}
                                        </a>
                                    </dd>
                                </div>
                            )}
                            {order.customerAddress && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                                    <dd className="text-sm text-gray-900">{order.customerAddress}</dd>
                                </div>
                            )}
                            {order.userId && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">ID Usuario</dt>
                                    <dd className="text-sm text-gray-900 font-mono">#{order.userId}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Estadísticas rápidas */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen</h2>
                        <div className="space-y-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-blue-600">
                                    ${orderService.formatPrice(order.total)}
                                </div>
                                <div className="text-sm text-blue-800">Valor Total</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-green-600">
                                    {order.itemsCount}
                                </div>
                                <div className="text-sm text-green-800">Productos</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-purple-600">
                                    {order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                                </div>
                                <div className="text-sm text-purple-800">Unidades</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Productos de la orden */}
                <div className="bg-white shadow rounded-lg p-6 mt-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Productos de la Orden</h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Producto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Precio Unit.
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cantidad
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {order.orderItems?.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    <img
                                                        src={productService.getImageUrl(item.productImageUrl)}
                                                        alt={item.productName}
                                                        className="h-12 w-12 rounded-lg object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://picsum.photos/48/48?random=' + item.productId;
                                                        }}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.productName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {item.productId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${orderService.formatPrice(item.unitPrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ${orderService.formatPrice(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-200 pt-4 mt-6">
                        <div className="flex justify-end">
                            <div className="text-right">
                                <div className="text-lg font-medium text-gray-900">
                                    Total: <span className="font-bold">${orderService.formatPrice(order.total)}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {order.orderItems?.reduce((sum, item) => sum + item.quantity, 0)} unidades
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex justify-between items-center mt-8">
                    <Link to="/admin/orders"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        ← Volver a órdenes
                    </Link>

                    <div className="flex space-x-3">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center px-4 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimir orden
                        </button>

                        <a href={`mailto:${order.customerEmail}?subject=Orden %23${order.id} - TiendaNova`}
                            className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.73a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contactar cliente
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminOrderDetail;