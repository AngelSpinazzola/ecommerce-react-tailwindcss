import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const NavBar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const { getCartItemsCount } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.dropdown-container')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    const CartButton = () => (
        <Link
            to="/cart"
            className="relative p-2 text-gray-700 hover:text-rose-500 transition-colors"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {getCartItemsCount()}
                </span>
            )}
        </Link>
    );

    const UserDropdown = () => (
        <div className="relative dropdown-container">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
                <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                        {user?.firstName?.charAt(0) || 'U'}
                    </span>
                </div>
                <span className="hidden sm:block font-medium">{user?.firstName}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-rose-50 to-purple-50 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        {user?.role === 'Admin' && (
                            <div className="mt-2">
                                <span className="inline-block px-2 py-1 text-xs bg-rose-100 text-rose-600 rounded-full font-medium">
                                    Administrador
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="py-2">
                        <Link
                            to="/my-orders"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowDropdown(false)}
                        >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>Mis Órdenes</span>
                        </Link>
                        <Link
                            to="/my-profile"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowDropdown(false)}
                        >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Mi Perfil</span>
                        </Link>
                        <Link
                            to="/wishlist"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowDropdown(false)}
                        >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>Lista de Deseos</span>
                        </Link>
                        <div className="border-t border-gray-100 mt-2">
                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                    logout();
                                }}
                                className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const handleMobileNavigation = (path) => {
        setIsMobileMenuOpen(false);
        navigate(path);
    };

    return (
        <>
            <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 fixed top-0 w-full z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold">N</span>
                            </div>
                            <div className="text-gray-900">
                                <span className="text-xl font-bold">Moda</span>
                                <span className="text-rose-500 italic ml-1">Nova</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {/* Category navigation */}
                            <nav className="flex items-center space-x-6">
                                <Link
                                    to="/category/mujer"
                                    className="text-gray-700 hover:text-rose-500 transition-colors font-medium"
                                >
                                    Mujer
                                </Link>
                                <Link
                                    to="/category/hombre"
                                    className="text-gray-700 hover:text-rose-500 transition-colors font-medium"
                                >
                                    Hombre
                                </Link>
                                <Link
                                    to="/category/ninos"
                                    className="text-gray-700 hover:text-rose-500 transition-colors font-medium"
                                >
                                    Niños
                                </Link>
                                <Link
                                    to="/category/accesorios"
                                    className="text-gray-700 hover:text-rose-500 transition-colors font-medium"
                                >
                                    Accesorios
                                </Link>
                                <Link
                                    to="/ofertas"
                                    className="text-rose-500 hover:text-rose-600 transition-colors font-medium"
                                >
                                    Ofertas
                                </Link>
                            </nav>

                            {/* Actions */}
                            <div className="flex items-center space-x-4">
                                {user?.role !== 'Admin' && (
                                    <>
                                        <Link
                                            to="/wishlist"
                                            className="p-2 text-gray-700 hover:text-rose-500 transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </Link>
                                        <CartButton />
                                    </>
                                )}

                                {isAuthenticated ? (
                                    <>
                                        {user?.role === 'Admin' ? (
                                            <div className="flex items-center space-x-4">
                                                <Link
                                                    to="/admin/dashboard"
                                                    className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-rose-600 hover:to-purple-700 transition-all duration-200"
                                                >
                                                    Dashboard
                                                </Link>
                                                <button
                                                    onClick={() => logout()}
                                                    className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors"
                                                >
                                                    Salir
                                                </button>
                                            </div>
                                        ) : (
                                            <UserDropdown />
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            to="/login"
                                            className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                                        >
                                            Iniciar Sesión
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-rose-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                                        >
                                            Registrarse
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 shadow-lg relative z-50">
                        <div className="container mx-auto px-4 py-4 space-y-4">

                            {/* Categories */}
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categorías</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { name: 'Mujer', path: '/category/mujer' },
                                        { name: 'Hombre', path: '/category/hombre' },
                                        { name: 'Niños', path: '/category/ninos' },
                                        { name: 'Accesorios', path: '/category/accesorios' }
                                    ].map((category) => (
                                        <Link
                                            key={category.name}
                                            to={category.path}
                                            className="bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-rose-500 p-3 rounded-xl text-center font-medium transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {category.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-rose-50 to-purple-50 rounded-xl">
                                        <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium">
                                                {user?.firstName?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                            {user?.role === 'Admin' && (
                                                <span className="inline-block mt-1 px-2 py-1 text-xs bg-rose-100 text-rose-600 rounded-full font-medium">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {user?.role === 'Admin' ? (
                                        <Link
                                            to="/admin/dashboard"
                                            className="block bg-gradient-to-r from-rose-500 to-purple-600 text-white p-3 rounded-xl text-center font-medium hover:from-rose-600 hover:to-purple-700 transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <div className="space-y-2">
                                            <Link
                                                to="/cart"
                                                className="flex items-center space-x-3 p-3 text-gray-700 hover:text-rose-500 hover:bg-gray-50 rounded-xl transition-all duration-200"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="relative">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                    {getCartItemsCount() > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                                            {getCartItemsCount()}
                                                        </span>
                                                    )}
                                                </div>
                                                <span>Carrito</span>
                                            </Link>
                                            <Link
                                                to="/wishlist"
                                                className="flex items-center space-x-3 p-3 text-gray-700 hover:text-rose-500 hover:bg-gray-50 rounded-xl transition-all duration-200"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                <span>Lista de Deseos</span>
                                            </Link>
                                            <Link
                                                to="/my-orders"
                                                className="flex items-center space-x-3 p-3 text-gray-700 hover:text-rose-500 hover:bg-gray-50 rounded-xl transition-all duration-200"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <span>Mis Órdenes</span>
                                            </Link>
                                            <Link
                                                to="/my-profile"
                                                className="flex items-center space-x-3 p-3 text-gray-700 hover:text-rose-500 hover:bg-gray-50 rounded-xl transition-all duration-200"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span>Mi Perfil</span>
                                            </Link>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            logout();
                                        }}
                                        className="flex items-center space-x-3 w-full p-3 text-gray-700 hover:text-rose-500 hover:bg-gray-50 rounded-xl transition-all duration-200 border-t border-gray-200 mt-4 pt-4"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Cerrar Sesión</span>
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleMobileNavigation('/login')}
                                        className="block w-full p-3 text-gray-700 hover:text-rose-500 hover:bg-gray-50 rounded-xl text-center font-medium transition-all duration-200 border border-gray-200"
                                    >
                                        Iniciar Sesión
                                    </button>
                                    
                                    <button
                                        onClick={() => handleMobileNavigation('/register')}
                                        className="block w-full p-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl text-center font-medium hover:from-rose-600 hover:to-purple-700 transition-all duration-200"
                                    >
                                        Registrarse
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default NavBar;