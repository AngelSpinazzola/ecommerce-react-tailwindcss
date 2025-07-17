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

    // Verificar que sea admin
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

        // Filtra por estado
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(order => order.status === selectedStatus);
        }

        // Filtra por búsqueda
        if (searchTerm.trim()) {
            filtered = filtered.filter(order =>
                order.id.toString().includes(searchTerm) ||
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Ordena
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

    const getOrderStats = () => {
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
        const totalRevenue = orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + o.total, 0);

        return { totalOrders, pendingOrders, completedOrders, cancelledOrders, totalRevenue };
    };

    const stats = getOrderStats();

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <NavBar />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Órdenes</h1>
                    <p className="text-gray-600 mt-2">Visualiza y analiza todas las órdenes del sistema</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-2xl font-bold text-indigo-600">{stats.totalOrders}</div>
                        <div className="text-sm text-gray-500">Total Órdenes</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
                        <div className="text-sm text-gray-500">Completadas</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-2xl font-bold text-red-600">{stats.cancelledOrders}</div>
                        <div className="text-sm text-gray-500">Canceladas</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-2xl font-bold text-blue-600">${stats.totalRevenue.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Ingresos Totales</div>
                    </div>
                </div>

                {/* Filtros y Búsqueda */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Búsqueda */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Buscar orden
                            </label>
                            <input
                                type="text"
                                placeholder="ID, nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Filtro por estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filtrar por estado
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="all">Todas ({orders.length})</option>
                                <option value="completed">Completadas ({orders.filter(o => o.status === 'completed').length})</option>
                                <option value="cancelled">Canceladas ({orders.filter(o => o.status === 'cancelled').length})</option>
                            </select>
                        </div>

                        {/* Ordenar */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ordenar por
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                        <div className="flex">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
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

                {/* Lista de órdenes */}
                {!loading && !error && (
                    <>
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <h3 className="mt-4 text-lg font-medium text-gray-900">No se encontraron órdenes</h3>
                                <p className="mt-2 text-gray-500">
                                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay órdenes con los filtros seleccionados'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredOrders.map((order) => (
                                    <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
                                        {/* Header de la orden */}
                                        <div className="px-6 py-4 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        Orden #{order.id}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                                                        {orderService.getStatusText(order.status)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        ${orderService.formatPrice(order.total)}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleOrderDetails(order.id)}
                                                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                                                    >
                                                        {expandedOrder === order.id ? 'Ocultar' : 'Ver detalles'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                                                <div className="flex items-center space-x-4">
                                                    <span>{orderService.formatDate(order.createdAt)}</span>
                                                    <span>{order.customerName}</span>
                                                    <span>{order.customerEmail}</span>
                                                </div>
                                                <span>{order.itemsCount} artículos</span>
                                            </div>
                                        </div>

                                        {/* Detalles expandibles */}
                                        {expandedOrder === order.id && (
                                            <div className="px-6 py-4 bg-gray-50">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Información del cliente */}
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Información del cliente</h4>
                                                        <dl className="space-y-2 text-sm">
                                                            <div>
                                                                <dt className="font-medium text-gray-500">Nombre:</dt>
                                                                <dd className="text-gray-900">{order.customerName}</dd>
                                                            </div>
                                                            <div>
                                                                <dt className="font-medium text-gray-500">Email:</dt>
                                                                <dd className="text-gray-900">{order.customerEmail}</dd>
                                                            </div>
                                                            <div>
                                                                <dt className="font-medium text-gray-500">Teléfono:</dt>
                                                                <dd className="text-gray-900">{order.customerPhone || 'No proporcionado'}</dd>
                                                            </div>
                                                            <div>
                                                                <dt className="font-medium text-gray-500">Dirección:</dt>
                                                                <dd className="text-gray-900">{order.customerAddress || 'No proporcionado'}</dd>
                                                            </div>
                                                            <div>
                                                                <dt className="font-medium text-gray-500">Fecha de orden:</dt>
                                                                <dd className="text-gray-900">{orderService.formatDate(order.createdAt)}</dd>
                                                            </div>
                                                        </dl>
                                                    </div>

                                                    {/* Acciones */}
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Acciones</h4>
                                                        <div className="space-y-3">
                                                            <div className="flex space-x-2">
                                                                <Link
                                                                    to={`/admin/order/${order.id}`}  
                                                                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                                >
                                                                    Ver orden completa
                                                                </Link>
                                                                <Link
                                                                    to={`/invoice/${order.id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-indigo-300 shadow-sm text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                                                                >
                                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                                    </svg>
                                                                    Factura
                                                                </Link>
                                                            </div>
                                                            <div>
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    Estado: {orderService.getStatusText(order.status)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Resumen de productos */}
                                                <div className="mt-6">
                                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Productos ({order.itemsCount})</h4>
                                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                        <div className="max-h-60 overflow-y-auto">
                                                            {order.items && order.items.map((item, index) => (
                                                                <div key={index} className="px-4 py-3 border-b border-gray-100 last:border-b-0 flex justify-between items-center">
                                                                    <div className="flex items-center space-x-3">
                                                                        <img
                                                                            src={item.imageUrl || '/placeholder-image.jpg'}
                                                                            alt={item.name}
                                                                            className="w-12 h-12 rounded-lg object-cover"
                                                                        />
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                                            <div className="text-sm text-gray-500">
                                                                                ${orderService.formatPrice(item.price)} × {item.quantity}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        ${orderService.formatPrice(item.price * item.quantity)}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
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

                {/* Botón volver */}
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