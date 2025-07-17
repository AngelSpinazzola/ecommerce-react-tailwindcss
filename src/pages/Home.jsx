import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import NavBar from '../components/Common/NavBar';
import toast from 'react-hot-toast';

const ModernHeroCarousel = ({ products }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (products.length === 0) return;

        const timer = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentSlide((prev) => (prev + 1) % Math.min(products.length, 6));
                setIsTransitioning(false);
            }, 150);
        }, 5000);

        return () => clearInterval(timer);
    }, [products]);

    if (!products || products.length === 0) {
        return (
            <div className="relative h-full rounded-3xl bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
                <div className="relative h-full flex items-center justify-center">
                    <div className="text-white/80 text-center">
                        <div className="animate-pulse">
                            <svg className="w-20 h-20 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                            </svg>
                        </div>
                        <p className="text-xl font-light">Cargando productos increíbles...</p>
                    </div>
                </div>
            </div>
        );
    }

    const displayProducts = products.slice(0, 6);
    const currentProduct = displayProducts[currentSlide];

    if (!currentProduct) return null;

    const handleSlideChange = (index) => {
        if (index !== currentSlide) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentSlide(index);
                setIsTransitioning(false);
            }, 150);
        }
    };

    return (
        <div className="relative h-full rounded-3xl overflow-hidden group">
            {/* Fondo con gradiente animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            {/* Efectos de luz */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

            {/* Slide actual */}
            <Link to={`/product/${currentProduct.id}`} className="block h-full relative">
                <div className="h-full flex items-center justify-center p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
                        {/* Imagen del producto */}
                        <div className="relative">
                            <div className={`transition-all duration-500 ${isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
                                <div className="relative">
                                    <img
                                        src={productService.getImageUrl(currentProduct.mainImageUrl)}
                                        alt={currentProduct.name}
                                        className="w-full h-80 lg:h-96 object-cover rounded-2xl shadow-2xl"
                                        onError={(e) => {
                                            e.target.src = 'https://picsum.photos/500/400?random=' + currentProduct.id;
                                        }}
                                    />
                                    {/* Efecto de brillo */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
                                </div>
                            </div>
                        </div>

                        {/* Contenido del producto */}
                        <div className={`text-white transition-all duration-500 ${isTransitioning ? 'translate-x-8 opacity-0' : 'translate-x-0 opacity-100'}`}>
                            <div className="space-y-6">
                                <div>
                                    <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/90 mb-4">
                                        {currentProduct.category}
                                    </div>
                                    <h3 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                                        {currentProduct.name}
                                    </h3>
                                    <p className="text-xl text-white/80 mb-6 leading-relaxed">
                                        {currentProduct.description || "Producto de alta calidad con las mejores características del mercado."}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <div className="text-5xl font-semibold text-white">
                                        ${currentProduct.price.toFixed(2)}
                                    </div>
                                </div>

                                <button className="group/btn bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105">
                                    <span className="flex items-center space-x-2">
                                        <span>Ver Producto</span>
                                        <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Indicadores modernos */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                    {displayProducts.map((_, index) => (
                        <button
                            key={`indicator-${index}`}
                            onClick={() => handleSlideChange(index)}
                            className={`transition-all duration-300 ${
                                index === currentSlide 
                                    ? 'w-8 h-2 bg-white rounded-full' 
                                    : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/70'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Controles de navegación */}
            <button
                onClick={() => handleSlideChange((currentSlide - 1 + displayProducts.length) % displayProducts.length)}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm border border-white/20 text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={() => handleSlideChange((currentSlide + 1) % displayProducts.length)}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm border border-white/20 text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

const Home = () => {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('name');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [allProducts, searchTerm, selectedCategory, priceRange, sortBy]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                productService.getAllProducts(),
                productService.getCategories()
            ]);

            setAllProducts(productsData);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (err) {
            setError('Error al cargar los datos');
            toast.error('Error al cargar los productos');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = [...allProducts];

        // Filtrar por búsqueda
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(term) ||
                product.description?.toLowerCase().includes(term) ||
                product.category.toLowerCase().includes(term)
            );
        }

        // Filtrar por categoría
        if (selectedCategory) {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Filtrar por precio
        if (priceRange.min !== '') {
            filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
        }
        if (priceRange.max !== '') {
            filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
        }

        // Ordenar
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'stock':
                    return b.stock - a.stock;
                default:
                    return 0;
            }
        });

        setProducts(filtered);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setPriceRange({ min: '', max: '' });
        setSortBy('name');
        setShowFilters(false);
        toast.success('Filtros limpiados');
    };

    const hasActiveFilters = searchTerm || selectedCategory || priceRange.min || priceRange.max || sortBy !== 'name';

    const ProductCard = ({ product }) => (
        <Link
            to={`/product/${product.id}`}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 hover:bg-white"
        >
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                <img
                    src={productService.getImageUrl(product.mainImageUrl)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                        e.target.src = 'https://picsum.photos/400/400?random=' + product.id;
                    }}
                />
                {/* Efecto de brillo al hacer hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                
                {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                        ¡Últimos {product.stock}!
                    </div>
                )}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                            Sin Stock
                        </span>
                    </div>
                )}
            </div>
            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 line-clamp-2 text-base leading-tight group-hover:text-blue-600 transition-colors">
                        {product.name}
                    </h3>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-semibold">
                            ${product.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 capitalize font-medium">
                            {product.category}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );

    const SkeletonCard = () => (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
            <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                <div className="flex justify-between">
                    <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pt-16">
            <NavBar />
            
            {/* Hero Section Moderno */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Fondo con gradiente dinámico */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
                
                {/* Efectos de luz animados */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                {/* Contenido principal */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[80vh]">
                       

                        {/* Carrusel moderno */}
                        <div className="lg:col-span-7">
                            <div className="h-[70vh] lg:h-[80vh]">
                                <ModernHeroCarousel products={allProducts.slice(0, 6)} />
                            </div>
                        </div>

                         {/* Contenido izquierdo */}
                        <div className="lg:col-span-5 text-center lg:text-left space-y-8">
                            <div className="space-y-6">
                                <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 font-medium">
                                    ✨ Descubre lo extraordinario
                                </div>
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                                    <span className="block">Tienda</span>
                                    <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                        Nova
                                    </span>
                                </h1>
                                <p className="text-xl sm:text-2xl text-white/80 leading-relaxed max-w-xl">
                                    Experimenta una nueva forma de comprar. Productos únicos, 
                                    calidad excepcional y una experiencia que te sorprenderá.
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button
                                    onClick={() => document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' })}
                                    className="group bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                                >
                                    <span className="flex items-center justify-center space-x-2">
                                        <span>Explorar Ahora</span>
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </button>
                                <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300">
                                    Ver Ofertas
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Indicador de scroll */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* Sección de búsqueda mejorada */}
            <section id="search-section" className="relative py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                        {/* Búsqueda principal */}
                        <div className="relative mb-8">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="¿Qué producto buscas hoy?"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-12 py-6 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg font-medium placeholder-gray-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                                />
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 pr-5 flex items-center hover:bg-gray-100 rounded-r-2xl transition-colors"
                                    >
                                        <svg className="h-6 w-6 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Resultados y filtros */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-600 font-medium">
                                        <span className="font-bold text-gray-900 text-lg">{products.length}</span> productos encontrados
                                    </span>
                                </div>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="sm:hidden flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                                </svg>
                                Filtros
                            </button>
                        </div>

                        {/* Filtros mejorados */}
                        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${showFilters ? 'block' : 'hidden sm:grid'}`}>
                            {/* Categorías */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Categoría</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm font-medium"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category} className="capitalize">
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Rango de precios */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Rango de precio</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        placeholder="Mínimo"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                        className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm font-medium"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Máximo"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                        className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* Ordenamiento */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Ordenar por</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm font-medium"
                                >
                                    <option value="name">Nombre A-Z</option>
                                    <option value="price-asc">Precio: Menor a Mayor</option>
                                    <option value="price-desc">Precio: Mayor a Menor</option>
                                    <option value="stock">Más Stock</option>
                                </select>
                            </div>

                            {/* Acciones móviles */}
                            <div className="sm:hidden space-y-3">
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
                                >
                                    Aplicar Filtros
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold"
                                >
                                    Limpiar Todo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid de productos mejorado */}
            <section className="relative py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {[...Array(8)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-2xl border border-white/20">
                                <div className="text-red-500 mb-6">
                                    <svg className="mx-auto h-20 w-20 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-2xl font-bold text-gray-900 mb-4">{error}</p>
                                    <p className="text-gray-600 mb-8">No pudimos cargar los productos en este momento</p>
                                </div>
                                <button
                                    onClick={loadData}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg"
                                >
                                    Intentar de Nuevo
                                </button>
                            </div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 max-w-lg mx-auto shadow-2xl border border-white/20">
                                <svg className="mx-auto h-24 w-24 text-gray-300 mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">¡Ups! No encontramos nada</h3>
                                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                    {hasActiveFilters
                                        ? 'Intenta ajustar los filtros o buscar algo diferente para descubrir productos increíbles'
                                        : 'Parece que no hay productos disponibles en este momento, pero regresa pronto'
                                    }
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg"
                                    >
                                        Ver Todos los Productos
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header de resultados */}
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                                    Productos Destacados
                                </h2>
                                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                    Descubre nuestra selección curada de productos excepcionales
                                </p>
                            </div>

                            {/* Grid de productos */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {products.map((product, index) => (
                                    <div 
                                        key={product.id}
                                        className="animate-fade-in-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>

                            {/* Call to action */}
                            {products.length >= 8 && (
                                <div className="text-center mt-16">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
                                        <h3 className="text-2xl font-bold mb-4">¿Te gusta lo que ves?</h3>
                                        <p className="text-blue-100 mb-6 text-lg">
                                            Únete a miles de clientes satisfechos y descubre por qué somos su tienda favorita
                                        </p>
                                        <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors transform hover:scale-105 shadow-lg">
                                            Explorar Más Productos
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Footer moderno */}
            <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white mt-32 overflow-hidden">
                {/* Efectos de fondo */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        {/* Logo y título */}
                        <div className="mb-8">
                            <h3 className="text-4xl font-bold mb-4">
                                <span className="text-white">Tienda</span>
                                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Nova</span>
                            </h3>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                Redefiniendo la experiencia de compra online con productos excepcionales 
                                y un servicio que supera expectativas
                            </p>
                        </div>

                        {/* Enlaces sociales imaginarios */}
                        <div className="flex justify-center space-x-6 mb-8">
                            {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                                <button 
                                    key={social}
                                    className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                                >
                                    <span className="sr-only">{social}</span>
                                    <div className="w-5 h-5 bg-white/60 rounded"></div>
                                </button>
                            ))}
                        </div>

                        {/* Copyright */}
                        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400">
                            <span>© 2024 TiendaNova</span>
                            <span className="hidden sm:block">•</span>
                            <span>Innovación en cada compra</span>
                            <span className="hidden sm:block">•</span>
                            <span>Hecho con ❤️ para nuestros clientes</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Estilos CSS personalizados */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%) skewX(-12deg); }
                    100% { transform: translateX(200%) skewX(-12deg); }
                }
                
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out both;
                }
                
                .line-clamp-1 {
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default Home;