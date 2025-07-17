import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const NavBar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const { getCartItemsCount } = useCart();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.relative')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    return (
        <header className="bg-white shadow-sm fixed top-0 w-full z-50">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Link to="/" className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                                🛒 TiendaNova
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user?.role !== 'Admin' && (
                            <Link to="/cart" className="relative text-gray-700 hover:text-gray-900">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                </svg>
                                {getCartItemsCount() > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {getCartItemsCount()}
                                    </span>
                                )}
                            </Link>
                        )}
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-gray-700">
                                    Hola, {user?.firstName}
                                    {user?.role === 'Admin' && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                            Admin
                                        </span>
                                    )}
                                </span>
                                {user?.role === 'Admin' ? (
                                    // Admin: Dashboard + Logout
                                    <>
                                        <Link
                                            to="/admin/dashboard"
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => logout()}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </>
                                ) : (
                                    // Cliente: Solo dropdown
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowDropdown(!showDropdown)}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center"
                                        >
                                            Mi Cuenta
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {showDropdown && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                                                <div className="py-1">
                                                    <Link
                                                        to="/my-orders"
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        onClick={() => setShowDropdown(false)}
                                                    >
                                                        📋 Mis Órdenes
                                                    </Link>
                                                    <Link
                                                        to="/my-profile"
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        onClick={() => setShowDropdown(false)}
                                                    >
                                                        👤 Mi Perfil
                                                    </Link>
                                                    <hr className="my-1" />
                                                    <button
                                                        onClick={() => {
                                                            setShowDropdown(false);
                                                            logout();
                                                        }}
                                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                    >
                                                        🚪 Cerrar Sesión
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NavBar;