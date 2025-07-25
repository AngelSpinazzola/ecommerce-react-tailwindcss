import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/Common/NavBar';
import AddressList from '../components/AddressList';

const MyProfile = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' o 'addresses'

  // Verificar autenticación
  if (!isAuthenticated || user?.role === 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center py-60">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {!isAuthenticated ? 'Acceso Requerido' : 'Acceso Restringido'}
            </h2>
            <p className="text-gray-600 mb-6">
              {!isAuthenticated
                ? 'Debes iniciar sesión para ver tu perfil'
                : 'Los administradores gestionan perfiles desde el panel de administración'
              }
            </p>
            <Link
              to={!isAuthenticated ? "/login" : "/admin/dashboard"}
              className="bg-indigo-600 text-white px-10 py-4 rounded-md hover:bg-indigo-700"
            >
              {!isAuthenticated ? 'Iniciar Sesión' : 'Ir al Dashboard'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.firstName.trim()) {
        setError('El nombre es requerido');
        return;
      }
      if (!formData.lastName.trim()) {
        setError('El apellido es requerido');
        return;
      }

      await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim()
      });

      setSuccess('¡Perfil actualizado correctamente!');
    } catch (error) {
      // Manejo específico de errores de validación
      if (error.response?.status === 400) {
        if (error.response?.data?.errors) {
          // Errores de validación del modelo (.NET ModelState)
          const validationErrors = error.response.data.errors;
          if (validationErrors.FirstName) {
            setError(validationErrors.FirstName[0]);
          } else if (validationErrors.LastName) {
            setError(validationErrors.LastName[0]);
          } else {
            setError('Por favor verifica los datos ingresados');
          }
        } else {
          // Error simple con mensaje
          setError(error.response?.data?.message || 'Datos inválidos');
        }
      } else {
        setError(error.response?.data?.message || 'Error al actualizar el perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <NavBar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
          <p className="text-gray-600 mt-2">Administra tu información personal y direcciones</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Información Personal
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'addresses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Mis Direcciones
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Información Personal</h2>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Información no editable */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">El email no se puede modificar</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol
                    </label>
                    <input
                      type="text"
                      value={user?.role || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Información editable */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      maxLength={50}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      maxLength={50}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                {/* Mensajes de error y éxito */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="flex items-center justify-between pt-4">
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    ← Volver al inicio
                  </Link>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          firstName: user?.firstName || '',
                          lastName: user?.lastName || ''
                        });
                        setError('');
                        setSuccess('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Guardando...
                        </>
                      ) : (
                        'Guardar Cambios'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab de Direcciones */}
        {activeTab === 'addresses' && <AddressList />}

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Información sobre tu cuenta</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Tu email se usa para el inicio de sesión y no puede ser modificado</li>
            <li>• Los cambios en tu información se reflejarán en futuras órdenes</li>
            <li>• Puedes gestionar múltiples direcciones de envío desde la pestaña "Mis Direcciones"</li>
            <li>• Todos los campos marcados con * son obligatorios</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default MyProfile;