import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import NavBar from '../components/Common/NavBar';
import { productService } from '../services/productService';

const MyOrders = () => {
  const { isAuthenticated, user } = useAuth();
  const { getCartItemsCount } = useCart();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyOrders();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedStatus]);

  const loadMyOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await orderService.getMyOrders();
      setOrders(orderData);
    } catch (err) {
      setError(err.message || 'Error al cargar las órdenes');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (selectedStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === selectedStatus));
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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
      // Estados legacy
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending_payment': '💳',
      'payment_submitted': '📄',
      'payment_approved': '✅',
      'payment_rejected': '❌',
      'shipped': '🚚',
      'delivered': '📦',
      'cancelled': '🚫',
      'completed': '✅',
      'pending': '⏳'
    };
    return icons[status] || '📋';
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

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || user?.role === 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {!isAuthenticated ? 'Acceso Requerido' : 'Acceso Restringido'}
            </h2>
            <p className="text-gray-600 mb-6">
              {!isAuthenticated
                ? 'Debes iniciar sesión para ver tus órdenes'
                : 'Los administradores no tienen órdenes personales'
              }
            </p>
            <Link
              to={!isAuthenticated ? "/login" : "/admin/dashboard"}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
            >
              {!isAuthenticated ? 'Iniciar Sesión' : 'Ir al Dashboard'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const uniqueStatuses = getUniqueStatuses();

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Compras</h1>
          <p className="text-gray-600 mt-2">Historial completo de tus compras y estados de pago</p>
        </div>

        {/* Filtros mejorados */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filtrar por estado</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas ({orders.length})
            </button>
            {uniqueStatuses.map(({ status, count, label }) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {getStatusIcon(status)} {label} ({count})
              </button>
            ))}
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
                  onClick={loadMyOrders}
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
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {selectedStatus === 'all' ? 'No tienes órdenes aún' : `No tienes órdenes ${orderService.getStatusText(selectedStatus).toLowerCase()}`}
                </h3>
                <p className="mt-2 text-gray-500">
                  {selectedStatus === 'all' ? '¡Explora nuestros productos gaming y haz tu primera compra!' : 'Cambia el filtro para ver otras órdenes'}
                </p>
                {selectedStatus === 'all' && (
                  <div className="mt-6">
                    <Link
                      to="/"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Explorar productos
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {/* Header de la orden */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Orden #{order.id}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(order.status)}`}>
                            {getStatusIcon(order.status)} {orderService.getStatusText(order.status)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-bold text-gray-900">
                            ${orderService.formatPrice(order.total)}
                          </span>
                          <button
                            onClick={() => toggleOrderDetails(order.id)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                          >
                            {expandedOrder === order.id ? 'Ocultar detalles' : 'Ver detalles'}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                        <span>{orderService.formatDate(order.createdAt)}</span>
                        <span>{order.itemsCount} artículos</span>
                      </div>
                      
                      {/* Descripción del estado */}
                      {orderService.getStatusDescription(order.status) && (
                        <div className="mt-2 text-sm text-gray-600">
                          {orderService.getStatusDescription(order.status)}
                        </div>
                      )}
                    </div>

                    {/* Detalles expandibles */}
                    {expandedOrder === order.id && (
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Información del cliente */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Información de contacto</h4>
                            <dl className="space-y-2 text-sm">
                              <div>
                                <dt className="font-medium text-gray-500">Nombre:</dt>
                                <dd className="text-gray-900">{order.customerName}</dd>
                              </div>
                              <div>
                                <dt className="font-medium text-gray-500">Email:</dt>
                                <dd className="text-gray-900">{order.customerEmail}</dd>
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
                                  <dd className="text-gray-900">{order.customerAddress}</dd>
                                </div>
                              )}
                            </dl>
                          </div>

                          {/* Información adicional y acciones */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Información adicional</h4>
                            <div className="space-y-2 text-sm mb-4">
                              {order.trackingNumber && (
                                <div>
                                  <dt className="font-medium text-gray-500">Número de seguimiento:</dt>
                                  <dd className="text-gray-900 font-mono">{order.trackingNumber}</dd>
                                </div>
                              )}
                              {order.shippingProvider && (
                                <div>
                                  <dt className="font-medium text-gray-500">Transportista:</dt>
                                  <dd className="text-gray-900">{order.shippingProvider}</dd>
                                </div>
                              )}
                              {order.adminNotes && (
                                <div>
                                  <dt className="font-medium text-gray-500">Notas:</dt>
                                  <dd className="text-gray-900">{order.adminNotes}</dd>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Link
                                to={`/order-confirmation/${order.id}`}
                                className="inline-flex items-center px-4 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Ver orden completa
                              </Link>
                              
                              {orderService.canUploadReceipt(order.status) && (
                                <Link
                                  to={`/order-confirmation/${order.id}`}
                                  className="inline-flex items-center px-4 py-2 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition-colors ml-2"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  Subir comprobante
                                </Link>
                              )}
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

        {/* Resumen */}
        {!loading && !error && orders.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen de compras</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                <div className="text-sm text-blue-800">Total de órdenes</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  ${orderService.formatPrice(orders.reduce((sum, order) => sum + order.total, 0))}
                </div>
                <div className="text-sm text-green-800">Total gastado</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {orders.filter(o => o.status === 'delivered').length}
                </div>
                <div className="text-sm text-purple-800">Órdenes entregadas</div>
              </div>
            </div>
          </div>
        )}

        {/* Botón volver */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ← Volver al Inicio
          </Link>
        </div>
      </main>
    </div>
  );
};

export default MyOrders;