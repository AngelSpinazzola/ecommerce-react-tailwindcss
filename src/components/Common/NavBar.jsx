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
            className="relative p-2 text-gray-400 hover:text-purple-400 transition-colors group"
        >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 576 512">
                <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
            </svg>
            {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                    {getCartItemsCount()}
                </span>
            )}
        </Link>
    );

    const SearchButton = () => (
        <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
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
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
            >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
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
                <div className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-xl shadow-2xl border border-gray-800 z-50 overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-b border-gray-800">
                        <p className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                        {user?.role === 'Admin' && (
                            <div className="mt-2">
                                <span className="inline-block px-2 py-1 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold">
                                    Administrador
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="py-2">
                        <Link
                            to="/my-orders"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-400 hover:bg-purple-900/20 hover:text-purple-400 transition-all duration-200"
                            onClick={() => setShowDropdown(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>Mis Órdenes</span>
                        </Link>
                        <Link
                            to="/my-profile"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-400 hover:bg-purple-900/20 hover:text-purple-400 transition-all duration-200"
                            onClick={() => setShowDropdown(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Mi Perfil</span>
                        </Link>
                        <Link
                            to="/wishlist"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-400 hover:bg-purple-900/20 hover:text-purple-400 transition-all duration-200"
                            onClick={() => setShowDropdown(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>Lista de Deseos</span>
                        </Link>
                        <div className="border-t border-gray-800 mt-2">
                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                    logout();
                                }}
                                className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-200"
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
            <header className="bg-black/90 backdrop-blur-md shadow-2xl border-b border-gray-800 fixed top-0 w-full z-50">
                {/* Navbar principal */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 font-black text-sm">GT</span>
                                    </div>
                                </div>
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
                            </div>
                            <div className="text-white hidden sm:block">
                                <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">GAMETECH</span>
                                <div className="text-xs text-purple-400 font-medium -mt-1">HARDWARE STORE</div>
                            </div>
                        </Link>

                        {/* Search Bar Desktop */}
                        {showSearch && (
                            <div className="flex-1 max-w-2xl mx-6 hidden sm:block">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Buscar componentes gaming..."
                                        value={searchTerm || ''}
                                        onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                                        className="w-full px-5 py-3 pl-12 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 group-hover:border-gray-600 text-base"
                                    />
                                    <svg className="absolute left-4 top-3.5 w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* Desktop User Actions */}
                        <div className="hidden md:flex items-center space-x-4">
                            {user?.role !== 'Admin' && <CartButton />}
                            
                            {isAuthenticated && user?.role !== 'Admin' && (
                                <Link
                                    to="/wishlist"
                                    className="p-3 text-gray-400 hover:text-purple-400 transition-colors group"
                                >
                                    <svg className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl text-base font-bold hover:shadow-lg hover:scale-105 transition-all duration-200"
                                            >
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={() => logout()}
                                                className="text-gray-400 hover:text-white text-base font-medium transition-colors"
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
                                        className="text-gray-400 hover:text-white font-medium transition-colors text-base"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Actions */}
                        <div className="md:hidden flex items-center space-x-3">
                            {showSearch && <SearchButton />}
                            {user?.role !== 'Admin' && <CartButton />}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-3 text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {showMobileSearch && showSearch && (
                    <div className="md:hidden bg-gray-900 border-t border-gray-800 p-4 fixed top-20 w-full z-50">
                        <div className="max-w-7xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar componentes gaming..."
                                    value={searchTerm || ''}
                                    onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 pl-10 bg-black border border-gray-700 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                    autoFocus
                                />
                                <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <button
                                    onClick={() => setShowMobileSearch(false)}
                                    className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6m0 0L6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-gray-900 border-t border-gray-800 shadow-2xl">
                        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/20">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold">
                                                {user?.firstName?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-sm text-gray-400">{user?.email}</p>
                                            {user?.role === 'Admin' && (
                                                <span className="inline-block mt-1 px-2 py-1 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {user?.role === 'Admin' ? (
                                        <Link
                                            to="/admin/dashboard"
                                            className="block bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl text-center font-bold hover:shadow-lg transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <div className="space-y-2">
                                            <Link
                                                to="/cart"
                                                className="flex items-center space-x-3 p-3 text-gray-400 hover:text-purple-400 hover:bg-purple-900/20 rounded-xl transition-all duration-200"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="relative">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 576 512">
                                                        <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
                                                    </svg>
                                                    {getCartItemsCount() > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                                            {getCartItemsCount()}
                                                        </span>
                                                    )}
                                                </div>
                                                <span>Mi Carrito</span>
                                            </Link>
                                            <Link
                                                to="/my-orders"
                                                className="flex items-center space-x-3 p-3 text-gray-400 hover:text-purple-400 hover:bg-purple-900/20 rounded-xl transition-all duration-200"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <span>Mis Órdenes</span>
                                            </Link>
                                            <Link
                                                to="/my-profile"
                                                className="flex items-center space-x-3 p-3 text-gray-400 hover:text-purple-400 hover:bg-purple-900/20 rounded-xl transition-all duration-200"
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
                                        className="flex items-center space-x-3 w-full p-3 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all duration-200 border-t border-gray-800 mt-4 pt-4"
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
                                            className="flex items-center space-x-3 p-3 text-gray-400 hover:text-purple-400 hover:bg-purple-900/20 rounded-xl transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <div className="relative">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 576 512">
                                                    <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
                                                </svg>
                                                {getCartItemsCount() > 0 && (
                                                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                                        {getCartItemsCount()}
                                                    </span>
                                                )}
                                            </div>
                                            <span>Mi Carrito</span>
                                        </Link>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-gray-800">
                                        <button
                                            onClick={() => handleMobileNavigation('/login')}
                                            className="block w-full p-3 text-gray-300 hover:text-purple-400 hover:bg-purple-900/20 rounded-xl text-center font-medium transition-all duration-200 border border-gray-700"
                                        >
                                            Iniciar Sesión
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