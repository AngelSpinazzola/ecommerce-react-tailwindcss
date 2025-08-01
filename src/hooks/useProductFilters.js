import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useProductFilters = (categoryName) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Estados de filtros
    const [selectedCategory, setSelectedCategory] = useState(
        categoryName || searchParams.get('category') || ''
    );
    const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');

    // Función para actualizar URL
    const updateURL = useCallback(() => {
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedBrand) params.set('brand', selectedBrand);
        if (searchTerm) params.set('search', searchTerm);
        if (sortBy !== 'name') params.set('sort', sortBy);
        if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
        setSearchParams(params);
    }, [selectedCategory, selectedBrand, searchTerm, sortBy, selectedSubcategory, setSearchParams]);

    // Función para limpiar filtros
    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedBrand('');
        setSelectedSubcategory('');
        setSortBy('name');
        setSearchParams({});
    }, [setSearchParams]);

    // Verificar si hay filtros activos
    const hasActiveFilters = useMemo(() => 
        searchTerm || selectedCategory || selectedBrand || selectedSubcategory || sortBy !== 'name',
        [searchTerm, selectedCategory, selectedBrand, selectedSubcategory, sortBy]
    );

    return {
        // Estados
        selectedCategory,
        selectedBrand,
        searchTerm,
        sortBy,
        selectedSubcategory,
        hasActiveFilters,
        
        // Setters
        setSelectedCategory,
        setSelectedBrand,
        setSearchTerm,
        setSortBy,
        setSelectedSubcategory,
        
        // Funciones
        updateURL,
        clearFilters,
        
        // Para restaurar desde URL
        searchParams
    };
};