import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import NavBar from '../components/Common/NavBar';

const Cart = () => {
    const { isAuthenticated, user } = useAuth();
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount
    } = useCart();

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            updateQuantity(productId, newQuantity);
        }
    };

    const handleRemoveItem = (productId) => {
        removeFromCart(productId);
    };

    const handleClearCart = () => {
        if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            clearCart();
        }
    };

    if (user?.role === 'Admin') {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavBar />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h2>
                        <p className="text-gray-600 mb-6">Los administradores no pueden acceder al carrito</p>
                        <Link
                            to="/admin/dashboard"
                            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                        >
                            Ir al Dashboard
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Mi Carrito</h1>
                    <p className="text-gray-600 mt-2">
                        {cartItems.length === 0
                            ? 'Tu carrito está vacío'
                            : `${getCartItemsCount()} artículos en tu carrito`
                        }
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    /* Carrito vacío */
                    <div className="text-center py-12">
                        <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Tu carrito está vacío</h3>
                        <p className="mt-2 text-gray-500">¡Descubre productos increíbles en nuestra tienda!</p>
                        <div className="mt-6">
                            <Link
                                to="/"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Continuar comprando
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* Carrito con productos */
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                        {/* Lista de productos */}
                        <div className="lg:col-span-8">
                            <div className="flow-root">
                                <ul className="divide-y divide-gray-200">
                                    {cartItems.map((item) => (
                                        <li key={item.id} className="py-6 flex">
                                            {/* Imagen del producto */}
                                            <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                                                <img
                                                    src={productService.getImageUrl(item.mainImageUrl)}
                                                    alt={item.name}
                                                    className="w-full h-full object-center object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'https://picsum.photos/96/96?random=' + item.id;
                                                    }}
                                                />
                                            </div>

                                            {/* Detalles del producto */}
                                            <div className="ml-4 flex-1 flex flex-col">
                                                <div>
                                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                                        <h3>
                                                            <Link to={`/product/${item.id}`} className="hover:text-indigo-600">
                                                                {item.name}
                                                            </Link>
                                                        </h3>
                                                        <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-500">Precio unitario: ${item.price.toFixed(2)}</p>
                                                </div>

                                                <div className="flex-1 flex items-end justify-between text-sm">
                                                    {/* Cantidad */}
                                                    <div className="flex items-center space-x-2">
                                                        <label htmlFor={`quantity-${item.id}`} className="text-gray-500">
                                                            Cantidad:
                                                        </label>
                                                        <select
                                                            id={`quantity-${item.id}`}
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                                            className="rounded-md border border-gray-300 text-base leading-5 font-medium text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        >
                                                            {[...Array(Math.min(item.stock, 10))].map((_, i) => (
                                                                <option key={i + 1} value={i + 1}>
                                                                    {i + 1}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Botón eliminar */}
                                                    <div className="flex">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="font-medium text-indigo-600 hover:text-indigo-500"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Botón vaciar carrito */}
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleClearCart}
                                    className="text-sm font-medium text-red-600 hover:text-red-500"
                                >
                                    Vaciar carrito
                                </button>
                            </div>
                        </div>

                        {/* Resumen del carrito */}
                        <div className="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-4">
                            <h2 className="text-lg font-medium text-gray-900">Resumen del pedido</h2>

                            <dl className="mt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">Subtotal</dt>
                                    <dd className="text-sm font-medium text-gray-900">${getCartTotal().toFixed(2)}</dd>
                                </div>

                                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                                    <dt className="text-base font-medium text-gray-900">Total</dt>
                                    <dd className="text-base font-medium text-gray-900">${getCartTotal().toFixed(2)}</dd>
                                </div>
                            </dl>

                            <div className="mt-6">
                                <Link
                                    to="/checkout"
                                    className={`block w-full text-center py-3 px-4 text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 ${cartItems.length === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                    onClick={(e) => {
                                        if (cartItems.length === 0) {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    Proceder al checkout
                                </Link>
                            </div>

                            <div className="mt-6 text-center text-sm text-gray-500">
                                <p>
                                    o{' '}
                                    <Link to="/" className="text-indigo-600 font-medium hover:text-indigo-500">
                                        Continuar comprando
                                        <span aria-hidden="true"> &rarr;</span>
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Cart;