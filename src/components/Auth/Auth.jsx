import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from "../Common/NavBar";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });

    const { login, register, loading, error, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && user) {
            handleRedirectAfterLogin();
        }
    }, [isAuthenticated, user, navigate]);

    const handleRedirectAfterLogin = (userFromResponse = null) => {
        const redirectPath = localStorage.getItem('redirectAfterLogin');

        // Usar el usuario pasado como parámetro o el del contexto
        const currentUser = userFromResponse || user;

        if (redirectPath) {
            localStorage.removeItem('redirectAfterLogin');
            navigate(redirectPath);
        } else {
            if (currentUser?.role === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLogin) {
            const result = await login({
                email: formData.email,
                password: formData.password
            });
            if (result.success) {
                // El contexto ya tiene el usuario actualizado para login
                handleRedirectAfterLogin();
            }
        } else {
            const result = await register(formData);
            if (result.success) {
                // Para registro, obtener el usuario desde localStorage
                const storedUser = authService.getStoredUser();
                handleRedirectAfterLogin(storedUser);
            }
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
        });
    };

    return (
        <>
            <NavBar />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
                    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] sm:min-h-[calc(100vh-200px)]">
                        <div className="max-w-lg w-full">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 relative overflow-hidden transform transition-all duration-500 hover:shadow-2xl">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 transform origin-left transition-transform duration-700 scale-x-100"></div>

                                <div className="relative">
                                    <div className="text-center mb-6 sm:mb-8">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg transform transition-all duration-300 hover:rotate-12 hover:scale-110">
                                            <span className="text-white font-black text-lg sm:text-xl">GT</span>
                                        </div>

                                        <div className="overflow-hidden">
                                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 transform transition-all duration-500 ease-out">
                                                {isLogin ? 'Bienvenido de vuelta' : 'Únete a GameTech'}
                                            </h1>
                                            <p className="text-gray-600 text-sm transform transition-all duration-500 ease-out delay-100">
                                                {isLogin ? 'Accede a tu cuenta para continuar' : 'Crea tu cuenta para empezar'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative mb-6 sm:mb-8 bg-gray-100 rounded-xl p-1">
                                        <div
                                            className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-lg shadow-md transform transition-all duration-300 ease-out ${isLogin ? 'translate-x-0' : 'translate-x-full'
                                                }`}
                                        ></div>

                                        <div className="relative flex">
                                            <button
                                                onClick={() => setIsLogin(true)}
                                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 relative z-10 ${isLogin
                                                    ? 'text-purple-600'
                                                    : 'text-gray-600 hover:text-gray-800'
                                                    }`}
                                            >
                                                Iniciar Sesión
                                            </button>
                                            <button
                                                onClick={() => setIsLogin(false)}
                                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 relative z-10 ${!isLogin
                                                    ? 'text-purple-600'
                                                    : 'text-gray-600 hover:text-gray-800'
                                                    }`}
                                            >
                                                Registrarse
                                            </button>
                                        </div>
                                    </div>

                                    {localStorage.getItem('redirectAfterLogin') && (
                                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-blue-800">🛒 Continuar compra</h3>
                                                    <p className="text-xs text-blue-700">
                                                        Después de autenticarte, continuarás con tu checkout
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                <span>{error}</span>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                                        {!isLogin && (
                                            <div className="grid grid-cols-2 gap-3 animate-fadeInUp">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nombre
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        required={!isLogin}
                                                        value={formData.firstName}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:border-purple-500 transition-colors duration-200"
                                                        placeholder="Tu nombre"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Apellido
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        required={!isLogin}
                                                        value={formData.lastName}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:border-purple-500 transition-colors duration-200"
                                                        placeholder="Tu apellido"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:border-purple-500 transition-colors duration-200"
                                                placeholder="tu@email.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                minLength={!isLogin ? "6" : undefined}
                                                className="w-full px-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:border-purple-500 transition-colors duration-200"
                                                placeholder={isLogin ? "Tu contraseña" : "Mínimo 6 caracteres"}
                                            />
                                            {!isLogin && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Debe tener al menos 6 caracteres
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    {isLogin ? 'Iniciando sesión...' : 'Registrando...'}
                                                </div>
                                            ) : (
                                                <>
                                                    {localStorage.getItem('redirectAfterLogin') && isLogin ? (
                                                        '🛒 Continuar compra'
                                                    ) : isLogin ? (
                                                        'Iniciar Sesión'
                                                    ) : (
                                                        'Crear Cuenta'
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <div className="mt-6 sm:mt-8 text-center space-y-4">
                                        {isLogin && (
                                            <Link to="#" className="text-purple-600 hover:text-purple-500 text-sm font-medium transition-colors transform hover:scale-105 inline-block">
                                                ¿Olvidaste tu contraseña?
                                            </Link>
                                        )}

                                        <div className="border-t border-gray-200 pt-4">
                                            <Link
                                                to="/"
                                                className="text-gray-500 hover:text-gray-700 text-sm transition-colors flex items-center justify-center transform hover:scale-105"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                </svg>
                                                Volver a la tienda
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
            `}</style>
        </>
    );
};

export default Auth;