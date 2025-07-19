import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import NavBar from '../components/Common/NavBar';

const AdminPendingOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [actionModal, setActionModal] = useState({ show: false, order: null, action: null });
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const pendingOrders = await orderService.getOrdersPendingReview();
      setOrders(pendingOrders);
    } catch (err) {
      setError(err.message);
      console.error('Error loading pending orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (order, action) => {
    setActionModal({ show: true, order, action });
    setAdminNotes('');
  };

  const confirmAction = async () => {
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

      // Recargar órdenes
      await loadPendingOrders();
      
      // Cerrar modal
      setActionModal({ show: false, order: null, action: null });
      setAdminNotes('');

    } catch (err) {
      console.error('Error processing order:', err);
      alert('Error: ' + err.message);
    } finally {
      setProcessingOrder(null);
    }
  };

  const getReceiptUrl = (order) => {
    return order.paymentReceiptUrl || '/api/order/' + order.id + '/payment-receipt';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pagos por Revisar</h1>
              <p className="text-gray-600 mt-2">Órdenes con comprobantes pendientes de aprobación</p>
            </div>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Volver al Dashboard
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                {orders.length} {orders.length === 1 ? 'orden pendiente' : 'órdenes pendientes'} de revisión
              </p>
              <p className="text-sm text-yellow-600">
                Revisa los comprobantes de pago y aprueba o rechaza según corresponda
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error al cargar órdenes</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={loadPendingOrders}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No hay pagos pendientes
            </h3>
            <p className="mt-2 text-gray-500">
              Todas las órdenes han sido revisadas
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Orden #{order.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {orderService.formatDate(order.paymentReceiptUploadedAt || order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          📄 Comprobante enviado
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Información del Cliente</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Nombre:</span>
                          <span className="text-sm font-medium text-gray-900">{order.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Email:</span>
                          <span className="text-sm font-medium text-gray-900">{order.customerEmail}</span>
                        </div>
                        {order.customerPhone && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Teléfono:</span>
                            <span className="text-sm font-medium text-gray-900">{order.customerPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Receipt */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Comprobante de Pago</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {order.paymentReceiptUrl ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Estado:</span>
                              <span className="text-sm font-medium text-green-600">✅ Subido</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Fecha:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {orderService.formatDate(order.paymentReceiptUploadedAt)}
                              </span>
                            </div>
                            <div className="mt-3">
                              <a
                                href={getReceiptUrl(order)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Ver comprobante
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm text-gray-500 mt-2">No hay comprobante disponible</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Productos Ordenados</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {order.orderItems?.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.productName} × {item.quantity}</span>
                            <span className="font-medium text-gray-900">${item.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between font-medium">
                            <span>Total:</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleAction(order, 'approve')}
                      disabled={processingOrder === order.id}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingOrder === order.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Aprobar
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleAction(order, 'reject')}
                      disabled={processingOrder === order.id}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingOrder === order.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Rechazar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de confirmación */}
        {actionModal.show && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center mb-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    actionModal.action === 'approve' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {actionModal.action === 'approve' ? (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {actionModal.action === 'approve' ? 'Aprobar Pago' : 'Rechazar Pago'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Orden #{actionModal.order?.id} - ${actionModal.order?.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas del administrador {actionModal.action === 'reject' ? '(requeridas)' : '(opcionales)'}
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={
                      actionModal.action === 'approve' 
                        ? 'Ej: Pago verificado - Transferencia confirmada'
                        : 'Ej: Comprobante ilegible, por favor enviar nuevo comprobante'
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                  />
                  {actionModal.action === 'reject' && !adminNotes.trim() && (
                    <p className="mt-1 text-sm text-red-600">
                      Las notas son obligatorias para rechazar un pago
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Información de la orden:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Cliente:</span> {actionModal.order?.customerName}</p>
                    <p><span className="font-medium">Email:</span> {actionModal.order?.customerEmail}</p>
                    <p><span className="font-medium">Total:</span> ${actionModal.order?.total.toFixed(2)}</p>
                    {actionModal.order?.paymentReceiptUploadedAt && (
                      <p><span className="font-medium">Comprobante subido:</span> {orderService.formatDate(actionModal.order.paymentReceiptUploadedAt)}</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setActionModal({ show: false, order: null, action: null });
                      setAdminNotes('');
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmAction}
                    disabled={processingOrder || (actionModal.action === 'reject' && !adminNotes.trim())}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-white transition-colors ${
                      actionModal.action === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300' 
                        : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
                    } disabled:cursor-not-allowed`}
                  >
                    {processingOrder ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </span>
                    ) : (
                      actionModal.action === 'approve' ? 'Aprobar Pago' : 'Rechazar Pago'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPendingOrders;