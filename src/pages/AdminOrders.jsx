
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import NavBar from '../components/Common/NavBar';

const AdminOrders = () => {
    const { isAuthenticated, user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');
    const [processingOrder, setProcessingOrder] = useState(null);
    const [actionModal, setActionModal] = useState({ show: false, order: null, action: null });
    const [adminNotes, setAdminNotes] = useState('');

    // Verificar que sea admin
    if (!isAuthenticated || user?.role !== 'Admin') {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavBar />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center px-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
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
        loadAllOrders();
    }, []);

    useEffect(() => {
        filterAndSortOrders();
    }, [orders, selectedStatus, sortBy, searchTerm]);

    const loadAllOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const orderData = await orderService.getAllOrders();
            setOrders(orderData);
        } catch (err) {
            setError(err.message || 'Error al cargar las órdenes');
            console.error('Error loading orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortOrders = () => {
        let filtered = [...orders];

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(order => order.status === selectedStatus);
        }

        if (searchTerm.trim()) {
            filtered = filtered.filter(order =>
                order.id.toString().includes(searchTerm) ||
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'amount-high':
                filtered.sort((a, b) => b.total - a.total);
                break;
            case 'amount-low':
                filtered.sort((a, b) => a.total - b.total);
                break;
            default:
                break;
        }

        setFilteredOrders(filtered);
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const handlePaymentAction = (order, action) => {
        setActionModal({ show: true, order, action });
        setAdminNotes('');
    };

    const confirmPaymentAction = async () => {
        if (!actionModal.order || !actionModal.action) return;

        try {
            setProcessingOrder(actionModal.order.id);

            if (actionModal.action === 'approve') {
                await orderService.approvePayment(actionModal.order.id, adminNotes);
            } else if (actionModal.action === 'reject') {
                if (!adminNotes.trim()) {
                    alert('Las notas son requeridas para rechazar un pago');
                    return;
                }
                await orderService.rejectPayment(actionModal.order.id, adminNotes);
            }

            await loadAllOrders();
            setActionModal({ show: false, order: null, action: null });
            setAdminNotes('');

        } catch (err) {
            console.error('Error processing payment:', err);
            alert('Error: ' + err.message);
        } finally {
            setProcessingOrder(null);
        }
    };

    const getStatusBadgeColor = (status) => {
        const colors = {
            'pending_payment': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'payment_submitted': 'bg-blue-100 text-blue-800 border-blue-200',
            'payment_approved': 'bg-green-100 text-green-800 border-green-200',
            'payment_rejected': 'bg-red-100 text-red-800 border-red-200',
            'shipped': 'bg-purple-100 text-purple-800 border-purple-200',
            'delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'cancelled': 'bg-red-100 text-red-800 border-red-200',
            'completed': 'bg-green-100 text-green-800 border-green-200',
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getOrderStats = () => {
        const totalOrders = orders.length;
        const pendingPayments = orders.filter(o => o.status === 'payment_submitted').length;
        const approvedPayments = orders.filter(o => ['payment_approved', 'shipped', 'delivered'].includes(o.status)).length;
        const rejectedPayments = orders.filter(o => o.status === 'payment_rejected').length;
        const totalRevenue = orders
            .filter(o => ['payment_approved', 'shipped', 'delivered'].includes(o.status))
            .reduce((sum, o) => sum + o.total, 0);

        return { totalOrders, pendingPayments, approvedPayments, rejectedPayments, totalRevenue };
    };

    const getUniqueStatuses = () => {
        const statusCounts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(statusCounts).map(status => ({
            status,
            count: statusCounts[status],
            label: orderService.getStatusText(status)
        }));
    };

    const stats = getOrderStats();
    const uniqueStatuses = getUniqueStatuses();

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <NavBar />

            <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                {/* Header - Mobile responsive */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Órdenes</h1>
                            <p className="text-gray-600 mt-2 text-sm sm:text-base">Administra todas las órdenes y pagos del sistema</p>
                        </div>
                        <Link
                            to="/admin/orders/pending-review"
                            className="bg-yellow-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-yellow-600 font-medium flex items-center justify-center sm:justify-start space-x-2 text-sm sm:text-base"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Revisar Pagos ({stats.pendingPayments})</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards - Mobile responsive */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                        <div className="text-lg sm:text-2xl font-bold text-indigo-600">{stats.totalOrders}</div>
                        <div className="text-xs sm:text-sm text-gray-500">Total Órdenes</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                        <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pendingPayments}</div>
                        <div className="text-xs sm:text-sm text-gray-500">Pagos Pendientes</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                        <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.approvedPayments}</div>
                        <div className="text-xs sm:text-sm text-gray-500">Pagos Aprobados</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 sm:p-6">
                        <div className="text-lg sm:text-2xl font-bold text-red-600">{stats.rejectedPayments}</div>
                        <div className="text-xs sm:text-sm text-gray-500">Pagos Rechazados</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-3 sm:p-6 col-span-2 sm:col-span-1">
                        <div className="text-lg sm:text-2xl font-bold text-blue-600">${stats.totalRevenue.toFixed(2)}</div>
                        <div className="text-xs sm:text-sm text-gray-500">Ingresos Totales</div>
                    </div>
                </div>

                {/* Filtros - Mobile responsive */}
                <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar orden</label>
                            <input
                                type="text"
                                placeholder="ID, nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por estado</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                                <option value="all">Todas ({orders.length})</option>
                                {uniqueStatuses.map(({ status, count, label }) => (
                                    <option key={status} value={status}>
                                        {label} ({count})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                                <option value="newest">Más recientes</option>
                                <option value="oldest">Más antiguas</option>
                                <option value="amount-high">Mayor monto</option>
                                <option value="amount-low">Menor monto</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 mb-6">
                        <div className="flex">
                            <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                                <button
                                    onClick={loadAllOrders}
                                    className="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
                                >
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de órdenes - Mobile responsive */}
                {!loading && !error && (
                    <>
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-16 sm:h-24 w-16 sm:w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <h3 className="mt-4 text-lg font-medium text-gray-900">No se encontraron órdenes</h3>
                                <p className="mt-2 text-gray-500 text-sm sm:text-base">
                                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay órdenes con los filtros seleccionados'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 sm:space-y-6">
                                {filteredOrders.map((order) => (
                                    <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Header de la orden - Mobile responsive */}
                                        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                    <h3 className="text-base sm:text-lg font-medium text-gray-900">
                                                        Orden #{order.id}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(order.status)} self-start`}>
                                                        {orderService.getStatusText(order.status)}
                                                    </span>

                                                    {/* Acciones rápidas de pago - Mobile responsive */}
                                                    {order.status === 'payment_submitted' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handlePaymentAction(order, 'approve')}
                                                                disabled={processingOrder === order.id}
                                                                className="inline-flex items-center px-2 py-1 border border-green-300 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100"
                                                            >
                                                                ✅ Aprobar
                                                            </button>
                                                            <button
                                                                onClick={() => handlePaymentAction(order, 'reject')}
                                                                disabled={processingOrder === order.id}
                                                                className="inline-flex items-center px-2 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100"
                                                            >
                                                                ❌ Rechazar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-4">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        ${orderService.formatPrice(order.total)}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleOrderDetails(order.id)}
                                                        className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors text-sm"
                                                    >
                                                        {expandedOrder === order.id ? 'Ocultar' : 'Ver detalles'}
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Info básica - Mobile responsive */}
                                            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                                    <span>{orderService.formatDate(order.createdAt)}</span>
                                                    <span className="truncate">{order.customerName}</span>
                                                    <span className="truncate text-xs">{order.customerEmail}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>{order.orderItems?.length || 0} artículos</span>
                                                    {order.paymentReceiptUrl && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                                            📄 Comprobante
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Descripción del estado */}
                                            {orderService.getStatusDescription && orderService.getStatusDescription(order.status) && (
                                                <div className="mt-2 text-xs sm:text-sm text-gray-600">
                                                    {orderService.getStatusDescription(order.status)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Detalles expandibles - Mobile responsive */}
                                        {expandedOrder === order.id && (
                                            <div className="px-3 sm:px-6 py-4 bg-gray-50">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Información del cliente */}
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Información del cliente</h4>
                                                        <dl className="space-y-2 text-sm">
                                                            <div>
                                                                <dt className="font-medium text-gray-500">Nombre:</dt>
                                                                <dd className="text-gray-900 break-words">{order.customerName}</dd>
                                                            </div>
                                                            <div>
                                                                <dt className="font-medium text-gray-500">Email:</dt>
                                                                <dd className="text-gray-900 break-all">{order.customerEmail}</dd>
                                                            </div>
                                                            {order.customerPhone && (
                                                                <div>
                                                                    <dt className="font-medium text-gray-500">Teléfono:</dt>
                                                                    <dd className="text-gray-900">{order.customerPhone}</dd>
                                                                </div>
                                                            )}
                                                            {order.customerAddress && (
                                                                <div>
                                                                    <dt className="font-medium text-gray-500">Dirección:</dt>
                                                                    <dd className="text-gray-900 break-words">{order.customerAddress}</dd>
                                                                </div>
                                                            )}
                                                        </dl>
                                                    </div>

                                                    {/* Acciones y estado de pago */}
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Acciones y Estado</h4>
                                                        <div className="space-y-3">
                                                            {/* Información de pago */}
                                                            {order.paymentReceiptUrl && (
                                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-sm font-medium text-blue-800">
                                                                            📄 Comprobante de pago
                                                                        </span>
                                                                        <a
                                                                            href={order.paymentReceiptUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 bg-white rounded border border-blue-200"
                                                                        >
                                                                            👁️ Ver comprobante
                                                                        </a>
                                                                    </div>
                                                                    {order.paymentReceiptUploadedAt && (
                                                                        <p className="text-xs text-blue-600">
                                                                            Subido: {orderService.formatDate(order.paymentReceiptUploadedAt)}
                                                                        </p>
                                                                    )}

                                                                    <div className="mt-2 text-xs text-gray-500">
                                                                        {order.paymentReceiptUrl.includes('.pdf') ? (
                                                                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700">
                                                                                📄 Archivo PDF
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                                                🖼️ Imagen
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Tracking info */}
                                                            {order.trackingNumber && (
                                                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                                    <p className="text-sm font-medium text-purple-800">
                                                                        🚚 Tracking: {order.trackingNumber}
                                                                    </p>
                                                                    {order.shippingProvider && (
                                                                        <p className="text-xs text-purple-600">
                                                                            {order.shippingProvider}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Admin notes */}
                                                            {order.adminNotes && (
                                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                                    <p className="text-sm font-medium text-gray-800">
                                                                        📝 Notas del admin:
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 mt-1 break-words">
                                                                        {order.adminNotes}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Botones de acción - Mobile responsive */}
                                                            <div className="flex flex-col sm:flex-row gap-2">
                                                                <Link
                                                                    to={`/admin/order/${order.id}`}
                                                                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                                >
                                                                    Ver completa
                                                                </Link>

                                                                {order.status === 'payment_submitted' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handlePaymentAction(order, 'approve')}
                                                                            disabled={processingOrder === order.id}
                                                                            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                                                                        >
                                                                            ✅ Aprobar
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handlePaymentAction(order, 'reject')}
                                                                            disabled={processingOrder === order.id}
                                                                            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                                                                        >
                                                                            ❌ Rechazar
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Resumen de productos - Mobile responsive */}
                                                <div className="mt-6">
                                                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                                                        Productos ({order.orderItems?.length || 0})
                                                    </h4>
                                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                        <div className="max-h-60 overflow-y-auto">
                                                            {order.orderItems?.map((item) => (
                                                                <div key={item.id} className="px-3 sm:px-4 py-3 border-b border-gray-100 last:border-b-0 flex justify-between items-center">
                                                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                                        <img
                                                                            src={item.productImageUrl || '/placeholder-image.jpg'}
                                                                            alt={item.productName}
                                                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                                                                        />
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="text-sm font-medium text-gray-900 truncate">{item.productName}</div>
                                                                            <div className="text-xs sm:text-sm text-gray-500">
                                                                                ${orderService.formatPrice(item.unitPrice)} × {item.quantity}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-sm font-medium text-gray-900 ml-2">
                                                                        ${orderService.formatPrice(item.subtotal)}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="px-3 sm:px-4 py-3 bg-gray-50 border-t border-gray-200">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm font-medium text-gray-900">Total:</span>
                                                                <span className="text-lg font-bold text-gray-900">
                                                                    ${orderService.formatPrice(order.total)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Modal de confirmación para acciones de pago - Mobile responsive */}
                {actionModal.show && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
                        <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {actionModal.action === 'approve' ? 'Aprobar' : 'Rechazar'} Pago
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Orden #{actionModal.order?.id} - ${actionModal.order?.total.toFixed(2)}
                                </p>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notas del administrador {actionModal.action === 'reject' ? '(requeridas)' : '(opcionales)'}
                                    </label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder={
                                            actionModal.action === 'approve'
                                                ? 'Ej: Pago verificado correctamente'
                                                : 'Ej: Comprobante ilegible, por favor enviar nuevo comprobante'
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => setActionModal({ show: false, order: null, action: null })}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmPaymentAction}
                                        disabled={processingOrder}
                                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-white ${actionModal.action === 'approve'
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : 'bg-red-600 hover:bg-red-700'
                                            } disabled:opacity-50`}
                                    >
                                        {processingOrder ? 'Procesando...' :
                                            actionModal.action === 'approve' ? 'Aprobar Pago' : 'Rechazar Pago'
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botón volver - Mobile responsive */}
                <div className="mt-8 text-center">
                    <Link
                        to="/admin/dashboard"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 hover:text-indigo-800"
                    >
                        ← Volver al Dashboard
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default AdminOrders;