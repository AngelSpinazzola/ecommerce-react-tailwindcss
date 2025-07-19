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
        <div className="min-h-screen bg-gray-900">
            <NavBar />
            
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300f5ff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>
                
                <div className="relative z-10 pt-24 pb-16 sm:pt-32 sm:pb-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                    Level Up
                                </span>
                                <br />
                                Tu Gaming Setup
                            </h1>
                            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                                Descubre los mejores productos gaming y tecnología. 
                                Desde hardware de alto rendimiento hasta periféricos de élite.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={() => setSelectedCategory('Gaming')}
                                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-8 py-4 rounded-lg text-lg font-bold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105"
                                >
                                    Explorar Gaming
                                </button>
                                <button 
                                    onClick={() => setSelectedCategory('Hardware')}
                                    className="border-2 border-cyan-400 text-cyan-400 px-8 py-4 rounded-lg text-lg font-bold hover:bg-cyan-400 hover:text-black transition-all duration-300"
                                >
                                    Ver Hardware
                                </button>
                            </div>
                        </div>

                        {/* Featured Stats */}
                        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            {[
                                { number: '500+', label: 'Productos', icon: '🎮' },
                                { number: '50+', label: 'Marcas Top', icon: '⭐' },
                                { number: '24h', label: 'Envío Express', icon: '🚀' },
                                { number: '2 Años', label: 'Garantía', icon: '🛡️' }
                            ].map((stat, index) => (
                                <div key={index} className="text-center p-4 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700">
                                    <div className="text-2xl mb-2">{stat.icon}</div>
                                    <div className="text-2xl font-bold text-cyan-400">{stat.number}</div>
                                    <div className="text-gray-300 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

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

            {/* Categories Banner */}
            <section className="bg-gray-800 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-white text-center mb-8">
                        Categorías <span className="text-cyan-400">Gaming</span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { 
                                name: 'Gaming', 
                                icon: '🎮', 
                                desc: 'Sillas, escritorios y accesorios',
                                color: 'from-purple-500 to-pink-500'
                            },
                            { 
                                name: 'Hardware', 
                                icon: '💻', 
                                desc: 'GPUs, CPUs, RAM y más',
                                color: 'from-blue-500 to-cyan-500'
                            },
                            { 
                                name: 'Periféricos', 
                                icon: '⌨️', 
                                desc: 'Teclados, mouse, auriculares',
                                color: 'from-green-500 to-emerald-500'
                            },
                            { 
                                name: 'Streaming', 
                                icon: '📹', 
                                desc: 'Cámaras, micrófonos, luces',
                                color: 'from-orange-500 to-red-500'
                            }
                        ].map((category, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedCategory(category.name)}
                                className="group p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-cyan-400 transition-all duration-300 transform hover:scale-105"
                            >
                                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center text-2xl`}>
                                    {category.icon}
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors">
                                    {category.name}
                                </h3>
                                <p className="text-gray-400 text-sm">{category.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section className="bg-gray-900 py-16 sm:py-20">
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
                                    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl border border-gray-600">
                                        <div className="text-4xl mb-4">🎮</div>
                                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                            ¡Únete a la <span className="text-cyan-400">GameTech</span> Community!
                                        </h3>
                                        <p className="text-gray-300 mb-8">
                                            Recibe las últimas noticias sobre lanzamientos gaming, ofertas exclusivas y tips para optimizar tu setup.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                            <input
                                                type="email"
                                                placeholder="tu-email@gamer.com"
                                                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 rounded-lg transition-colors"
                                            />
                                            <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-6 py-3 font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 transform hover:scale-105">
                                                Level Up! 🚀
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-4">
                                            No spam, solo contenido épico gaming 💪
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black text-white py-16 border-t border-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Company info */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 text-black rounded-lg flex items-center justify-center">
                                    <span className="font-bold text-lg">GT</span>
                                </div>
                                <div>
                                    <span className="text-xl font-bold">Game</span>
                                    <span className="text-cyan-400 italic ml-1">Tech</span>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Tu tienda gaming de confianza. Hardware de alto rendimiento, 
                                periféricos profesionales y todo lo que necesitas para dominar el juego.
                            </p>
                            <div className="flex space-x-4">
                                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-cyan-500 hover:text-black cursor-pointer transition-all">
                                    <span>📱</span>
                                </div>
                                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-cyan-500 hover:text-black cursor-pointer transition-all">
                                    <span>🐦</span>
                                </div>
                                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-cyan-500 hover:text-black cursor-pointer transition-all">
                                    <span>📺</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick links */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-white">Enlaces rápidos</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Sobre nosotros</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Contacto</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">FAQ</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Términos de Servicio</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Política de Privacidad</a></li>
                            </ul>
                        </div>

                        {/* Categories */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-white">Categorías Gaming</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                {categories.slice(0, 5).map((category) => (
                                    <li key={category}>
                                        <button 
                                            onClick={() => setSelectedCategory(category)}
                                            className="hover:text-cyan-400 transition-colors flex items-center space-x-2"
                                        >
                                            <span>▶</span>
                                            <span>{category}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact info */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-white">Soporte Gamer</h4>
                            <div className="space-y-3 text-gray-400 text-sm">
                                <div className="flex items-center space-x-2">
                                    <span>📧</span>
                                    <span>support@gametech.com</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span>📞</span>
                                    <span>+1 (555) GAME-TECH</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span>💬</span>
                                    <span>Chat 24/7 disponible</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span>🕒</span>
                                    <span>Lun-Dom: 9:00-22:00</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom footer */}
                    <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © 2024 GameTech. Todos los derechos reservados. Made with ❤️ for gamers.
                        </p>
                        <div className="flex items-center space-x-4 mt-4 md:mt-0">
                            <span className="text-gray-400 text-sm">Acepta:</span>
                            <div className="flex space-x-2">
                                <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">
                                    VISA
                                </div>
                                <div className="w-8 h-5 bg-gradient-to-r from-red-600 to-orange-600 rounded text-white text-xs flex items-center justify-center font-bold">
                                    MC
                                </div>
                                <div className="w-8 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                                    PP
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;