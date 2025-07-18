import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from "../Common/NavBar";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { login, loading, error, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      handleRedirectAfterLogin();
    }
  }, [isAuthenticated, user, navigate]);

  const handleRedirectAfterLogin = () => {
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    
    if (redirectPath) {
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    } else {
      if (user.role === 'Admin') {
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
    const result = await login(formData);
    if (result.success && result.user) {
      handleRedirectAfterLogin();
    }
  };

  return (
    <>
      <NavBar/>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 pt-16">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Bienvenido de vuelta
              </h2>
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link
                  to="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>

            {/* Información sobre redirección (solo si viene del carrito) */}
            {localStorage.getItem('redirectAfterLogin') && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">🛒 Continuar compra</h3>
                    <p className="text-sm text-blue-700">
                      Después de iniciar sesión, continuarás con tu checkout
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-xl text-sm">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="break-words">{error}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-base"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-base"
                    placeholder="Tu contraseña"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      {localStorage.getItem('redirectAfterLogin') ? (
                        <>
                          🛒 Iniciar sesión y continuar compra
                        </>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Links adicionales */}
            <div className="mt-6 text-center space-y-3">
              <div className="text-sm text-gray-500">
                <Link to="#" className="text-indigo-600 hover:text-indigo-500">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <Link
                  to="/"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Volver a la tienda
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;