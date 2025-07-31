import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/productService';
import NavBar from '../components/Common/NavBar';
import { detectSubcategory } from '../utils/subcategoryDetector';
import { SUBCATEGORY_RULES } from '../config/subcategories';
import SidebarHierarchical from '../components/SidebarHierarchical';
import MobileCategoriesModal from '../components/MobileCategoriesModal';
import ProductCard from '../components/Home/ProductCard';
import LoadingSkeleton from '../components/Home/LoadingSkeleton';
import EmptyStates from '../components/Home/EmptyStates';
import toast from 'react-hot-toast';

// Implementación nativa de debounce
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { categoryName } = useParams();

    // Estados básicos
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [menuStructure, setMenuStructure] = useState({ categories: [] });
    const mobileModalRef = useRef();
    const desktopSidebarRef = useRef();

    // Filtros simplificados
    const [selectedCategory, setSelectedCategory] = useState(
        categoryName || searchParams.get('category') || ''
    );
    const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');

    // Estados de interfaz
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Configuración minimalista
    const PRODUCTS_PER_PAGE = 20;
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Calcular categorías con sus subcategorías
    const categoriesWithSubcategories = useMemo(() => {
        const categoryCount = {};

        // Contar productos por categoría
        allProducts.forEach(product => {
            const categoryName = product.category;
            if (!categoryCount[categoryName]) {
                categoryCount[categoryName] = {
                    name: categoryName,
                    count: 0,
                    subcategories: {}
                };
            }
            categoryCount[categoryName].count++;

            // Si esta categoría tiene subcategorías definidas, calcularlas
            const normalizedCategory = categoryName.toLowerCase();
            if (SUBCATEGORY_RULES[normalizedCategory]) {
                const subcategory = detectSubcategory(product.name, categoryName);
                const subId = subcategory.id;

                if (!categoryCount[categoryName].subcategories[subId]) {
                    categoryCount[categoryName].subcategories[subId] = {
                        ...subcategory,
                        count: 0
                    };
                }
                categoryCount[categoryName].subcategories[subId].count++;
            }
        });

        // Convertir a array y ordenar
        return Object.values(categoryCount)
            .map(category => ({
                ...category,
                subcategories: Object.values(category.subcategories)
                    .sort((a, b) => a.priority - b.priority)
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [allProducts]);

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
        if (allProducts.length > 0) {
            setCurrentPage(1);
            filterProducts(1, false);
        }
    }, [selectedCategory, selectedBrand, searchTerm, sortBy, selectedSubcategory]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [menuResponse, productsResponse] = await Promise.all([
                productService.getMenuStructure(),
                productService.getAllProducts(1, 50)
            ]);

            // Configurar estructura del menú
            setMenuStructure(menuResponse || { categories: [] });

            // Configurar productos
            const productsData = Array.isArray(productsResponse?.data) ? productsResponse.data :
                Array.isArray(productsResponse) ? productsResponse : [];

            setAllProducts(productsData);
            setProducts(productsData);
            setTotalProducts(productsResponse.pagination?.totalCount || productsData.length);
            setCategories(menuResponse?.categories?.map(cat => cat.name) || []);
            setBrands([]);

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
        if (sortBy !== 'name') params.set('sort', sortBy);
        if (selectedSubcategory) params.set('subcategory', selectedSubcategory);

        setSearchParams(params);
    };

    const filterProducts = async (page = 1, isLoadMore = false) => {
        try {
            if (!isLoadMore) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const filters = {};
            if (selectedCategory) filters.category = selectedCategory;
            if (selectedBrand) filters.brand = selectedBrand;

            if (searchTerm.trim()) {
                // Para búsqueda, cargar todos los resultados
                const searchResults = await productService.searchProducts(searchTerm);
                let finalProducts = searchResults || [];

                // Aplicar filtro de subcategoría también en búsqueda
                if (selectedSubcategory && selectedSubcategory !== '') {
                    finalProducts = finalProducts.filter(product => {
                        const subcategory = detectSubcategory(product.name, selectedCategory || product.category);
                        return subcategory?.id === selectedSubcategory;
                    });
                }

                setProducts(finalProducts);
                setTotalProducts(finalProducts.length);
                setHasNextPage(false);
                setCurrentPage(1);
                return;
            }

            // Usar endpoint de filtrado con paginación
            const response = await productService.filterProducts({
                ...filters,
                page: page,
                pageSize: PRODUCTS_PER_PAGE
            });

            // Filtrar por subcategoría después de obtener datos
            let finalProducts = response.data || [];
            if (selectedSubcategory && selectedSubcategory !== '') {
                finalProducts = finalProducts.filter(product => {
                    // Si es una subcategoría definida (como nvidia, amd)
                    const subcategory = detectSubcategory(product.name, selectedCategory);
                    if (subcategory?.id === selectedSubcategory) {
                        return true;
                    }

                    // Si es una marca (cuando no hay subcategorías definidas)
                    return product.brand?.toLowerCase() === selectedSubcategory.toLowerCase();
                });
            }

            if (isLoadMore) {
                // Agregar productos a los existentes
                setProducts(prev => [...prev, ...finalProducts]);
            } else {
                // Reemplazar productos (nuevo filtro)
                setProducts(finalProducts);
            }

            setTotalProducts(response.pagination?.totalCount || 0);
            setHasNextPage(response.pagination?.page < response.pagination?.totalPages);
            setCurrentPage(page);

        } catch (err) {
            console.error('Error filtering products:', err);
            toast.error('Error al filtrar productos');
            if (!isLoadMore) {
                setProducts([]);
                setTotalProducts(0);
                setHasNextPage(false);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Función para cargar más productos
    const loadMoreProducts = () => {
        if (hasNextPage && !loadingMore) {
            filterProducts(currentPage + 1, true);
        }
    };

    // Handlers para el sidebar jerárquico
    const handleCategoryChange = (categoryName) => {
        setSelectedCategory(categoryName);
        setSelectedBrand('');
        setSelectedSubcategory('');
    };

    const handleSubcategoryChange = (subcategoryId) => {
        setSelectedSubcategory(subcategoryId);
    };

    const resetFiltersAndExpansion = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedBrand('');
        setSelectedSubcategory('');
        setSortBy('name');
        setSearchParams({});

        // Resetear expansión SOLO cuando limpias
        if (mobileModalRef.current) {
            mobileModalRef.current.resetExpansion();
        }
        if (desktopSidebarRef.current) {
            desktopSidebarRef.current.resetExpansion();
        }
    };

    const clearFilters = () => {
        resetFiltersAndExpansion();
    };

    const hasActiveFilters = searchTerm || selectedCategory || selectedBrand || selectedSubcategory || sortBy !== 'name';
    const displayedProducts = products;

    // Función para obtener el nombre de la subcategoría seleccionada
    const getSelectedSubcategoryName = () => {
        if (!selectedSubcategory || !selectedCategory) return '';

        // Buscar en los productos para obtener el nombre de la subcategoría
        const categoryProducts = allProducts.filter(product =>
            product.category.toLowerCase() === selectedCategory.toLowerCase()
        );

        for (const product of categoryProducts) {
            const subcategory = detectSubcategory(product.name, selectedCategory);
            if (subcategory?.id === selectedSubcategory) {
                return subcategory.name;
            }

            // Si es una marca, devolver el nombre de la marca
            if (product.brand?.toLowerCase() === selectedSubcategory.toLowerCase()) {
                return product.brand;
            }
        }
        return selectedSubcategory; // Fallback: devolver el ID tal como está
    };

    return (
        <div className="min-h-screen bg-white">
            <NavBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showSearch={true}
            />

            {/* Contenido principal con sidebar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-28 pb-8">
                <div className="flex gap-8">

                    {/* Sidebar Desktop */}
                    <div className="hidden lg:block">
                        <SidebarHierarchical
                            ref={desktopSidebarRef}
                            allProducts={allProducts}
                            selectedCategory={selectedCategory}
                            selectedSubcategory={selectedSubcategory}
                            onCategoryChange={handleCategoryChange}
                            onSubcategoryChange={handleSubcategoryChange}
                            sidebarOpen={false}
                            setSidebarOpen={() => { }}
                            categoriesWithSubcategories={categoriesWithSubcategories}
                        />
                    </div>


                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">

                        {/* Modal Mobile */}
                        <MobileCategoriesModal
                            ref={mobileModalRef}
                            isOpen={sidebarOpen}
                            onClose={() => setSidebarOpen(false)}
                            categoriesWithSubcategories={categoriesWithSubcategories}
                            allProducts={allProducts}
                            selectedCategory={selectedCategory}
                            selectedSubcategory={selectedSubcategory}
                            onCategoryChange={handleCategoryChange}
                            onSubcategoryChange={handleSubcategoryChange}
                            getSelectedSubcategoryName={getSelectedSubcategoryName}
                        />
                        {/* Toggle para móvil */}
                        {/* <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden w-full mb-6 px-4 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between"
                        >
                            <span>Ver categorías</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button> */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden w-full mb-6 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between shadow-sm"
                        >
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span className="font-medium">Categorías</span>
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Breadcrumb de filtros activos */}
                        {hasActiveFilters && (
                            <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
                                <span className="text-gray-500">Filtros:</span>
                                {selectedCategory && (
                                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full capitalize">
                                        {selectedCategory}
                                        <button
                                            onClick={() => {
                                                resetFiltersAndExpansion(); // ← Usar la nueva función
                                            }}
                                            className="ml-2 hover:text-red-600 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {selectedSubcategory && (
                                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                                        {getSelectedSubcategoryName()}
                                        <button
                                            onClick={() => {
                                                setSelectedSubcategory('');
                                                // Solo resetear cuando quitas subcategoría si no hay categoría seleccionada
                                                if (!selectedCategory) {
                                                    resetFiltersAndExpansion();
                                                }
                                            }}
                                            className="ml-2 hover:text-red-600 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {searchTerm && (
                                    <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                        "{searchTerm}"
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="ml-2 hover:text-red-600 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {sortBy !== 'name' && (
                                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                                        {sortBy === 'price-asc' ? 'Precio ↑' :
                                            sortBy === 'price-desc' ? 'Precio ↓' :
                                                sortBy === 'stock' ? 'Stock ↓' : sortBy}
                                        <button
                                            onClick={() => setSortBy('name')}
                                            className="ml-2 hover:text-red-600 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Resultados */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-16">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-light text-gray-900 mb-2">Error al cargar</h3>
                                <p className="text-gray-600 mb-6">No pudimos cargar los productos</p>
                                <button
                                    onClick={loadData}
                                    className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                                >
                                    Intentar de nuevo
                                </button>
                            </div>
                        ) : totalProducts === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-light text-gray-900 mb-2">Sin resultados</h3>
                                <p className="text-gray-600 mb-6">No encontramos productos con estos filtros</p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Grid de productos minimalista */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                    {displayedProducts.map((product, index) => (
                                        <div
                                            key={product.id}
                                            className="group cursor-pointer"
                                            onClick={() => navigate(`/product/${product.id}`)}
                                        >
                                            {/* Imagen del producto */}
                                            <div className="aspect-square overflow-hidden rounded-lg bg-white mb-4 group-hover:opacity-75 transition-opacity">
                                                <img
                                                    src={productService.getImageUrl(product.mainImageUrl)}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.target.src = `https://picsum.photos/400/400?random=${product.id}`;
                                                    }}
                                                />
                                            </div>

                                            {/* Info del producto */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        ${product.price.toLocaleString('es-AR')}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-gray-500 capitalize">
                                                    {product.category} • {product.brand}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Call to action para ver más */}
                                {products.length > 0 && (
                                    <div className="text-center py-8 border-t border-gray-100">
                                        <p className="text-gray-600 mb-6">
                                            Mostrando {products.length} de {totalProducts.toLocaleString()} productos
                                        </p>

                                        {hasNextPage ? (
                                            <button
                                                onClick={loadMoreProducts}
                                                disabled={loadingMore}
                                                className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                                            >
                                                {loadingMore ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Cargando...
                                                    </>
                                                ) : (
                                                    `Cargar más productos (${totalProducts - products.length} restantes)`
                                                )}
                                            </button>
                                        ) : products.length > 0 && (
                                            <div className="flex items-center justify-center text-gray-500">
                                                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Todos los productos han sido cargados
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;