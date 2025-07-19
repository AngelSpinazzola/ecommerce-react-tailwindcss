import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, EyeIcon, DocumentTextIcon, PhotoIcon } from '@heroicons/react/24/outline';

const UltraModernReceiptViewer = ({ isOpen, onClose, orderId, fileType, order }) => {
    const [fileUrl, setFileUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState('preview');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detectar si es móvil
        const checkMobile = () => {
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                window.innerWidth < 768;
            setIsMobile(isMobileDevice);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isOpen && orderId) {
            loadFile();
        }
    }, [isOpen, orderId]);

    const loadFile = async () => {
        try {
            setLoading(true);
            setError(null);

            // Para móvil con PDFs, usar estrategia diferente
            if (isMobile && fileType === 'pdf') {
                // No cargar blob, solo preparar para redirect/download
                setFileUrl('mobile-pdf-placeholder');
                return;
            }

            const response = await fetch(`https://ecommerce-api-production-50fd.up.railway.app/api/order/${orderId}/view-receipt`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setFileUrl(url);
            } else {
                throw new Error('Error al cargar el archivo');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = async () => {
        try {
            // Para móvil, hacer redirect directo al endpoint
            if (isMobile) {
                window.open(`https://ecommerce-api-production-50fd.up.railway.app/api/order/${orderId}/download-receipt?token=${localStorage.getItem('token')}`, '_blank');
                return;
            }

            // Para desktop, método normal
            const response = await fetch(`https://ecommerce-api-production-50fd.up.railway.app/api/order/${orderId}/download-receipt`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `comprobante_orden_${orderId}.${fileType === 'pdf' ? 'pdf' : 'jpg'}`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            alert('Error al descargar: ' + err.message);
        }
    };

    const openInBrowser = () => {
        // Crear un formulario temporal para enviar con headers
        const token = localStorage.getItem('token');
        const url = `https://ecommerce-api-production-50fd.up.railway.app/api/order/${orderId}/view-receipt`;

        // Crear ventana con fetch y blob para móvil
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.blob())
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
                // Limpiar después de un tiempo
                setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
            })
            .catch(err => {
                alert('Error al abrir archivo: ' + err.message);
            });
    };

    const cleanup = () => {
        if (fileUrl) {
            URL.revokeObjectURL(fileUrl);
            setFileUrl(null);
        }
        setError(null);
        setActiveView('preview');
        setIsFullscreen(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop con blur premium */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6">

                {/* Main Container - Responsive sizes */}
                <div className={`
                    relative bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 
                    w-full max-w-7xl transition-all duration-300 ease-out
                    ${isFullscreen
                        ? 'h-[98vh] max-h-none'
                        : 'h-[95vh] max-h-[900px]'
                    }
                    flex flex-col overflow-hidden
                `}>

                    {/* Header Glass Effect */}
                    <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>

                        <div className="relative p-4 sm:p-6">
                            {/* Top row - Title and controls */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
                                        Comprobante de Pago
                                    </h1>
                                    <p className="text-sm sm:text-base text-white/80 mt-1 truncate">
                                        Orden #{orderId} • {order?.customerName}
                                    </p>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 hidden sm:block"
                                        title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {isFullscreen ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 15v4.5M15 15h4.5M15 15l4.5 4.5" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.5 3.5L9 9M9 9V4.5M9 9H4.5M14.5 14.5L20 20M20 20v-4.5M20 20h-4.5" />
                                            )}
                                        </svg>
                                    </button>

                                    <button
                                        onClick={cleanup}
                                        className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* File info badge and actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
                                        {fileType === 'pdf' ? (
                                            <DocumentTextIcon className="w-5 h-5" />
                                        ) : (
                                            <PhotoIcon className="w-5 h-5" />
                                        )}
                                        <span className="text-sm font-medium">
                                            {fileType === 'pdf' ? 'Documento PDF' : 'Imagen'}
                                        </span>
                                    </div>

                                    <div className="bg-emerald-400/20 text-emerald-100 rounded-xl px-3 py-2">
                                        <span className="text-sm font-medium">${order?.total?.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={downloadFile}
                                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 transition-all duration-200 text-sm font-medium"
                                    >
                                        <ArrowDownTrayIcon className="w-4 h-4" />
                                        <span className="hidden sm:inline">Descargar</span>
                                    </button>
                                </div>
                            </div>

                            {/* Navigation tabs */}
                            <div className="flex bg-white/10 rounded-2xl p-1 mt-4">
                                <button
                                    onClick={() => setActiveView('preview')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeView === 'preview'
                                            ? 'bg-white text-indigo-600 shadow-lg'
                                            : 'text-white/80 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <EyeIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Vista Previa</span>
                                    <span className="sm:hidden">Vista</span>
                                </button>
                                <button
                                    onClick={() => setActiveView('details')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeView === 'details'
                                            ? 'bg-white text-indigo-600 shadow-lg'
                                            : 'text-white/80 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <DocumentTextIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Detalles</span>
                                    <span className="sm:hidden">Info</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden bg-gray-50/50">
                        {activeView === 'preview' && (
                            <div className="h-full p-3 sm:p-6">
                                {loading && (
                                    <div className="h-full flex flex-col items-center justify-center">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
                                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-indigo-400"></div>
                                        </div>
                                        <p className="mt-6 text-gray-600 font-medium">Cargando comprobante...</p>
                                        <p className="text-sm text-gray-500 mt-2">Por favor espera un momento</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="h-full flex flex-col items-center justify-center p-4">
                                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Error al cargar archivo</h3>
                                        <p className="text-gray-600 mb-6 text-center max-w-md text-sm sm:text-base">{error}</p>
                                        <button
                                            onClick={loadFile}
                                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg hover:shadow-xl"
                                        >
                                            Reintentar carga
                                        </button>
                                    </div>
                                )}

                                {fileUrl && !loading && !error && (
                                    <div className="h-full">
                                        <div className="h-full bg-white rounded-2xl shadow-inner border border-gray-200/50 overflow-hidden">
                                            {fileType === 'pdf' ? (
                                                <div className="w-full h-full">
                                                    {/* Mobile PDF handler */}
                                                    {isMobile ? (
                                                        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                                                <DocumentTextIcon className="w-12 h-12 text-red-600" />
                                                            </div>
                                                            <h3 className="text-xl font-bold text-gray-900 mb-3">Documento PDF</h3>
                                                            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                                                Para una mejor experiencia en móvil, abre el PDF en tu navegador o descárgalo.
                                                            </p>
                                                            <div className="space-y-3 w-full max-w-xs">
                                                                <button
                                                                    onClick={openInBrowser}
                                                                    className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white p-4 rounded-xl font-medium shadow-lg"
                                                                >
                                                                    <EyeIcon className="w-5 h-5" />
                                                                    Abrir PDF
                                                                </button>
                                                                <button
                                                                    onClick={downloadFile}
                                                                    className="w-full flex items-center justify-center gap-3 bg-red-600 text-white p-4 rounded-xl font-medium shadow-lg"
                                                                >
                                                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                                                    Descargar PDF
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-4">
                                                                💡 El PDF se abrirá en una nueva pestaña
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        /* Desktop PDF viewer */
                                                        <iframe
                                                            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&view=Fit`}
                                                            className="w-full h-full"
                                                            title="Comprobante PDF"
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
                                                    <img
                                                        src={fileUrl}
                                                        alt="Comprobante de pago"
                                                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeView === 'details' && (
                            <div className="h-full overflow-y-auto p-3 sm:p-6">
                                <div className="max-w-4xl mx-auto">

                                    {/* Quick stats */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                            <div className="text-2xl font-bold text-indigo-600">#{orderId}</div>
                                            <div className="text-xs sm:text-sm text-gray-600">ID Orden</div>
                                        </div>
                                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                            <div className="text-2xl font-bold text-emerald-600">${order?.total?.toFixed(2)}</div>
                                            <div className="text-xs sm:text-sm text-gray-600">Total</div>
                                        </div>
                                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {fileType === 'pdf' ? 'PDF' : 'IMG'}
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-600">Tipo</div>
                                        </div>
                                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                            <div className="text-2xl font-bold text-blue-600">✓</div>
                                            <div className="text-xs sm:text-sm text-gray-600">Estado</div>
                                        </div>
                                    </div>

                                    {/* Main details grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Customer info */}
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                Cliente
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Nombre completo</label>
                                                    <p className="text-gray-900 font-medium">{order?.customerName}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                                    <p className="text-gray-900 break-all">{order?.customerEmail}</p>
                                                </div>
                                                {order?.customerPhone && (
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500">Teléfono</label>
                                                        <p className="text-gray-900">{order.customerPhone}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Payment info */}
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                    </svg>
                                                </div>
                                                Información de Pago
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Total a pagar</label>
                                                    <p className="text-2xl font-bold text-emerald-600">${order?.total?.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Estado del pago</label>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                                        <span className="text-sm font-medium text-yellow-700">En revisión</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Comprobante subido</label>
                                                    <p className="text-gray-900 text-sm">
                                                        {order?.paymentReceiptUploadedAt
                                                            ? new Date(order.paymentReceiptUploadedAt).toLocaleString('es-ES', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })
                                                            : 'No disponible'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones disponibles</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <button
                                                onClick={downloadFile}
                                                className="flex items-center justify-center gap-3 bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                                            >
                                                <ArrowDownTrayIcon className="w-5 h-5" />
                                                Descargar archivo
                                            </button>
                                            <button
                                                onClick={() => setActiveView('preview')}
                                                className="flex items-center justify-center gap-3 bg-white text-indigo-600 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium border-2 border-indigo-200 hover:border-indigo-300"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                                Ver archivo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default UltraModernReceiptViewer;