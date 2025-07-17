import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import NavBar from '../components/Common/NavBar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { getCartItemsCount } = useCart();
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        totalCategories: 0,
        categoryDistribution: [],
        stockAnalysis: [],
        recentProducts: []
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

            // Carga datos reales
            const [products, categories] = await Promise.all([
                productService.getAllProducts(),
                productService.getCategories()
            ]);

            // Calcula estadísticas
            const totalProducts = products.length;
            const activeProducts = products.filter(p => p.isActive).length;
            const lowStockProducts = products.filter(p => p.stock <= 5).length;

            // Distribución por categorías
            const categoryDistribution = categories.map(category => {
                const count = products.filter(p => p.category === category).length;
                return {
                    name: category,
                    value: count,
                    percentage: ((count / totalProducts) * 100).toFixed(1)
                };
            });

            // Análisis de stock
            const stockAnalysis = products
                .filter(p => p.stock <= 10)
                .sort((a, b) => a.stock - b.stock)
                .slice(0, 10)
                .map(p => ({
                    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
                    stock: p.stock
                }));

            // Productos recientes
            const recentProducts = products
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, 5);

            setStats({
                totalProducts,
                activeProducts,
                lowStockProducts,
                totalCategories: categories.length,
                categoryDistribution,
                stockAnalysis,
                recentProducts
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Colores para gráficos
    const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

    const StatCard = ({ title, value, subtitle, icon, color = 'indigo' }) => (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
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
                    <p className="text-gray-600 mt-2">Resumen general de tu tienda</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total de Productos"
                        value={stats.totalProducts}
                        subtitle={`${stats.activeProducts} activos`}
                        color="indigo"
                        icon={
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Stock Bajo"
                        value={stats.lowStockProducts}
                        subtitle="≤ 5 unidades"
                        color="red"
                        icon={
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Categorías"
                        value={stats.totalCategories}
                        subtitle="categorías únicas"
                        color="green"
                        icon={
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Valor Inventario"
                        value={`$${stats.recentProducts.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(0)}`}
                        subtitle="valor estimado"
                        color="cyan"
                        icon={
                            <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        }
                    />
                </div>

                {/* Charts */}
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

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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