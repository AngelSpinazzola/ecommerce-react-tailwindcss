import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import MyProfile from './components/MyProfile';
import ProductManagement from './pages/ProductManagement';
import ProtectedRoute from './components/Common/ProtectedRoute.jsx';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetail from './pages/AdminOrderDetail';
import AdminPendingOrders from './pages/AdminPendingOrders';
import Invoice from './components/Invoice';
import Auth from './components/Auth/Auth';
// import './App.css';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#10B981',
            },
          },
          error: {
            duration: 5000,
            theme: {
              primary: '#EF4444',
            },
          },
        }}
      />
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/invoice/:orderId" element={<Invoice />} />

                {/* Rutas de usuarios autenticados */}
                <Route
                  path="/my-orders"
                  element={
                    <ProtectedRoute>
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/my-profile"
                  element={
                    <ProtectedRoute>
                      <MyProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Rutas de administración */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <ProductManagement />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />

                {/* Nueva ruta: Revisión de pagos pendientes */}
                <Route
                  path="/admin/orders/pending-review"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminPendingOrders />
                    </ProtectedRoute>
                  }
                />

                {/* Detalle de orden específica */}
                <Route
                  path="/admin/order/:orderId"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminOrderDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Rutas adicionales para gestión de pagos */}
                <Route
                  path="/admin/orders/pending-payment"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/orders/payment-approved"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/orders/shipped"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminOrders />
                    </ProtectedRoute>
                  }
                />

                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:categoryName" element={<ProductsPage />} />

                {/* Redirecciones legacy */}
                <Route path="/customer/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />

                {/* Wishlist (placeholder para futuro) */}
                <Route path="/wishlist" element={<Navigate to="/" replace />} />

                {/* Ruta 404 - debe ir al final */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </>
  );
}

export default App;