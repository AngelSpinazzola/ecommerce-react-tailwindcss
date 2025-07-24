import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import NavBar from '../components/Common/NavBar';
import SecondaryNavBar from '../components/Common/SecondaryNavBar';
import toast from 'react-hot-toast';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';


const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSlide, setActiveSlide] = useState(0);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const swiperRef = useRef(null);
    const { addToCart, isInCart, getItemQuantity, getCartItemsCount } = useCart();

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const data = await productService.getProductById(id);
            setProduct(data);
        } catch (err) {
            setError('Producto no encontrado');
            console.error('Error loading product:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        addToCart(product, 1);
    };

    // Crea array de imágenes para mostrar
    const getDisplayImages = () => {
        if (!product) return [];

        let images = [];

        // Agrega TODAS las imágenes de la galería (incluyendo la principal)
        if (product.images && product.images.length > 0) {
            // Filtra válidas y separar principal de las demás
            const validImages = product.images
                .filter(img => img.imageUrl && img.imageUrl !== 'string');

            // Separa imagen principal de las demás
            const mainImage = validImages.find(img => img.isMain);
            const otherImages = validImages
                .filter(img => !img.isMain)
                .sort((a, b) => a.displayOrder - b.displayOrder);

            // Agrega imagen principal PRIMERO
            if (mainImage) {
                images.push({
                    url: mainImage.imageUrl,
                    isMain: true,
                    id: mainImage.id,
                    displayOrder: mainImage.displayOrder
                });
            }

            // Luego agregar las demás ordenadas
            otherImages.forEach(img => {
                images.push({
                    url: img.imageUrl,
                    isMain: img.isMain,
                    id: img.id,
                    displayOrder: img.displayOrder
                });
            });
        }

        // Solo agrega MainImageUrl si NO está en images
        if (product.mainImageUrl && !images.some(img => img.url === product.mainImageUrl)) {
            images.unshift({
                url: product.mainImageUrl,
                isMain: true,
                id: 'main',
                displayOrder: -1
            });
        }

        // Si no hay imágenes, usar placeholder
        if (images.length === 0) {
            images.push({
                url: `https://picsum.photos/600/600?random=${product.id}`,
                isMain: true,
                id: 'placeholder',
                displayOrder: 0
            });
        }

        return images;
    };

    const displayImages = getDisplayImages();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <NavBar />
                <div className="max-w-7xl mx-auto bg-white shadow-xl pt-34">
                    <div className="flex items-center justify-center h-96">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin animation-delay-150"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <NavBar />
                <div className="max-w-7xl mx-auto bg-white shadow-xl pt-34">
                    <div className="flex items-center justify-center min-h-96 text-center px-4">
                        <div className="space-y-6">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                                    PRODUCTO NO ENCONTRADO
                                </h2>
                                <p className="text-gray-600 mb-6">{error}</p>
                                <Link
                                    to="/"
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Volver al inicio
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <NavBar />

            {/* Contenedor principal */}
            <div className="max-w-7xl mx-auto bg-white shadow-xl pt-34">
                {/* Breadcrumb gaming */}
                <nav className="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center space-x-2 text-sm">
                        <Link to="/" className="flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Inicio
                        </Link>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-gray-500 capitalize font-medium">{product.category}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-gray-900 font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">{product.name}</span>
                    </div>
                </nav>

                {/* Product Detail */}
                <div className="px-4 sm:px-6 lg:px-8 py-12">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">

                        {/* Image Gallery */}
                        <div className="flex flex-col space-y-4">
                            {/* Category Navigation */}
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <Link
                                    to="/?category="
                                    className="text-purple-600 hover:text-purple-800 font-bold transition-colors hover:underline"
                                >
                                    Todos los productos
                                </Link>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                                <Link
                                    to={`/?category=${encodeURIComponent(product.category)}`}
                                    className="text-purple-600 hover:text-purple-800 font-bold transition-colors hover:underline capitalize"
                                >
                                    {product.category}
                                </Link>
                                {product.brand && (
                                    <>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                        <Link
                                            to={`/?category=${encodeURIComponent(product.category)}&brand=${encodeURIComponent(product.brand)}`}
                                            className="text-purple-600 hover:text-purple-800 font-bold transition-colors hover:underline"
                                        >
                                            {product.category} {product.brand}
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Main Image */}
                            <div className="relative">
                                <div className="rounded-2xl overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 z-10"></div>

                                    <Swiper
                                        modules={[Navigation]}
                                        spaceBetween={10}
                                        slidesPerView={1}
                                        navigation={{
                                            nextEl: '.swiper-button-next-custom',
                                            prevEl: '.swiper-button-prev-custom',
                                        }}
                                        onSwiper={(swiper) => swiperRef.current = swiper}
                                        onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
                                        className="h-96 lg:h-[500px]"
                                    >
                                        {displayImages.map((image, index) => (
                                            <SwiperSlide key={image.id}>
                                                <img
                                                    src={productService.getImageUrl(image.url)}
                                                    alt={`${product.name} - Imagen ${index + 1}`}
                                                    className="w-full h-full object-contain bg-white p-8"
                                                    onError={(e) => {
                                                        e.target.src = 'https://picsum.photos/600/600?random=' + (product.id + index);
                                                    }}
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>

                                    {displayImages.length > 1 && (
                                        <>
                                            <div className="swiper-button-prev-custom absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/20 backdrop-blur-md text-white rounded-full hidden lg:flex items-center justify-center hover:bg-black/40 transition-all duration-200 cursor-pointer z-20 group">
                                                <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </div>
                                            <div className="swiper-button-next-custom absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/20 backdrop-blur-md text-white rounded-full hidden lg:flex items-center justify-center hover:bg-black/40 transition-all duration-200 cursor-pointer z-20 group">
                                                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {/* Thumbnails (mantén los originales o usa Swiper también) */}
                                {displayImages.length > 1 && (
                                    <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide mt-4">
                                        {displayImages.map((image, index) => (
                                            <button
                                                key={image.id}
                                                onClick={() => {
                                                    setActiveSlide(index);
                                                    swiperRef.current?.slideTo(index);
                                                }}
                                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${activeSlide === index
                                                    ? 'border-purple-500 shadow-lg transform scale-105'
                                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                                    }`}
                                            >
                                                <img
                                                    src={productService.getImageUrl(image.url)}
                                                    alt={`${product.name} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'https://picsum.photos/80/80?random=' + (product.id + index);
                                                    }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product info */}
                        <div className="mt-12 lg:mt-0 space-y-8">
                            {/* Header */}
                            <div className="space-y-4">


                                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                                    {product.name}
                                </h1>

                                <div className="flex items-baseline space-x-4">
                                    <span className="text-3xl lg:text-4xl bg-clip-text">
                                        ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <span className="text-lg text-gray-500 line-through">
                                            ${product.originalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Descripción del producto
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {product.description || 'Producto de alta calidad con especificaciones técnicas avanzadas. Diseñado para ofrecer el máximo rendimiento y durabilidad en aplicaciones exigentes.'}
                                </p>
                            </div>

                            {/* Specs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Disponibilidad</p>
                                            <p className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Notice */}
                            {user?.role === 'Admin' && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-blue-900 mb-2">Modo Administrador</h3>
                                            <p className="text-blue-800 mb-4">
                                                Estás viendo este producto como administrador. Los clientes pueden agregar productos al carrito desde esta vista.
                                            </p>
                                            <Link
                                                to="/admin/products"
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Gestionar productos
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Add to cart - Solo para clientes */}
                            {product.stock > 0 && user?.role !== 'Admin' && (
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                                    <form onSubmit={(e) => { e.preventDefault(); handleAddToCart(); }} className="space-y-6">
                                        <div className="flex items-center space-x-4">
                                            <button
                                                type="submit"
                                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 focus:scale-95 transition-all duration-200 flex items-center justify-center space-x-3 group"
                                            >
                                                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293a1 1 0 001.414 1.414L10 13m0 0v6a2 2 0 002 2h2a2 2 0 002-2v-6m0 0V9a2 2 0 00-2-2H10a2 2 0 00-2 2v4.01" />
                                                </svg>
                                                <span>Sumar al carrito</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Back to products */}
                            <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                                <Link
                                    to="/"
                                    className="inline-flex items-center text-purple-600 hover:text-purple-800 font-bold transition-colors group"
                                >
                                    <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Volver a productos
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }

                .swiper-button-next,
                .swiper-button-prev {
                    display: none !important;
                }
                
                .animation-delay-150 {
                    animation-delay: 150ms;
                }
                
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductDetail;