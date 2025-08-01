import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { detectSubcategory } from '../utils/subcategoryDetector';
import toast from 'react-hot-toast';

export const useProductData = () => {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [menuStructure, setMenuStructure] = useState({ categories: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configuración
    const PRODUCTS_PER_PAGE = 20;
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [menuResponse, productsResponse] = await Promise.all([
                productService.getMenuStructure(),
                productService.getAllProducts(1, 50)
            ]);

            setMenuStructure(menuResponse || { categories: [] });

            const productsData = Array.isArray(productsResponse?.data)
                ? productsResponse.data
                : Array.isArray(productsResponse)
                    ? productsResponse
                    : [];

            setAllProducts(productsData);
            setProducts(productsData);
            setTotalProducts(productsResponse.pagination?.totalCount || productsData.length);

        } catch (err) {
            setError('Error al cargar los datos');
            toast.error('Error al cargar los productos');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const filterProducts = useCallback(async (filters, page = 1, isLoadMore = false) => {
        try {
            if (!isLoadMore) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const { selectedCategory, selectedBrand, searchTerm, selectedSubcategory } = filters;

            if (searchTerm?.trim()) {
                try {
                    const searchResults = await productService.searchProducts(searchTerm);
                    let finalProducts = searchResults || [];

                    if (selectedSubcategory) {
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
                } catch (error) {
                    // ✅ FALLBACK: Si falla el backend, buscar localmente
                    console.warn('Backend search failed, using local search:', error.message);

                    const term = searchTerm.toLowerCase();
                    let searchResults = allProducts.filter(product =>
                        product.name?.toLowerCase().includes(term) ||
                        product.brand?.toLowerCase().includes(term) ||
                        product.category?.toLowerCase().includes(term) ||
                        product.description?.toLowerCase().includes(term)
                    );

                    if (selectedSubcategory) {
                        searchResults = searchResults.filter(product => {
                            const subcategory = detectSubcategory(product.name, selectedCategory || product.category);
                            return subcategory?.id === selectedSubcategory;
                        });
                    }

                    setProducts(searchResults);
                    setTotalProducts(searchResults.length);
                    setHasNextPage(false);
                    setCurrentPage(1);
                    return;
                }
            }

            const apiFilters = {};
            if (selectedCategory) apiFilters.category = selectedCategory;
            if (selectedBrand) apiFilters.brand = selectedBrand;

            const response = await productService.filterProducts({
                ...apiFilters,
                page,
                pageSize: PRODUCTS_PER_PAGE
            });

            let finalProducts = response.data || [];
            if (selectedSubcategory) {
                finalProducts = finalProducts.filter(product => {
                    const subcategory = detectSubcategory(product.name, selectedCategory);
                    if (subcategory?.id === selectedSubcategory) return true;
                    return product.brand?.toLowerCase() === selectedSubcategory.toLowerCase();
                });
            }

            if (isLoadMore) {
                setProducts(prev => [...prev, ...finalProducts]);
            } else {
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
    }, []);

    const loadMoreProducts = useCallback((filters) => {
        if (hasNextPage && !loadingMore) {
            filterProducts(filters, currentPage + 1, true);
        }
    }, [hasNextPage, loadingMore, currentPage, filterProducts]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        // Estados
        products,
        allProducts,
        totalProducts,
        menuStructure,
        loading,
        error,
        currentPage,
        hasNextPage,
        loadingMore,

        // Funciones
        loadData,
        filterProducts,
        loadMoreProducts,
        setCurrentPage
    };
};