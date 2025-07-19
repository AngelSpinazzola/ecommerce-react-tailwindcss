import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const NavBar = ({ searchTerm, setSearchTerm, showSearch = false }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
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
            className="relative p-2 text-gray-300 hover:text-amber-400 transition-colors"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {getCartItemsCount()}
                </span>
            )}
        </Link>
    );

    const SearchButton = () => (
        <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="p-2 text-gray-300 hover:text-amber-400 transition-colors"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </button>
    );

    const UserDropdown = () => (
        <div className="relative dropdown-container">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">
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
                <div className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-xl shadow-xl border border-gray-700 z-50 overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600">
                        <p className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-300">{user?.email}</p>
                        {user?.role === 'Admin' && (
                            <div className="mt-2">
                                <span className="inline-block px-2 py-1 text-xs bg-amber-500 text-white rounded-full font-bold">
                                    Administrador
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="py-2">
                        <Link
                            to="/my-orders"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-amber-400 transition-colors"
                            onClick={() => setShowDropdown(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>Mis Órdenes</span>
                        </Link>
                        <Link
                            to="/my-profile"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-amber-400 transition-colors"
                            onClick={() => setShowDropdown(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Mi Perfil</span>
                        </Link>
                        <Link
                            to="/wishlist"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-amber-400 transition-colors"
                            onClick={() => setShowDropdown(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>Lista de Deseos</span>
                        </Link>
                        <div className="border-t border-gray-700 mt-2">
                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                    logout();
                                }}
                                className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-red-400 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <header className="bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-gray-700 fixed top-0 w-full z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo Moderno */}
                        <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
                            <div className="relative">
                                {/* Logo con diseño gaming */}
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                                        <span className="text-amber-400 font-black text-sm">G</span>
                                    </div>
                                </div>
                                {/* Pequeño indicador gaming */}
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                            <div className="text-white hidden sm:block">
                                <span className="text-xl font-black tracking-tight">GAMETECH</span>
                                <div className="text-xs text-amber-400 font-medium -mt-1">GAMING STORE</div>
                            </div>
                        </Link>

                        {/* Search Bar Desktop */}
                        {showSearch && (
                            <div className="flex-1 max-w-md mx-4 hidden sm:block">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar productos"
                                        value={searchTerm || ''}
                                        onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                                    />
                                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {/* Actions directas sin categorías */}
                            <div className="flex items-center space-x-4">
                                {user?.role !== 'Admin' && <CartButton />}

                                {isAuthenticated && user?.role !== 'Admin' && (
                                    <Link
                                        to="/wishlist"
                                        className="p-2 text-gray-300 hover:text-amber-400 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </Link>
                                )}

                                {isAuthenticated ? (
                                    <>
                                        {user?.role === 'Admin' ? (
                                            <div className="flex items-center space-x-4">
                                                <Link
                                                    to="/admin/dashboard"
                                                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-amber-400 hover:to-orange-500 transition-all duration-200"
                                                >
                                                    Dashboard
                                                </Link>
                                                <button
                                                    onClick={() => logout()}
                                                    className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
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
                                            className="text-gray-300 hover:text-white font-medium transition-colors"
                                        >
                                            Iniciar Sesión
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:from-amber-400 hover:to-orange-500 transition-all duration-200 transform hover:scale-105"
                                        >
                                            Registrarse
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Actions */}
                        <div className="md:hidden flex items-center space-x-2">
                            {/* Search Icon Mobile */}
                            {showSearch && <SearchButton />}
                            
                            {/* Cart Mobile */}
                            {user?.role !== 'Admin' && <CartButton />}

                            {/* Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-gray-300 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar (cuando se presiona la lupa) */}
                {showMobileSearch && showSearch && (
                    <div className="md:hidden bg-gray-800 border-t border-gray-700 p-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar productos gaming..."
                                value={searchTerm || ''}
                                onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-10 bg-gray-900 border border-gray-600 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                autoFocus
                            />
                            <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <button
                                onClick={() => setShowMobileSearch(false)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6m0 0L6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-gray-900 border-t border-gray-700 shadow-lg relative z-50">
                        <div className="container mx-auto px-4 py-4 space-y-4">

                            {/* Categories */}
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Categorías Gaming</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { name: 'Gaming', path: '/category/gaming', icon: '🎮' },
                                        { name: 'Hardware', path: '/category/hardware', icon: '💻' },
                                        { name: 'Periféricos', path: '/category/perifericos', icon: '⌨️' },
                                        { name: 'Ofertas', path: '/ofertas', icon: '🔥' }
                                    ].map((category) => (
                                        <Link
                                            key={category.name}
                                            to={category.path}
                                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-amber-400 p-3 rounded-xl text-center font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <span>{category.icon}</span>
                                            <span>{category.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl">
                                        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold">
                                                {user?.firstName?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-sm text-gray-300">{user?.email}</p>
                                            {user?.role === 'Admin' && (
                                                <span className="inline-block mt-1 px-2 py-1 text-xs bg-amber-500 text-white rounded-full font-bold">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {user?.role === 'Admin' ? (
                                        <Link
                                            to="/admin/dashboard"
                                            className="block bg-gradient-to-r from-amber-500 to-orange-600 text-white p-3 rounded-xl text-center font-bold hover:from-amber-400 hover:to-orange-500 transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <div className="space-y-2">
                                            <Link
                                                to="/cart"
                                                className="flex items-center space-x-3 p-3 text-gray-300 hover:text-amber-400 hover:bg-gray-800 rounded-xl transition-all duration-200"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="relative">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                    {getCartItemsCount() > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                                            {getCartItemsCount()}
                                                        </span>
                                                    )}
                                                </div>
                                                <span>Mi Carrito</span>
                                            </Link>
                                            <Link
                                                to="/my-orders"
                                                className="flex items-center space-x-3 p-3 text-gray-300 hover:text-amber-400 hover:bg-gray-800 rounded-xl transition-all duration-200"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <span>Mis Órdenes</span>
                                            </Link>
                                            <Link
                                                to="/my-profile"
                                                className="flex items-center space-x-3 p-3 text-gray-300 hover:text-amber-400 hover:bg-gray-800 rounded-xl transition-all duration-200"
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
                                        className="flex items-center space-x-3 w-full p-3 text-gray-300 hover:text-red-400 hover:bg-gray-800 rounded-xl transition-all duration-200 border-t border-gray-700 mt-4 pt-4"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Cerrar Sesión</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Link
                                            to="/cart"
                                            className="flex items-center space-x-3 p-3 text-gray-300 hover:text-amber-400 hover:bg-gray-800 rounded-xl transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <div className="relative">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                                {getCartItemsCount() > 0 && (
                                                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                                        {getCartItemsCount()}
                                                    </span>
                                                )}
                                            </div>
                                            <span>Mi Carrito</span>
                                        </Link>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleMobileNavigation('/login')}
                                            className="block w-full p-3 text-gray-300 hover:text-amber-400 hover:bg-gray-800 rounded-xl text-center font-medium transition-all duration-200 border border-gray-600"
                                        >
                                            Iniciar Sesión
                                        </button>

                                        <button
                                            onClick={() => handleMobileNavigation('/register')}
                                            className="block w-full p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-center font-bold hover:from-amber-400 hover:to-orange-500 transition-all duration-200"
                                        >
                                            Registrarse
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default NavBar;