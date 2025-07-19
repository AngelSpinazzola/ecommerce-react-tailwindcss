import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import NavBar from '../components/Common/NavBar';
import ProductCard from '../components/Home/ProductCard';
import LoadingSkeleton from '../components/Home/LoadingSkeleton';
import EmptyStates from '../components/Home/EmptyStates';
import toast from 'react-hot-toast';

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
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [allProducts, searchTerm, selectedCategory, priceRange, sortBy]);

    // Auto-slide effect
    useEffect(() => {
        if (featuredProducts.length > 0) {
            const timer = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % Math.ceil(featuredProducts.length / getSlidesPerView()));
            }, 4000);
            return () => clearInterval(timer);
        }
    }, [featuredProducts]);

    const getSlidesPerView = () => {
        if (typeof window === 'undefined') return 1;
        if (window.innerWidth >= 1024) return 4; // lg
        if (window.innerWidth >= 768) return 3;  // md
        if (window.innerWidth >= 640) return 2;  // sm
        return 1; // mobile
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [productsData, categoriesData] = await Promise.all([
                productService.getAllProducts(),
                productService.getCategories()
            ]);

            setAllProducts(productsData);
            setProducts(productsData);
            setCategories(categoriesData);
            
            // Productos destacados (primeros 8 para el slider)
            setFeaturedProducts(productsData.slice(0, 8));
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

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(term) ||
                product.description?.toLowerCase().includes(term) ||
                product.category.toLowerCase().includes(term)
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(product => product.category === selectedCategory);
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
        setPriceRange({ min: '', max: '' });
        setSortBy('name');
        setShowFilters(false);
    };

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % Math.ceil(featuredProducts.length / getSlidesPerView()));
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + Math.ceil(featuredProducts.length / getSlidesPerView())) % Math.ceil(featuredProducts.length / getSlidesPerView()));
    };

    const hasActiveFilters = searchTerm || selectedCategory || priceRange.min || priceRange.max || sortBy !== 'name';

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showSearch={true}
            />
            
            {/* Featured Products Slider */}
            <section className="bg-white pt-20 pb-8 sm:pt-24 sm:pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Productos <span className="text-amber-600">Destacados</span>
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                            Descubre nuestros productos más populares seleccionados especialmente para ti
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-gray-200 rounded-2xl h-80 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Slider Container */}
                            <div className="overflow-hidden">
                                <div 
                                    className="flex transition-transform duration-500 ease-in-out"
                                    style={{
                                        transform: `translateX(-${currentSlide * 100}%)`
                                    }}
                                >
                                    {Array.from({ length: Math.ceil(featuredProducts.length / getSlidesPerView()) }).map((_, slideIndex) => (
                                        <div key={slideIndex} className="w-full flex-shrink-0">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                                {featuredProducts
                                                    .slice(slideIndex * getSlidesPerView(), (slideIndex + 1) * getSlidesPerView())
                                                    .map((product, index) => (
                                                        <div key={product.id} className="transform hover:scale-105 transition-transform duration-300">
                                                            <ProductCard product={product} index={index} />
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation Arrows - Hidden on mobile */}
                            {featuredProducts.length > getSlidesPerView() && (
                                <>
                                    <button
                                        onClick={prevSlide}
                                        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white shadow-lg rounded-full items-center justify-center text-gray-600 hover:text-amber-600 hover:shadow-xl transition-all duration-300 z-10"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white shadow-lg rounded-full items-center justify-center text-gray-600 hover:text-amber-600 hover:shadow-xl transition-all duration-300 z-10"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            )}

                            {/* Dots Indicator */}
                            {featuredProducts.length > getSlidesPerView() && (
                                <div className="flex justify-center mt-8 space-x-2">
                                    {Array.from({ length: Math.ceil(featuredProducts.length / getSlidesPerView()) }).map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                currentSlide === index 
                                                    ? 'bg-amber-600 w-8' 
                                                    : 'bg-gray-300 hover:bg-gray-400'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Filters Section */}
            <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors sm:hidden"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                                Filtros
                            </button>
                            
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">{products.length}</span> productos encontrados
                            </div>
                        </div>

                  
                    </div>

                    {/* Mobile Filters */}
                    {showFilters && (
                        <div className="sm:hidden mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            >
                                <option value="name">Nombre A-Z</option>
                                <option value="price-asc">Precio: Menor a Mayor</option>
                                <option value="price-desc">Precio: Mayor a Menor</option>
                                <option value="stock">Más Stock</option>
                            </select>

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    placeholder="Precio mín."
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Precio máx."
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="w-full py-2 text-amber-600 hover:text-amber-700 font-medium"
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* All Products Section */}
            <section className="bg-white py-8 sm:py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Todos los Productos
                        </h3>
                        <p className="text-gray-600">
                            Explora nuestra colección completa
                        </p>
                    </div>
                    
                    {loading ? (
                        <LoadingSkeleton count={8} />
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
            <footer className="bg-gray-900 text-white py-8 sm:py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
                        {/* Company info */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="font-bold text-lg text-white">GT</span>
                                </div>
                                <div>
                                    <span className="text-lg sm:text-xl font-bold">Game</span>
                                    <span className="text-amber-400 italic ml-1">Tech</span>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Tu tienda gaming de confianza. Hardware de alto rendimiento y periféricos profesionales.
                            </p>
                        </div>
                    </div>

                    {/* Bottom footer */}
                    <div className="border-t border-gray-800 mt-8 pt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            © 2024 GameTech. Todos los derechos reservados. Made with ❤️ for gamers. Sitio web desarrollado por Angel Spinazzola.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;