import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { productService } from '../services/productService';
import NavBar from '../components/Common/NavBar';
import SecondaryNavBar from '../components/Common/SecondaryNavBar';
import ProductCard from '../components/Home/ProductCard';
import LoadingSkeleton from '../components/Home/LoadingSkeleton';
import EmptyStates from '../components/Home/EmptyStates';
import toast from 'react-hot-toast';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('name');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // Obtener filtros de URL
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const categoryFromUrl = urlParams.get('category');
        const brandFromUrl = urlParams.get('brand');

        setSelectedCategory(categoryFromUrl || '');
        setSelectedBrand(brandFromUrl || '');
    }, [location.search]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [allProducts, searchTerm, selectedCategory, selectedBrand, priceRange, sortBy]);

    // Auto-slide effect
    useEffect(() => {
        if (featuredProducts.length > 0) {
            const timer = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % Math.ceil(featuredProducts.length / getSlidesPerView()));
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [featuredProducts]);

    const getSlidesPerView = () => {
        if (typeof window === 'undefined') return 1;
        if (window.innerWidth >= 1280) return 5;
        if (window.innerWidth >= 1024) return 4;
        if (window.innerWidth >= 768) return 3;
        if (window.innerWidth >= 640) return 2;
        return 1;
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [productsResponse, categoriesResponse] = await Promise.all([
                productService.getAllProducts(),
                productService.getCategories()
            ]);

            let productsData;
            if (productsResponse?.data && Array.isArray(productsResponse.data)) {
                productsData = productsResponse.data;
            } else if (Array.isArray(productsResponse)) {
                productsData = productsResponse;
            } else {
                productsData = [];
            }

            const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : [];

            setAllProducts(productsData);
            setProducts(productsData);
            setCategories(categoriesData);
            setFeaturedProducts(Array.isArray(productsData) ? productsData.slice(0, 10) : []);

        } catch (err) {
            setError('Error al cargar los datos');
            toast.error('Error al cargar los productos');
            console.error('Error loading data:', err);

            setAllProducts([]);
            setProducts([]);
            setCategories([]);
            setFeaturedProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = [...allProducts];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(term) ||
                product.description?.toLowerCase().includes(term) ||
                product.category.toLowerCase().includes(term) ||
                product.brand?.toLowerCase().includes(term)
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        if (selectedBrand) {
            filtered = filtered.filter(product => product.brand === selectedBrand);
        }

        if (priceRange.min !== '') {
            filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
        }
        if (priceRange.max !== '') {
            filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
        }

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
        setSelectedBrand('');
        setPriceRange({ min: '', max: '' });
        setSortBy('name');
        setShowFilters(false);
        window.history.pushState({}, '', '/');
    };

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % Math.ceil(featuredProducts.length / getSlidesPerView()));
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + Math.ceil(featuredProducts.length / getSlidesPerView())) % Math.ceil(featuredProducts.length / getSlidesPerView()));
    };

    const hasActiveFilters = searchTerm || selectedCategory || selectedBrand || priceRange.min || priceRange.max || sortBy !== 'name';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <NavBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showSearch={true}
            />
            <div className="hidden md:block">
                <SecondaryNavBar />
            </div>

            {/* Contenedor principal centrado con fondo blanco a los lados */}
            <div className="max-w-7xl mx-auto bg-white shadow-xl pt-48">
                {/* Hero Section */}
                <section className="relative h-[70vh] md:h-[60vh] lg:h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900/30 via-gray-900 to-blue-900/30">
                    {/* Background with animated gradient */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: `repeating-linear-gradient(
                                0deg,
                                transparent,
                                transparent 59px,
                                rgba(255, 255, 255, 0.05) 59px,
                                rgba(255, 255, 255, 0.05) 60px
                            ),
                            repeating-linear-gradient(
                                90deg,
                                transparent,
                                transparent 59px,
                                rgba(255, 255, 255, 0.05) 59px,
                                rgba(255, 255, 255, 0.05) 60px
                            )`
                        }}></div>
                    </div>

                    {/* Animated RGB lines */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-pulse"></div>

                    {/* Content */}
                    <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient">
                                NEXT-GEN
                            </span>
                            <br />
                            <span className="text-white">HARDWARE</span>
                        </h1>
                        <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 md:mb-8 font-light">
                            Componentes premium para builds extremos
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                            <button
                                onClick={() => document.getElementById('featured-products').scrollIntoView({ behavior: 'smooth' })}
                                className="group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-base md:text-lg overflow-hidden transition-all duration-300 hover:scale-105"
                            >
                                <span className="relative z-10">Explorar Productos</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                            <button className="px-6 md:px-8 py-3 md:py-4 border-2 border-purple-500 rounded-full font-bold text-base md:text-lg hover:bg-purple-500/20 transition-all duration-300">
                                Ver Ofertas
                            </button>
                        </div>
                    </div>

                    {/* Animated particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float opacity-50"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 5}s`,
                                    animationDuration: `${5 + Math.random() * 10}s`
                                }}
                            />
                        ))}
                    </div>
                </section>

                {/* Featured Products */}
                <section id="featured-products" className="relative py-20 px-4 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-black mb-4">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                                    PRODUCTOS DESTACADOS
                                </span>
                            </h2>
                            <p className="text-gray-600 text-lg">Hardware de élite para gamers exigentes</p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="bg-gray-100 rounded-2xl h-96 animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="overflow-hidden">
                                    <div
                                        className="flex transition-transform duration-500 ease-out"
                                        style={{
                                            transform: `translateX(-${currentSlide * 100}%)`
                                        }}
                                    >
                                        {Array.from({ length: Math.ceil(featuredProducts.length / getSlidesPerView()) }).map((_, slideIndex) => (
                                            <div key={slideIndex} className="w-full flex-shrink-0">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                                    {featuredProducts
                                                        .slice(slideIndex * getSlidesPerView(), (slideIndex + 1) * getSlidesPerView())
                                                        .map((product, index) => (
                                                            <div key={product.id} className="group">
                                                                <ProductCard product={product} index={index} />
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Navigation */}
                                {featuredProducts.length > getSlidesPerView() && (
                                    <>
                                        <button
                                            onClick={prevSlide}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-purple-600/80 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-all duration-300 group"
                                        >
                                            <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={nextSlide}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-purple-600/80 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-all duration-300 group"
                                        >
                                            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}

                                {/* Dots */}
                                {featuredProducts.length > getSlidesPerView() && (
                                    <div className="flex justify-center mt-8 space-x-2">
                                        {Array.from({ length: Math.ceil(featuredProducts.length / getSlidesPerView()) }).map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentSlide(index)}
                                                className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index
                                                        ? 'bg-purple-500 w-8'
                                                        : 'bg-gray-300 w-2 hover:bg-gray-400'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Filters Bar */}
                <section className="sticky top-26 z-40 bg-white/95 backdrop-blur-md border-y border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                    </svg>
                                    Filtros
                                </button>
                                <span className="text-gray-600">
                                    <span className="text-purple-600 font-bold">{products.length}</span> productos
                                </span>
                            </div>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            >
                                <option value="name">Nombre A-Z</option>
                                <option value="price-asc">Precio: Menor a Mayor</option>
                                <option value="price-desc">Precio: Mayor a Menor</option>
                                <option value="stock">Más Stock</option>
                            </select>
                        </div>

                        {/* Mobile Filters */}
                        {showFilters && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:border-purple-500"
                                    >
                                        <option value="">Todas las categorías</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        placeholder="Precio mínimo"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:border-purple-500"
                                    />

                                    <input
                                        type="number"
                                        placeholder="Precio máximo"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:border-purple-500"
                                    />

                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            Limpiar filtros
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* All Products */}
                <section id="all-products-section" className="py-20 px-4 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl md:text-4xl font-black mb-2 text-gray-900">
                                TODOS LOS PRODUCTOS
                            </h3>
                            <p className="text-gray-600">Encuentra el hardware perfecto para tu build</p>
                        </div>

                        {loading ? (
                            <LoadingSkeleton count={12} />
                        ) : error ? (
                            <EmptyStates
                                type="error"
                                onRetry={loadData}
                            />
                        ) : products.length === 0 ? (
                            <EmptyStates
                                type="no-results"
                                hasActiveFilters={hasActiveFilters}
                                onClearFilters={clearFilters}
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product, index) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        index={index}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-16">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                            {/* Logo */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 font-black text-lg">GT</span>
                                            </div>
                                        </div>
                                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-xl blur opacity-30"></div>
                                    </div>
                                    <div>
                                        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">GAMETECH</span>
                                        <div className="text-xs text-purple-500 font-medium -mt-1">HARDWARE STORE</div>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Hardware premium para builds extremos. Tu partner tecnológico de confianza.
                                </p>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="font-bold text-purple-600 mb-4">Productos</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li><a href="#" className="hover:text-purple-600 transition-colors">Procesadores</a></li>
                                    <li><a href="#" className="hover:text-purple-600 transition-colors">Tarjetas Gráficas</a></li>
                                    <li><a href="#" className="hover:text-purple-600 transition-colors">Memorias</a></li>
                                    <li><a href="#" className="hover:text-purple-600 transition-colors">Almacenamiento</a></li>
                                </ul>
                            </div>

                            {/* Support */}
                            <div>
                                <h4 className="font-bold text-purple-600 mb-4">Soporte</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li><a href="#" className="hover:text-purple-600 transition-colors">Centro de Ayuda</a></li>
                                    <li><a href="#" className="hover:text-purple-600 transition-colors">Garantías</a></li>
                                    <li><a href="#" className="hover:text-purple-600 transition-colors">Envíos</a></li>
                                    <li><a href="#" className="hover:text-purple-600 transition-colors">Devoluciones</a></li>
                                </ul>
                            </div>

                            {/* Newsletter */}
                            <div>
                                <h4 className="font-bold text-purple-600 mb-4">Newsletter</h4>
                                <p className="text-sm text-gray-600 mb-4">Suscríbete para ofertas exclusivas</p>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="tu@email.com"
                                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:border-purple-500"
                                    />
                                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                        →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom */}
                        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-500 text-sm">
                                © 2024 GameTech. Todos los derechos reservados.
                            </p>
                            <div className="flex items-center gap-6">
                                <a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            <style>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Home;