import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import '../../App.css';

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
        <Link to="/cart" className="relative p-2 text-nova-gray-400 md:hover:text-nova-cyan transition-colors group">
            {/* Icono más pequeño en móvil */}
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 576 512">
                <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
            </svg>
            {getCartItemsCount() > 0 && (
                // Badge gris fijo, sin parpadeo
                <span className="absolute -top-1 -right-1 bg-nova-cyan text-black text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center font-bold">
                    {getCartItemsCount()}
                </span>
            )}
        </Link>
    );

    const SearchButton = () => (
        <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="p-2 text-nova-gray-400 md:hover:text-nova-cyan transition-colors"
        >
            {/* Icono más pequeño */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </button>
    );

    const UserDropdown = () => (
        <div className="relative dropdown-container">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 text-nova-gray-400 hover:text-nova-cyan transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-nova-gray-400 md:hover:bg-nova-cyan/10 md:hover:text-nova-cyan transition-all duration-200"
                            onClick={() => setShowDropdown(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>Mis Órdenes</span>
                        </Link>
                        <Link
                            to="/my-profile"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-nova-gray-400 hover:bg-nova-cyan/10 hover:text-nova-cyan transition-all duration-200"
                            onClick={() => setShowDropdown(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Mi Perfil</span>
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

                        {/* Mobile burger menu (lado izquierdo) */}
                        {isAuthenticated && (
                            <div className="md:hidden flex items-center">
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="p-2 text-nova-gray-400 md:hover:text-nova-cyan transition-colors"
                                >
                                    {/* Icono más pequeño */}
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {/* Logo - Centrado en móvil */}
                        <Link to="/" className={`flex items-center flex-shrink-0 md:mr-auto md:ml-0 ${isAuthenticated ? '-ml-5' : 'ml-4'}`}>
                            <div className="flex items-center space-x-1 sm:space-x-3">
                                <div className="relative">
                                    {/* Glowing Circuit Hexagon */}
                                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-black shadow-inner shadow-cyan-900/50 border border-cyan-700/50 relative overflow-hidden">
                                        <svg
                                            viewBox="0 0 100 100"
                                            className="w-8 h-8 text-cyan-300"
                                            fill="none"
                                            stroke="url(#gradient)"
                                            strokeWidth="6"
                                            strokeLinejoin="round"
                                        >
                                            <defs>
                                                <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                                                    <stop offset="0%" stopColor="#22d3ee" />
                                                    <stop offset="50%" stopColor="#818cf8" />
                                                    <stop offset="100%" stopColor="#c084fc" />
                                                </linearGradient>
                                                <pattern id="circuit" patternUnits="userSpaceOnUse" width="10" height="10">
                                                    <path d="M0 0h10v10H0z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                                </pattern>
                                            </defs>
                                            <polygon
                                                points="50,10 90,30 90,70 50,90 10,70 10,30"
                                                fill="url(#circuit)"
                                                fillOpacity="0.3"
                                            />
                                            <path d="M50 10v30m40-10H60M50 90V60M10 40H40" strokeLinecap="round" />
                                        </svg>
                                    </div>

                                    {/* Glow Aura */}
                                    <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 blur opacity-20"></div>
                                </div>

                                {/* Brand Text */}
                                <div>
                                    {/* Desktop version */}
                                    <div className="hidden sm:block">
                                        <div className="text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">
                                            <span className="font-thin">NOVA</span>{' '}
                                            <span className="font-semibold">GAMING</span>
                                        </div>
                                        <div className="text-xs font-medium text-cyan-400/80 tracking-wider uppercase mt-1">
                                            HARDWARE STORE
                                        </div>
                                    </div>

                                    {/* Mobile version - Vertical */}
                                    <div className="block sm:hidden">
                                        <div className="text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300 leading-tight">
                                            <div className="font-thin">NOVA</div>
                                            <div className="font-semibold">GAMING</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Search Bar Desktop */}
                        {showSearch && (
                            <div className="flex-1 max-w-2xl ml-6 mr-20 hidden md:block">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Buscar productos.."
                                        value={searchTerm || ''}
                                        onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                                        className="w-full px-5 py-3 pl-12 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-nova-cyan focus:border-nova-cyan transition-all duration-200 group-hover:border-gray-600 text-base"
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
                                        className="p-2 text-nova-gray-400 hover:text-nova-cyan transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </Link>
                                </div>
                            )}
                        </div>
                        {/* Mobile Actions (lado derecho) */}
                        <div className="md:hidden flex items-center space-x-2">
                            {showSearch && <SearchButton />}
                            {user?.role !== 'Admin' && <CartButton />}
                            {/* Dropdown de usuario para móvil */}
                            {isAuthenticated ? (
                                <div className="relative dropdown-container">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="p-2 text-nova-gray-400 md:hover:text-nova-cyan transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </button>
                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-xl shadow-2xl border border-gray-800 z-50 overflow-hidden">
                                            <div className="py-2">
                                                <Link
                                                    to="/my-profile"
                                                    className="flex items-center space-x-3 px-4 py-3 text-sm text-nova-gray-400 transition-all duration-200"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>Mi Perfil</span>
                                                </Link>

                                                <Link
                                                    to="/my-orders"
                                                    className="flex items-center space-x-3 px-4 py-3 text-sm text-nova-gray-400 transition-all duration-200"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    <span>Mis Órdenes</span>
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setShowDropdown(false);
                                                        logout();
                                                    }}
                                                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-400 transition-all duration-200"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    <span>Cerrar Sesión</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Si no está autenticado, mostrar icono de usuario
                                <Link
                                    to="/login"
                                    className="p-2 text-nova-gray-400 md:hover:text-nova-cyan transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </Link>
                            )}
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
                                    className="w-full px-4 py-3 pl-10 bg-black border border-gray-700 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-nova-cyan focus:border-nova-cyan transition-all"
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

            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-gray-900 border-t border-gray-800 shadow-2xl fixed top-20 w-full z-40">
                    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                        {isAuthenticated ? (
                            <>
                                <div>
                                    {user?.role === 'Admin' && (
                                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold">
                                            Admin
                                        </span>
                                    )}
                                </div>
                                {user?.role === 'Admin' ? (
                                    <Link
                                        to="/admin/dashboard"
                                        className="flex items-center space-x-3 p-3 text-nova-gray-400 hover:text-nova-cyan hover:bg-nova-cyan/10 rounded-xl transition-all duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <div className="space-y-2">
                                        <Link
                                            to="/"
                                            className="flex items-center space-x-3 p-3 text-gray-400 rounded-xl transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            <span>Home</span>
                                        </Link>
                                        <Link
                                            to="/products"
                                            className="flex items-center space-x-3 p-3 text-nova-gray-400 rounded-xl transition-all duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            <span>Productos</span>
                                        </Link>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Link
                                        to="/"
                                        className="flex items-center space-x-3 p-3 text-nova-gray-400 hover:text-nova-cyan hover:bg-nova-cyan/10 rounded-xl transition-all duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        <span>Home</span>
                                    </Link>
                                    <Link
                                        to="/products"
                                        className="flex items-center space-x-3 p-3 text-nova-gray-400 hover:text-nova-cyan hover:bg-nova-cyan/10 rounded-xl transition-all duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <span>Productos</span>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default NavBar;