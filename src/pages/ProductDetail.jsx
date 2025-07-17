import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import NavBar from '../components/Common/NavBar';
import toast from 'react-hot-toast';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
        addToCart(product, quantity);
        toast.success(`${quantity} x ${product.name} agregado al carrito 🛒`, {
            position: 'top-center',
        });
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

            console.log('🔍 Raw product.images:', product.images);
            console.log('🔍 product.mainImageUrl:', product.mainImageUrl);
            console.log('🔍 validImages after filter:', validImages);
            console.log('🔍 mainImage found:', mainImage);
            console.log('🔍 otherImages found:', otherImages);
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

        console.log('🖼️ Display images:', images);

        return images;
    };

    const displayImages = getDisplayImages();

    useEffect(() => {
        if (displayImages.length > 0) {
            // Siempre iniciar en 0 porque ahora la imagen principal es la primera
            setCurrentImageIndex(0);
        }
    }, [product]);

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === displayImages.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? displayImages.length - 1 : prev - 1
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        to="/"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gray-50 pt-24 md:pt-28 lg:pt-32">



                {/* Breadcrumb */}
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-2 text-sm">
                        <Link to="/" className="text-indigo-600 hover:text-indigo-800">
                            Inicio
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500 capitalize">{product.category}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-medium">{product.name}</span>
                    </div>
                </nav>

                {/* Product Detail */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">

                        {/* Image Gallery */}
                        <div className="flex flex-col">
                            {/* Main Image */}
                            <div className="relative w-full bg-gray-200 rounded-lg overflow-hidden mb-4">
                                <img
                                    src={productService.getImageUrl(displayImages[currentImageIndex]?.url)}
                                    alt={product.name}
                                    className="w-full h-96 object-contain bg-white rounded-lg shadow-sm"
                                    onError={(e) => {
                                        e.target.src = 'https://picsum.photos/600/600?random=' + product.id;
                                    }}
                                />

                                {/* Navigation arrows - solo si hay más de 1 imagen */}
                                {displayImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}

                                {/* Image counter */}
                                {displayImages.length > 1 && (
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                        {currentImageIndex + 1} / {displayImages.length}
                                    </div>
                                )}
                            </div>

                            {/* Image Thumbnails - solo si hay más de 1 imagen */}
                            {displayImages.length > 1 && (
                                <div className="flex space-x-2 overflow-x-auto pb-2">
                                    {displayImages.map((image, index) => (
                                        <button
                                            key={image.id}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${currentImageIndex === index
                                                ? 'border-indigo-600'
                                                : 'border-gray-300 hover:border-gray-400'
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

                        {/* Product info */}
                        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                                {product.name}
                            </h1>

                            <div className="mt-3">
                                <h2 className="sr-only">Información del producto</h2>
                                <p className="text-3xl text-gray-900">${product.price.toFixed(2)}</p>
                            </div>

                            {/* Category */}
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-900">Categoría</h3>
                                <span className="mt-1 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 capitalize">
                                    {product.category}
                                </span>
                            </div>

                            {/* Description */}
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-900">Descripción</h3>
                                <div className="mt-4 text-base text-gray-700">
                                    <p>{product.description || 'Sin descripción disponible.'}</p>
                                </div>
                            </div>

                            {/* Stock */}
                            <div className="mt-6">
                                <div className="flex items-center">
                                    <h3 className="text-sm font-medium text-gray-900">Disponibilidad:</h3>
                                    <span className={`ml-2 text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {product.stock > 0 ? `${product.stock} unidades en stock` : 'Sin stock'}
                                    </span>
                                </div>
                            </div>

                            {/* Mensaje para admins */}
                            {user?.role === 'Admin' && (
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                    <div className="flex">
                                        <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <h3 className="text-sm font-medium text-blue-800">Modo Administrador</h3>
                                            <p className="text-sm text-blue-700">
                                                Estás viendo este producto como administrador. Solo los clientes pueden agregar productos al carrito.
                                            </p>
                                            <div className="mt-2">
                                                <Link
                                                    to="/admin/products"
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                                >
                                                    Gestionar productos →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Add to cart - Solo para clientes */}
                            {product.stock > 0 && user?.role !== 'Admin' && (
                                <form className="mt-10" onSubmit={(e) => { e.preventDefault(); handleAddToCart(); }}>
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-900">
                                                Cantidad
                                            </label>
                                            <select
                                                id="quantity"
                                                value={quantity}
                                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                                className="mt-1 block w-20 rounded-md border border-gray-300 py-2 px-3 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                                            >
                                                {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>
                                                        {i + 1}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            type="submit"
                                            className="flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Agregar al carrito
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Back to products */}
                            <div className="mt-8">
                                <Link
                                    to="/"
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                >
                                    ← Volver a productos
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetail;