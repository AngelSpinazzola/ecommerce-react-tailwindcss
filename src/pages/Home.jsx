import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import NavBar from '../components/Common/NavBar';
import HeroSection from '../components/Home/HeroSection';
import SearchFilters from '../components/Home/SearchFilters';
import ProductCard from '../components/Home/ProductCard';
import LoadingSkeleton from '../components/Home/LoadingSkeleton';
import EmptyStates from '../components/Home/EmptyStates';
import toast from 'react-hot-toast';

const Home = () => {
    // State management
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

    // Load initial data
    useEffect(() => {
        loadData();
    }, []);

    // Filter products when parameters change
    useEffect(() => {
        filterProducts();
    }, [allProducts, searchTerm, selectedCategory, priceRange, sortBy]);

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

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(term) ||
                product.description?.toLowerCase().includes(term) ||
                product.category.toLowerCase().includes(term)
            );
        }

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Price filter
        if (priceRange.min !== '') {
            filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
        }
        if (priceRange.max !== '') {
            filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
        }

        // Sort products
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

    const hasActiveFilters = searchTerm || selectedCategory || priceRange.min || priceRange.max || sortBy !== 'name';

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            
            {/* Hero Section */}
            <HeroSection products={allProducts.slice(0, 5)} />

            {/* Search and Filters */}
            <SearchFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                sortBy={sortBy}
                setSortBy={setSortBy}
                categories={categories}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                productsCount={products.length}
                hasActiveFilters={hasActiveFilters}
                clearFilters={clearFilters}
            />

            {/* Products Section */}
            <section className="bg-white py-16 sm:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    
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
                        <>
                            {/* Products grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8">
                                {products.map((product, index) => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
                                        index={index}
                                    />
                                ))}
                            </div>

                            {/* Newsletter section */}
                            {products.length >= 8 && (
                                <div className="mt-20 text-center">
                                    <div className="max-w-2xl mx-auto">
                                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            Mantente al día
                                        </h3>
                                        <p className="text-gray-600 mb-8">
                                            Recibe las últimas noticias sobre nuevos productos, ofertas especiales y tendencias.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                            <input
                                                type="email"
                                                placeholder="Tu email"
                                                className="flex-1 px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                                            />
                                            <button className="bg-gray-900 text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors">
                                                Suscribirse
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Company info */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-white text-gray-900 rounded flex items-center justify-center">
                                    <span className="font-bold text-lg">N</span>
                                </div>
                                <span className="text-xl font-bold">Nova</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Tu tienda online de confianza. Productos únicos, calidad excepcional y 
                                un servicio al cliente que supera expectativas.
                            </p>
                        </div>

                        {/* Quick links */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-white">Enlaces rápidos</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Sobre nosotros</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                            </ul>
                        </div>

                        {/* Categories */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-white">Categorías</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                {categories.slice(0, 4).map((category) => (
                                    <li key={category}>
                                        <button 
                                            onClick={() => setSelectedCategory(category)}
                                            className="hover:text-white transition-colors"
                                        >
                                            {category}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact info */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-white">Contacto</h4>
                            <div className="space-y-2 text-gray-400 text-sm">
                                <p>Email: info@tiendanova.com</p>
                                <p>Teléfono: +1 (555) 123-4567</p>
                                <p>Horario: Lun-Vie 9:00-18:00</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom footer */}
                    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
                        <p>© 2024 TiendaNova. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>

            {/* Custom CSS */}
            <style jsx>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out both;
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