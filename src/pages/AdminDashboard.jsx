import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import NavBar from '../components/Common/NavBar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { getCartItemsCount } = useCart();
    const [stats, setStats] = useState({
        // Stats de productos (existentes)
        totalProducts: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        totalCategories: 0,
        categoryDistribution: [],
        stockAnalysis: [],
        recentProducts: [],
        // Stats de órdenes y pagos (nuevos)
        totalOrders: 0,
        pendingPayments: 0,
        pendingShipments: 0,
        totalRevenue: 0,
        recentOrders: [],
        paymentStats: {
            approved: 0,
            rejected: 0,
            pending: 0
        }
    });
    const [loading, setLoading] = useState(true);

    // Verificar que sea admin
    if (!isAuthenticated || user?.role !== 'Admin') {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
                        <p className="text-gray-600 mb-6">Solo los administradores pueden acceder a esta página</p>
                        <Link
                            to="/"
                            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                        >
                            Volver al Inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Cargar datos de productos (existente)
            const [productsResponse, categories] = await Promise.all([
                productService.getAllProducts(),
                productService.getCategories()
            ]);

            console.log('🔍 AdminDashboard - Products response:', productsResponse);
            console.log('🔍 AdminDashboard - Categories response:', categories);

            // ✅ CORREGIDO: Extraer array de productos si viene paginado
            let products;
            if (productsResponse?.data && Array.isArray(productsResponse.data)) {
                // Si viene con formato { data: [...], pagination: {...} }
                products = productsResponse.data;
            } else if (Array.isArray(productsResponse)) {
                // Si viene como array directo
                products = productsResponse;
            } else {
                console.error('❌ Unexpected products format:', productsResponse);
                products = [];
            }

            // ✅ Asegurar que categories es un array
            const categoriesData = Array.isArray(categories) ? categories : [];

            console.log('✅ AdminDashboard - Processed data:', {
                products: products.length,
                categories: categoriesData.length
            });

            // Cargar datos de órdenes y pagos (nuevo)
            const [allOrders, pendingOrders] = await Promise.all([
                orderService.getAllOrders().catch(() => []),
                orderService.getOrdersPendingReview().catch(() => [])
            ]);

            console.log('🔍 AdminDashboard - Orders data:', {
                allOrders: allOrders.length,
                pendingOrders: pendingOrders.length
            });

            // ✅ Asegurar que orders son arrays
            const ordersData = Array.isArray(allOrders) ? allOrders : [];
            const pendingOrdersData = Array.isArray(pendingOrders) ? pendingOrders : [];

            // Calcular estadísticas de productos (existente)
            const totalProducts = products.length;
            const activeProducts = products.filter(p => p.isActive).length;
            const lowStockProducts = products.filter(p => p.stock <= 5).length;

            // Distribución por categorías (existente)
            const categoryDistribution = categoriesData.map(category => {
                const count = products.filter(p => p.category === category).length;
                return {
                    name: category,
                    value: count,
                    percentage: totalProducts > 0 ? ((count / totalProducts) * 100).toFixed(1) : '0'
                };
            });

            // Análisis de stock (existente)
            const stockAnalysis = products
                .filter(p => p.stock <= 10)
                .sort((a, b) => a.stock - b.stock)
                .slice(0, 10)
                .map(p => ({
                    name: p.name && p.name.length > 15 ? p.name.substring(0, 15) + '...' : (p.name || 'Sin nombre'),
                    stock: p.stock || 0
                }));

            // Productos recientes (existente)
            const recentProducts = products
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, 5);

            // Calcular métricas de órdenes y pagos (nuevo)
            const totalRevenue = ordersData
                .filter(o => ['payment_approved', 'shipped', 'delivered'].includes(o.status))
                .reduce((sum, order) => sum + (order.total || 0), 0);

            const paymentStats = {
                approved: ordersData.filter(o => ['payment_approved', 'shipped', 'delivered'].includes(o.status)).length,
                rejected: ordersData.filter(o => o.status === 'payment_rejected').length,
                pending: ordersData.filter(o => o.status === 'payment_submitted').length
            };

            const recentOrders = ordersData
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, 5);

            setStats({
                // Productos
                totalProducts,
                activeProducts,
                lowStockProducts,
                totalCategories: categoriesData.length,
                categoryDistribution,
                stockAnalysis,
                recentProducts,
                // Órdenes y pagos
                totalOrders: ordersData.length,
                pendingPayments: pendingOrdersData.length,
                pendingShipments: ordersData.filter(o => o.status === 'payment_approved').length,
                totalRevenue,
                recentOrders,
                paymentStats
            });

            console.log(' AdminDashboard - Stats calculated successfully');

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Establecer valores por defecto en caso de error
            setStats({
                totalProducts: 0,
                activeProducts: 0,
                lowStockProducts: 0,
                totalCategories: 0,
                categoryDistribution: [],
                stockAnalysis: [],
                recentProducts: [],
                totalOrders: 0,
                pendingPayments: 0,
                pendingShipments: 0,
                totalRevenue: 0,
                recentOrders: [],
                paymentStats: {
                    approved: 0,
                    rejected: 0,
                    pending: 0
                }
            });
        } finally {
            setLoading(false);
        }
    };

    // Colores para gráficos
    const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

    const StatCard = ({ title, value, subtitle, icon, color = 'indigo', onClick, isClickable = false }) => (
        <div
            className={`bg-white rounded-lg shadow-md p-6 transition-all ${isClickable ? 'hover:shadow-lg cursor-pointer transform hover:scale-105' : 'hover:shadow-lg'
                }`}
            onClick={onClick}
        >
            <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-md bg-${color}-100`}>
                    {icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd className="flex items-baseline">
                            <div className={`text-2xl font-bold text-${color}-600`}>
                                {value}
                            </div>
                        </dd>
                        {subtitle && (
                            <dd className="text-sm text-gray-500 mt-1">{subtitle}</dd>
                        )}
                    </dl>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <NavBar />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
                    <p className="text-gray-600 mt-2">Resumen general de tu tienda gaming</p>
                </div>

                {/* Quick Actions para Pagos */}
                {stats.pendingPayments > 0 && (
                    <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex">
                                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">
                                        Tienes {stats.pendingPayments} {stats.pendingPayments === 1 ? 'pago pendiente' : 'pagos pendientes'} de revisión
                                    </p>
                                    <p className="text-sm text-yellow-700">
                                        Los clientes están esperando la aprobación de sus comprobantes
                                    </p>
                                </div>
                            </div>
                            <Link
                                to="/admin/orders/pending-review"
                                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 font-medium text-sm"
                            >
                                Revisar Pagos
                            </Link>
                        </div>
                    </div>
                )}

                {/* Stats Cards - Combinando productos y pagos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Pagos pendientes */}
                    <StatCard
                        title="Pagos por Revisar"
                        value={stats.pendingPayments}
                        subtitle="comprobantes enviados"
                        color="yellow"
                        isClickable={true}
                        onClick={() => window.location.href = '/admin/orders/pending-review'}
                        icon={
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                    />

                    {/* Total órdenes */}
                    <StatCard
                        title="Total Órdenes"
                        value={stats.totalOrders}
                        subtitle={`${stats.paymentStats.approved} aprobadas`}
                        color="indigo"
                        isClickable={true}
                        onClick={() => window.location.href = '/admin/orders'}
                        icon={
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        }
                    />

                    {/* Ingresos totales */}
                    <StatCard
                        title="Ingresos Totales"
                        value={`$${stats.totalRevenue.toFixed(0)}`}
                        subtitle="de ventas aprobadas"
                        color="green"
                        icon={
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    {/* Stock bajo */}
                    <StatCard
                        title="Stock Bajo"
                        value={stats.lowStockProducts}
                        subtitle="≤ 5 unidades"
                        color="red"
                        isClickable={true}
                        onClick={() => window.location.href = '/admin/products?filter=low-stock'}
                        icon={
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        }
                    />
                </div>

                {/* Payment Statistics y Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Payment Statistics */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Pagos</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                    <span className="text-sm font-medium text-gray-700">Aprobados</span>
                                </div>
                                <span className="text-lg font-bold text-green-700">{stats.paymentStats.approved}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                                    <span className="text-sm font-medium text-gray-700">Pendientes</span>
                                </div>
                                <span className="text-lg font-bold text-yellow-700">{stats.paymentStats.pending}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                                    <span className="text-sm font-medium text-gray-700">Rechazados</span>
                                </div>
                                <span className="text-lg font-bold text-red-700">{stats.paymentStats.rejected}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <Link
                                to="/admin/orders/pending-review"
                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-medium text-sm text-center block"
                            >
                                Gestionar Pagos
                            </Link>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Órdenes Recientes</h3>
                            <Link
                                to="/admin/orders"
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                                Ver todas →
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {stats.recentOrders.length > 0 ? (
                                stats.recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-900">#{order.id}</p>
                                            <p className="text-sm text-gray-500">{order.customerName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${orderService.getStatusColor(order.status)}`}>
                                                {orderService.getStatusText(order.status)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No hay órdenes recientes</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Charts - Manteniendo los existentes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Distribución por categorías */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Categorías</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.categoryDistribution}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                                >
                                    {stats.categoryDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Stock crítico */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos con Stock Bajo</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.stockAnalysis}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="stock" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions - Actualizadas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link to="/admin/orders/pending-review" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all group text-left block">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="w-8 h-8 text-yellow-600 group-hover:text-yellow-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900 group-hover:text-yellow-600">
                                    Revisar Pagos
                                </h3>
                                <p className="text-sm text-gray-500">Aprobar o rechazar comprobantes</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/products" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all group text-left block">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="w-8 h-8 text-indigo-600 group-hover:text-indigo-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                                    Gestionar Productos
                                </h3>
                                <p className="text-sm text-gray-500">Crear, editar y eliminar productos</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/orders" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all group text-left block">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="w-8 h-8 text-green-600 group-hover:text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600">
                                    Gestionar Órdenes
                                </h3>
                                <p className="text-sm text-gray-500">Ver y administrar todas las órdenes</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;