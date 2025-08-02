import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SUBCATEGORY_RULES } from '../config/subcategories';
import { detectSubcategory } from '../utils/subcategoryDetector';
import { useProductFilters } from '../hooks/useProductFilters';
import { useProductData } from '../hooks/useProductData';
import NavBar from '../components/Common/NavBar';
import SidebarHierarchical from '../components/SidebarHierarchical';
import MobileCategoriesModal from '../components/MobileCategoriesModal';
import { productService } from '../services/productService';

// Implementación de debounce
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
    const navigate = useNavigate();
    const { categoryName } = useParams();
    const mobileModalRef = useRef();
    const desktopSidebarRef = useRef();

    // Estados de UI
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Hooks personalizados
    const filters = useProductFilters(categoryName);
    const productData = useProductData();

    // Versión debounced de filterProducts
    const debouncedFilterProducts = useMemo(
        () => debounce(() => {
            if (productData.allProducts.length > 0) {
                productData.setCurrentPage(1);
                productData.filterProducts({
                    selectedCategory: filters.selectedCategory,
                    selectedBrand: filters.selectedBrand,
                    searchTerm: filters.searchTerm,
                    selectedSubcategory: filters.selectedSubcategory
                }, 1, false);
            }
        }, 300),
        [productData, filters.selectedCategory, filters.selectedBrand, filters.searchTerm, filters.selectedSubcategory]
    );

    // Calcular categorías con subcategorías
    const categoriesWithSubcategories = useMemo(() => {
        const categoryCount = {};

        // Contar productos por categoría
        productData.allProducts.forEach(product => {
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
    }, [productData.allProducts]);

    // Effects para sincronizar filtros
    useEffect(() => {
        const category = filters.searchParams.get('category') || '';
        const subcategory = filters.searchParams.get('subcategory') || '';
        const brand = filters.searchParams.get('brand') || '';
        const search = filters.searchParams.get('search') || '';
        const sort = filters.searchParams.get('sort') || 'name';

        // Solo actualizar si realmente cambió para evitar bucles
        if (filters.selectedCategory !== category) filters.setSelectedCategory(category);
        if (filters.selectedSubcategory !== subcategory) filters.setSelectedSubcategory(subcategory);
        if (filters.selectedBrand !== brand) filters.setSelectedBrand(brand);
        if (filters.searchTerm !== search) filters.setSearchTerm(search);
        if (filters.sortBy !== sort) filters.setSortBy(sort);
    }, [filters.searchParams]);

    useEffect(() => {
        if (categoryName && categoryName !== filters.selectedCategory) {
            filters.setSelectedCategory(categoryName);
        }
    }, [categoryName]);

    useEffect(() => {
        // Solo aplicar filtros cuando cambian, sin actualizar URL aquí
        if (productData.allProducts.length > 0) {
            const filtersData = {
                selectedCategory: filters.selectedCategory,
                selectedBrand: filters.selectedBrand,
                searchTerm: filters.searchTerm,
                selectedSubcategory: filters.selectedSubcategory
            };

            if (filters.searchTerm.trim()) {
                debouncedFilterProducts();
            } else {
                productData.setCurrentPage(1);
                productData.filterProducts(filtersData, 1, false);
            }
        }
    }, [filters.selectedCategory, filters.selectedBrand, filters.selectedSubcategory, filters.searchTerm, productData.allProducts.length]);

    // Separar la actualización de URL
    useEffect(() => {
        filters.updateURL();
    }, [filters.selectedCategory, filters.selectedBrand, filters.searchTerm, filters.sortBy, filters.selectedSubcategory]);

    // Aplicar filtros cuando hay filtros en la URL al cargar
    useEffect(() => {
        const hasFilters = filters.selectedCategory ||
            filters.selectedSubcategory ||
            filters.selectedBrand ||
            filters.searchTerm;

        if (hasFilters && productData.allProducts.length > 0) {
            setTimeout(() => {
                productData.filterProducts({
                    selectedCategory: filters.selectedCategory,
                    selectedBrand: filters.selectedBrand,
                    searchTerm: filters.searchTerm,
                    selectedSubcategory: filters.selectedSubcategory
                }, 1, false);
            }, 100);
        }
    }, [productData.allProducts.length]);

    // Handlers
    const handleCategoryChange = (categoryName) => {
        filters.setSelectedCategory(categoryName);
        filters.setSelectedBrand('');
        filters.setSelectedSubcategory('');
    };

    const handleSubcategoryChange = (subcategoryId) => {
        // Limpiar primero cualquier subcategoría anterior
        filters.setSelectedSubcategory(subcategoryId);
    };

    const loadMoreProducts = () => {
        productData.loadMoreProducts({
            selectedCategory: filters.selectedCategory,
            selectedBrand: filters.selectedBrand,
            searchTerm: filters.searchTerm,
            selectedSubcategory: filters.selectedSubcategory
        });
    };

    const resetFiltersAndExpansion = () => {
        filters.clearFilters();
        if (mobileModalRef.current) mobileModalRef.current.resetExpansion();
        if (desktopSidebarRef.current) desktopSidebarRef.current.resetExpansion();
    };

    const clearFilters = () => {
        resetFiltersAndExpansion();
    };

    // Función para obtener el nombre de la subcategoría seleccionada
    const getSelectedSubcategoryName = () => {
        if (!filters.selectedSubcategory || !filters.selectedCategory) return '';

        // Buscar en los productos para obtener el nombre de la subcategoría
        const categoryProducts = productData.allProducts.filter(product =>
            product.category.toLowerCase() === filters.selectedCategory.toLowerCase()
        );

        for (const product of categoryProducts) {
            const subcategory = detectSubcategory(product.name, filters.selectedCategory);
            if (subcategory?.id === filters.selectedSubcategory) {
                return subcategory.name;
            }

            // Si es una marca, devolver el nombre de la marca
            if (product.brand?.toLowerCase() === filters.selectedSubcategory.toLowerCase()) {
                return product.brand;
            }
        }
        return filters.selectedSubcategory; // Fallback: devolver el ID tal como está
    };

    return (
        <div className="min-h-screen bg-white">
            <NavBar
                searchTerm={filters.searchTerm}
                setSearchTerm={filters.setSearchTerm}
                showSearch={true}
            />

            {/* Contenido principal con sidebar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-28 pb-8">
                <div className="flex gap-8">

                    {/* Sidebar Desktop */}
                    <div className="hidden lg:block">
                        <SidebarHierarchical
                            ref={desktopSidebarRef}
                            allProducts={productData.allProducts}
                            selectedCategory={filters.selectedCategory}
                            selectedSubcategory={filters.selectedSubcategory}
                            onCategoryChange={handleCategoryChange}
                            onSubcategoryChange={handleSubcategoryChange}
                            sidebarOpen={false}
                            setSidebarOpen={() => { }}
                            categoriesWithSubcategories={categoriesWithSubcategories}
                        />
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">

                        {/* Container del menú móvil */}
                        <div className="lg:hidden mb-6">
                            {/* Toggle para móvil - FIJO */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="w-full px-4 py-3 bg-[#2c2c2c] border border-gray-600 rounded-lg text-white transition-colors flex items-center justify-between shadow-sm"
                            >
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium text-white">Categorías</span>
                                </div>
                                <svg className={`w-4 h-4 transition-transform text-gray-400 ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Modal Mobile - DENTRO del container */}
                            <MobileCategoriesModal
                                key={`${filters.selectedCategory}-${filters.selectedSubcategory}`}
                                ref={mobileModalRef}
                                isOpen={sidebarOpen}
                                onClose={() => setSidebarOpen(false)}
                                categoriesWithSubcategories={categoriesWithSubcategories}
                                allProducts={productData.allProducts}
                                selectedCategory={filters.selectedCategory}
                                selectedSubcategory={filters.selectedSubcategory}
                                onCategoryChange={handleCategoryChange}
                                onSubcategoryChange={handleSubcategoryChange}
                                getSelectedSubcategoryName={getSelectedSubcategoryName}
                            />
                        </div>

                        {/* Breadcrumb de filtros activos */}
                        {filters.hasActiveFilters && (
                            <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
                                <span className="text-gray-500">Filtros:</span>
                                {filters.selectedCategory && (
                                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full capitalize">
                                        {filters.selectedCategory}
                                        <button
                                            onClick={() => {
                                                resetFiltersAndExpansion();
                                            }}
                                            className="ml-2 hover:text-red-600 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {filters.selectedSubcategory && (
                                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                                        {getSelectedSubcategoryName()}
                                        <button
                                            onClick={() => {
                                                filters.setSelectedSubcategory('');
                                                // Solo resetear cuando quitas subcategoría si no hay categoría seleccionada
                                                if (!filters.selectedCategory) {
                                                    resetFiltersAndExpansion();
                                                }
                                            }}
                                            className="ml-2 hover:text-red-600 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {filters.searchTerm && (
                                    <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                        "{filters.searchTerm}"
                                        <button
                                            onClick={() => filters.setSearchTerm('')}
                                            className="ml-2 hover:text-red-600 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {filters.sortBy !== 'name' && (
                                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                                        {filters.sortBy === 'price-asc' ? 'Precio ↑' :
                                            filters.sortBy === 'price-desc' ? 'Precio ↓' :
                                                filters.sortBy === 'stock' ? 'Stock ↓' : filters.sortBy}
                                        <button
                                            onClick={() => filters.setSortBy('name')}
                                            className="ml-2 hover:text-red-600 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Resultados */}
                        {productData.loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                ))}
                            </div>
                        ) : productData.error ? (
                            <div className="text-center py-16">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-light text-gray-900 mb-2">Error al cargar</h3>
                                <p className="text-gray-600 mb-6">No pudimos cargar los productos</p>
                                <button
                                    onClick={productData.loadData}
                                    className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                                >
                                    Intentar de nuevo
                                </button>
                            </div>
                        ) : productData.totalProducts === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-light text-gray-900 mb-2">Sin resultados</h3>
                                <p className="text-gray-600 mb-6">No encontramos productos con estos filtros</p>
                                {filters.hasActiveFilters && (
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
                                    {productData.products.map((product, index) => (
                                        <div
                                            key={product.id}
                                            className="group cursor-pointer"
                                            onClick={() => {
                                                // Construir URL con filtros actuales
                                                const currentFilters = filters.searchParams.toString();
                                                const productUrl = `/product/${product.id}${currentFilters ? `?from=products&${currentFilters}` : '?from=products'}`;
                                                navigate(productUrl);
                                            }}
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
                                {productData.products.length > 0 && (
                                    <div className="text-center py-8 border-t border-gray-100">
                                        <p className="text-gray-600 mb-6">
                                            Mostrando {productData.products.length} de {productData.totalProducts.toLocaleString()} productos
                                        </p>

                                        {productData.hasNextPage ? (
                                            <button
                                                onClick={loadMoreProducts}
                                                disabled={productData.loadingMore}
                                                className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                                            >
                                                {productData.loadingMore ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Cargando...
                                                    </>
                                                ) : (
                                                    `Cargar más productos (${productData.totalProducts - productData.products.length} restantes)`
                                                )}
                                            </button>
                                        ) : productData.products.length > 0 && (
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