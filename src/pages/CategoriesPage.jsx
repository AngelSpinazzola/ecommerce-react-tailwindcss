
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/productService';
import NavBar from '../components/Common/NavBar';
import ProductCard from '../components/Home/ProductCard';
import LoadingSkeleton from '../components/Home/LoadingSkeleton';
import EmptyStates from '../components/Home/EmptyStates';
import toast from 'react-hot-toast';

const CategoriesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { categoryName } = useParams();
    
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [menuStructure, setMenuStructure] = useState({ categories: [] });
    
    // Filtros del estado
    const [selectedCategory, setSelectedCategory] = useState(
        categoryName || searchParams.get('category') || ''
    );
    const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [priceRange, setPriceRange] = useState({ 
        min: searchParams.get('minPrice') || '', 
        max: searchParams.get('maxPrice') || '' 
    });
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
    const [viewMode, setViewMode] = useState('grid');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (categoryName) {
            setSelectedCategory(categoryName);
        }
    }, [categoryName]);

    useEffect(() => {
        updateURL();
        filterProducts();
    }, [selectedCategory, selectedBrand, searchTerm, priceRange, sortBy]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [productsResponse, categoriesResponse, brandsResponse, menuResponse] = await Promise.all([
                productService.getAllProducts(),
                productService.getCategories(),
                productService.getBrands(),
                productService.getMenuStructure()
            ]);

            const productsData = Array.isArray(productsResponse?.data) ? productsResponse.data : 
                               Array.isArray(productsResponse) ? productsResponse : [];
            
            setAllProducts(productsData);
            setProducts(productsData);
            setCategories(categoriesResponse || []);
            setBrands(brandsResponse || []);
            setMenuStructure(menuResponse || { categories: [] });

        } catch (err) {
            setError('Error al cargar los datos');
            toast.error('Error al cargar los productos');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateURL = () => {
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedBrand) params.set('brand', selectedBrand);
        if (searchTerm) params.set('search', searchTerm);
        if (priceRange.min) params.set('minPrice', priceRange.min);
        if (priceRange.max) params.set('maxPrice', priceRange.max);
        if (sortBy !== 'name') params.set('sort', sortBy);
        
        setSearchParams(params);
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
        setSearchParams({});
    };

    const getFilteredBrandsForCategory = () => {
        if (!selectedCategory) return brands;
        
        const categoryData = menuStructure.categories.find(cat => cat.name === selectedCategory);
        return categoryData ? categoryData.brands.map(b => b.name) : brands;
    };

    const hasActiveFilters = searchTerm || selectedCategory || selectedBrand || priceRange.min || priceRange.max || sortBy !== 'name';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <NavBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showSearch={true}
            />

            {/* Contenedor principal */}
            <div className="max-w-7xl mx-auto bg-white shadow-xl mt-4 lg:mt-8">
                
                {/* Header - Rediseñado para móvil */}
                <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8 border-b border-gray-100">
                    {/* Breadcrumb - Solo desktop */}
                    <nav className="hidden lg:flex items-center space-x-2 text-sm mb-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                        >
                            Inicio
                        </button>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-gray-900 font-bold">Categorías</span>
                        {selectedCategory && (
                            <>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="text-purple-600 font-bold capitalize">{selectedCategory}</span>
                            </>
                        )}
                    </nav>

                    {/* Header principal */}
                    <div className="flex flex-col space-y-4">
                        {/* Título y contador */}
                        <div>
                            <h1 className="text-2xl lg:text-4xl font-black text-gray-900 mb-1">
                                {selectedCategory ? (
                                    <span className="capitalize">{selectedCategory}</span>
                                ) : (
                                    'Categorías'
                                )}
                            </h1>
                            <p className="text-gray-600 text-sm lg:text-base">
                                <span className="text-purple-600 font-bold">{products.length}</span> productos encontrados
                            </p>
                        </div>

                        {/* Controles - Rediseñados para móvil */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            {/* Botón de filtros para móvil */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden w-full sm:w-auto px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                                Filtros y Categorías
                                {hasActiveFilters && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                        {[selectedCategory, selectedBrand, searchTerm, priceRange.min, priceRange.max].filter(Boolean).length}
                                    </span>
                                )}
                            </button>

                            {/* Controles de vista */}
                            <div className="flex items-center justify-between sm:justify-end">
                                <span className="text-sm text-gray-500 lg:hidden">Vista:</span>
                                <div className="bg-gray-100 rounded-lg p-1 flex">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-md transition-colors ${
                                            viewMode === 'grid' 
                                                ? 'bg-white text-purple-600 shadow-sm' 
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                        title="Vista en grilla"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-md transition-colors ${
                                            viewMode === 'list' 
                                                ? 'bg-white text-purple-600 shadow-sm' 
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                        title="Vista en lista"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filtros activos - Solo móvil */}
                        {hasActiveFilters && (
                            <div className="lg:hidden bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-purple-700">Filtros activos:</span>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Limpiar todo
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCategory && (
                                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                            {selectedCategory}
                                            <button
                                                onClick={() => setSelectedCategory('')}
                                                className="ml-1 text-purple-600 hover:text-purple-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {selectedBrand && (
                                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                            {selectedBrand}
                                            <button
                                                onClick={() => setSelectedBrand('')}
                                                className="ml-1 text-purple-600 hover:text-purple-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {(priceRange.min || priceRange.max) && (
                                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                            ${priceRange.min || '0'} - ${priceRange.max || '∞'}
                                            <button
                                                onClick={() => setPriceRange({ min: '', max: '' })}
                                                className="ml-1 text-purple-600 hover:text-purple-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contenido con sidebar */}
                <div className="flex min-h-screen">
                    
                    {/* Overlay para móvil */}
                    {sidebarOpen && (
                        <div 
                            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    {/* Sidebar de filtros */}
                    <div className={`
                        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
                        w-full sm:w-80 lg:w-80 bg-white border-r border-gray-200
                        transform transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        overflow-y-auto
                    `}>
                        {/* Header del sidebar */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700 lg:bg-gray-50">
                            <h3 className="text-lg font-bold text-white lg:text-gray-900 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-white lg:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Categorías
                            </h3>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-2 hover:bg-purple-700 lg:hover:bg-gray-100 rounded-lg transition-colors text-white lg:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Lista de categorías expandible */}
                        <div className="py-2">
                            {/* Todas las categorías */}
                            <button
                                onClick={() => {
                                    setSelectedCategory('');
                                    setSelectedBrand('');
                                    setSidebarOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center ${
                                    selectedCategory === '' ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-500' : 'text-gray-700'
                                }`}
                            >
                                <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span className="flex-1 font-medium">Todas las categorías</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    {allProducts.length}
                                </span>
                            </button>

                            {/* Lista de categorías */}
                            {menuStructure.categories.map((category) => {
                                const categoryCount = allProducts.filter(p => p.category === category.name).length;
                                const isExpanded = expandedCategory === category.name;
                                const isSelected = selectedCategory === category.name;
                                
                                return (
                                    <div key={category.name} className="border-b border-gray-100 last:border-b-0">
                                        <div className="flex items-center">
                                            {/* Botón de expansión */}
                                            {category.brands.length > 0 && (
                                                <button
                                                    onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                                                    className="p-3 hover:bg-gray-50 transition-colors"
                                                >
                                                    <svg 
                                                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            )}
                                            
                                            {/* Categoría principal */}
                                            <button
                                                onClick={() => {
                                                    setSelectedCategory(category.name);
                                                    setSelectedBrand('');
                                                    setSidebarOpen(false);
                                                }}
                                                className={`flex-1 text-left py-3 pr-4 hover:bg-gray-50 transition-colors flex items-center ${
                                                    isSelected ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                                                } ${category.brands.length === 0 ? 'pl-4' : ''}`}
                                            >
                                                <span className="flex-1 font-medium capitalize">{category.name}</span>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                    {categoryCount}
                                                </span>
                                            </button>
                                        </div>

                                        {/* Marcas expandidas */}
                                        {isExpanded && category.brands.length > 0 && (
                                            <div className="bg-gray-25 border-t border-gray-100">
                                                {category.brands.map((brand) => {
                                                    const brandCount = allProducts.filter(p => 
                                                        p.category === category.name && p.brand === brand.name
                                                    ).length;
                                                    
                                                    if (brandCount === 0) return null;
                                                    
                                                    const isBrandSelected = selectedCategory === category.name && selectedBrand === brand.name;
                                                    
                                                    return (
                                                        <button
                                                            key={brand.name}
                                                            onClick={() => {
                                                                setSelectedCategory(category.name);
                                                                setSelectedBrand(brand.name);
                                                                setSidebarOpen(false);
                                                            }}
                                                            className={`w-full text-left py-2 px-4 ml-8 mr-4 hover:bg-gray-100 transition-colors flex items-center rounded ${
                                                                isBrandSelected ? 'bg-purple-100 text-purple-700' : 'text-gray-600'
                                                            }`}
                                                        >
                                                            <span className="flex-1 text-sm">{brand.name}</span>
                                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                                                {brandCount}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Filtros adicionales */}
                        <div className="border-t border-gray-200 p-4 space-y-6">
                            {/* Filtros activos - Solo desktop */}
                            {hasActiveFilters && (
                                <div className="hidden lg:block bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-purple-700">Filtros activos</span>
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Limpiar
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCategory && (
                                            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                                {selectedCategory}
                                            </span>
                                        )}
                                        {selectedBrand && (
                                            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                                {selectedBrand}
                                            </span>
                                        )}
                                        {(priceRange.min || priceRange.max) && (
                                            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                                ${priceRange.min || '0'} - ${priceRange.max || '∞'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Rango de precios */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Rango de precio</h4>
                                <div className="space-y-3">
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="Precio mínimo"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="Precio máximo"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ordenamiento */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Ordenar por</h4>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                >
                                    <option value="name">Nombre A-Z</option>
                                    <option value="price-asc">Precio: Menor a Mayor</option>
                                    <option value="price-desc">Precio: Mayor a Menor</option>
                                    <option value="stock">Más Stock</option>
                                </select>
                            </div>

                            {/* Botón aplicar para móvil */}
                            <div className="lg:hidden pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium"
                                >
                                    Ver {products.length} productos
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 p-4 lg:p-6">
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
                            <div className={`${
                                viewMode === 'grid' 
                                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6'
                                    : 'space-y-4'
                            }`}>
                                {products.map((product, index) => (
                                    viewMode === 'grid' ? (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            index={index}
                                        />
                                    ) : (
                                        <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20">
                                                    <img
                                                        src={productService.getImageUrl(product.mainImageUrl)}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover rounded-lg"
                                                        onError={(e) => {
                                                            e.target.src = `https://picsum.photos/80/80?random=${product.id}`;
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 capitalize">
                                                        {product.category} • {product.brand}
                                                    </p>
                                                    <p className="text-lg font-bold text-purple-600 mt-1">
                                                        ${product.price.toLocaleString('es-AR')}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <button
                                                        onClick={() => navigate(`/product/${product.id}`)}
                                                        className="px-3 py-2 lg:px-4 lg:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm lg:text-base"
                                                    >
                                                        Ver
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoriesPage;