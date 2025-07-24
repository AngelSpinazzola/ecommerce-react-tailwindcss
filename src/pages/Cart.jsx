import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import NavBar from '../components/Common/NavBar';
import Swal from 'sweetalert2';

const Cart = () => {
    const navigate = useNavigate();
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

    const incrementQuantity = (productId, currentQuantity, maxStock) => {
        if (currentQuantity < maxStock) {
            updateQuantity(productId, currentQuantity + 1);
        }
    };

    const decrementQuantity = (productId, currentQuantity) => {
        if (currentQuantity > 1) {
            updateQuantity(productId, currentQuantity - 1);
        } else {
            removeFromCart(productId);
        }
    };

    const handleRemoveItem = (productId) => {
        removeFromCart(productId);
    };

    const handleClearCart = () => {
    Swal.fire({
        title: '<strong style="color: #374151; font-family: Montserrat;">¿Vaciar carrito?</strong>',
        html: '<p style="color: #6b7280; font-family: Montserrat; margin: 0;">Esta acción eliminará todos los productos del carrito</p>',
        icon: 'warning',
        iconColor: '#f59e0b',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#9ca3af',
        confirmButtonText: '<span style="font-family: Montserrat; font-weight: 600;">Sí, vaciar</span>',
        cancelButtonText: '<span style="font-family: Montserrat; font-weight: 500;">Cancelar</span>',
        reverseButtons: true,
        background: '#ffffff',
        borderRadius: '16px',
        customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-xl',
            confirmButton: 'rounded-lg px-6 py-3 shadow-lg hover:shadow-xl transition-all',
            cancelButton: 'rounded-lg px-6 py-3 shadow-lg hover:shadow-xl transition-all'
        },
        backdrop: 'rgba(0,0,0,0.4)',
        allowOutsideClick: true,
        focusConfirm: false
    }).then((result) => {
        if (result.isConfirmed) {
            clearCart();
            Swal.fire({
                title: '<strong style="color: #10b981; font-family: Montserrat;">¡Carrito vaciado!</strong>',
                html: '<p style="color: #6b7280; font-family: Montserrat;">Todos los productos han sido eliminados</p>',
                icon: 'success',
                iconColor: '#10b981',
                timer: 2000,
                showConfirmButton: false,
                background: '#ffffff',
                customClass: {
                    popup: 'rounded-2xl shadow-2xl'
                },
                backdrop: 'rgba(0,0,0,0.4)'
            });
        }
    });
};

    const handleCheckout = () => {
        if (!isAuthenticated) {
            localStorage.setItem('redirectAfterLogin', '/checkout');
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    if (user?.role === 'Admin') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <NavBar />
                <div className="max-w-7xl mx-auto bg-white shadow-xl pt-32">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black mb-4">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                    ACCESO RESTRINGIDO
                                </span>
                            </h2>
                            <p className="text-gray-600 mb-8">Los administradores no pueden acceder al carrito</p>
                            <Link
                                to="/admin/dashboard"
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:scale-105 transition-all duration-300"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Ir al Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-montserrat">
            <NavBar />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto bg-white shadow-xl pt-28 ">
                <main className="px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
                    {/* Header */}
                    <div className="mb-12 text-left">
                        <h1 className="text-2xl md:text-3xl mb-4 txt-section-name">
                            <span className="">
                                Mi carrito
                            </span>
                        </h1>
                        <div className="h-px bg-gray-300 w-full mb-6"></div>
                    </div>

                    {cartItems.length === 0 ? (
                        /* Carrito vacío */
                        <div className="text-center py-20">
                            <div className="relative mb-8">
                                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                                    <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                    </svg>
                                </div>
                                {/* Floating particles */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    {[...Array(6)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-2 h-2 bg-purple-300 rounded-full animate-float opacity-60"
                                            style={{
                                                left: `${20 + Math.random() * 60}%`,
                                                top: `${20 + Math.random() * 60}%`,
                                                animationDelay: `${Math.random() * 3}s`,
                                                animationDuration: `${3 + Math.random() * 4}s`
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h3>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                ¡Es hora de armar tu setup gaming perfecto! Descubre componentes de alta gama para tu próximo build.
                            </p>
                            <Link
                                to="/"
                                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg overflow-hidden transition-all duration-300 hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center">
                                    <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Explorar Productos
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </Link>
                        </div>
                    ) : (
                        /* Carrito con productos */
                        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                            {/* Lista de productos */}
                            <div className="lg:col-span-8 space-y-6">
                                {cartItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="group relative bg-white rounded-xl border border-gray-200 p-6 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                        style={{
                                            animationDelay: `${index * 100}ms`
                                        }}
                                    >
                                        {/* Gradient border effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r to-cyan-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {/* Imagen del producto */}
                                            <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-lg overflow-hidden mx-auto sm:mx-0">
                                                <img
                                                    src={productService.getImageUrl(item.mainImageUrl)}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        e.target.src = 'https://picsum.photos/96/96?random=' + item.id;
                                                    }}
                                                />
                                            </div>

                                            {/* Detalles del producto */}
                                            <div className="flex-1 flex flex-col text-center sm:text-left">
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg sm:text-xl font-thin text-gray-700 mb-1 sm:mb-2">
                                                                <Link to={`/product/${item.id}`}>
                                                                    {item.name}
                                                                </Link>
                                                            </h3>
                                                            <p className="text-gray-500 text-base mb-2 sm:mb-3">
                                                                <span className="font-semibold text-gray-900">${item.price.toLocaleString()}</span>
                                                            </p>
                                                        </div>
                                                        <div className="sm:text-right">
                                                            <p className="text-lg font-bold text-gray-900">
                                                                ${(item.price * item.quantity).toLocaleString()}
                                                            </p>
                                                            {item.quantity > 1 && (
                                                                <p className="text-sm text-gray-500 mt-1 ">
                                                                    Por unidad ${item.price.toLocaleString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Controles de cantidad y eliminar */}
                                                <div className="flex flex-row sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-3 sm:mt-4">
                                                    {/* Botón eliminar */}
                                                    <button onClick={() => handleRemoveItem(item.id)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 group/remove shadow-sm border border-red-200"
                                                    >
                                                        <svg className="w-5 h-5 group-hover/remove:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>

                                                    {/* Controles de cantidad */}
                                                    <div className="flex items-center bg-gray-100 rounded-lg p-1 shadow-sm border border-gray-200">
                                                        <button
                                                            onClick={() => decrementQuantity(item.id, item.quantity)}
                                                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white shadow-sm hover:bg-red-50 hover:text-red-600 transition-all duration-200 group/btn border border-gray-100"
                                                        >
                                                            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                                            </svg>
                                                        </button>

                                                        <div className="px-4 py-2 min-w-[50px] text-center">
                                                            <span className="text-lg font-bold text-gray-900">{item.quantity}</span>
                                                        </div>

                                                        <button
                                                            onClick={() => incrementQuantity(item.id, item.quantity, item.stock)}
                                                            disabled={item.quantity >= item.stock}
                                                            className={`w-9 h-9 flex items-center justify-center rounded-lg bg-white shadow-sm transition-all duration-200 group/btn border border-gray-100 ${item.quantity >= item.stock
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'hover:bg-green-50 hover:text-green-600'
                                                                }`}
                                                        >
                                                            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Botón vaciar carrito */}
                                <div className="flex justify-center sm:justify-left pt-6 pl-0 sm:pl-4">
                                    <button
                                        onClick={handleClearCart}
                                        className="flex items-center px-6 py-3 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Vaciar
                                    </button>
                                </div>


                            </div>

                            {/* Resumen del carrito */}
                            <div className="mt-16 lg:mt-0 lg:col-span-4">
                                <div className="sticky top-32">
                                    <div className="relative bg-white rounded-xl border border-gray-200 p-8">



                                        <h2 className="text-2xl font-thin text-gray-700 mb-8">
                                            <span className="">
                                                RESUMEN
                                            </span>
                                        </h2>

                                        <div className="flex items-center justify-between text-sm mb-6">
                                            <p className="text-gray-600 font-thin">
                                                {getCartItemsCount()} {getCartItemsCount() === 1 ? 'artículo' : 'artículos'}
                                            </p>
                                            <p className="font-semibold text-gray-900">
                                                ${getCartTotal().toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4 flex items-center justify-between mb-8">
                                            <dt className="text-lg sm:text-xl font-thin text-gray-900">Total</dt>
                                            <dd className="text-lg sm:text-2xl font-semibold text-gray-900">
                                                ${getCartTotal().toLocaleString()}
                                            </dd>
                                        </div>
                                        {/* Información de pago */}
                                        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-blue-900">Método de pago</h3>
                                                    <p className="text-sm text-blue-700">Transferencia bancaria</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botón de checkout */}
                                        <div className="mt-8">
                                            <button
                                                onClick={handleCheckout}
                                                disabled={cartItems.length === 0}
                                                className={`group relative w-full py-4 px-6 text-lg font-bold rounded-lg overflow-hidden transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${cartItems.length === 0
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 shadow-lg hover:shadow-purple-500/25'
                                                    }`}
                                            >
                                                <span className="relative z-10 flex items-center justify-center">
                                                    {!isAuthenticated ? (
                                                        <>
                                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                            Iniciar sesión para continuar
                                                        </>
                                                    ) : (
                                                        <>
                                                            Iniciar compra
                                                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            </svg>
                                                        </>
                                                    )}
                                                </span>
                                                {cartItems.length > 0 && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                )}
                                            </button>
                                        </div>

                                        {/* Mensaje de autenticación */}
                                        {!isAuthenticated && cartItems.length > 0 && (
                                            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                                                <div className="flex items-center">
                                                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm text-yellow-800 font-medium">
                                                        Necesitas iniciar sesión para continuar con tu compra
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-8 text-center">
                                            <Link
                                                to="/"
                                                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                </svg>
                                                Continuar comprando
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    )}
                </main>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .font-montserrat {
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 300;
                }
                .txt-section-name {
                    line-height: 31.69px;
                    font-size: 26px;
                    letter-spacing: .5px;
                    font-weight: 500;  
                }
                .price-value {
                    font-size: 18px;
                    font-weight: 600;
                }
                
            `}</style>
        </div>
    );
};

export default Cart;