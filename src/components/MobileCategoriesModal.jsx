import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';

const MobileCategoriesModal = forwardRef(({
    isOpen,
    onClose,
    categoriesWithSubcategories,
    allProducts,
    selectedCategory,
    selectedSubcategory,
    onCategoryChange,
    onSubcategoryChange,
    getSelectedSubcategoryName
}, ref) => {
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    // Sincronizar expansión con categoría seleccionada
    useEffect(() => {
        if (selectedCategory) {
            // Solo expandir la categoría seleccionada
            setExpandedCategories(new Set([selectedCategory]));
        } else {
            // Si no hay categoría seleccionada, plegar todas
            setExpandedCategories(new Set());
        }
    }, [selectedCategory]);

    useImperativeHandle(ref, () => ({
        resetExpansion: () => {
            setExpandedCategories(new Set());
        }
    }));

    const toggleCategory = (categoryName) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryName)) {
            newExpanded.delete(categoryName);
        } else {
            // Solo expandir esta categoría, plegar todas las demás
            newExpanded.clear();
            newExpanded.add(categoryName);
        }
        setExpandedCategories(newExpanded);
    };

    const handleCategoryClick = (categoryName) => {
        onCategoryChange(categoryName);
        onSubcategoryChange(''); // Limpiar subcategoría
        onClose();
    };

    const handleSubcategoryClick = (subcategoryId, categoryName) => {
        console.log('🔄 Clicking subcategory:', subcategoryId, 'category:', categoryName);
        console.log('🔄 Current selected:', selectedSubcategory, selectedCategory);

        // Siempre limpiar subcategoría anterior y establecer nueva categoría
        onCategoryChange(categoryName);
        onSubcategoryChange(subcategoryId);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="lg:hidden bg-white border border-gray-200 rounded-lg shadow-lg mb-6">
            {/* Contenido desplegable - IGUAL QUE DESKTOP */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-1">
                <button
                    onClick={() => {
                        onCategoryChange('');
                        onSubcategoryChange('');
                        setExpandedCategories(new Set());
                        onClose();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === ''
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Todos los productos</span>
                        <span className={`text-sm ${selectedCategory === ''
                                ? 'text-gray-400'
                                : 'text-gray-500'
                            }`}>
                            {allProducts.length}
                        </span>
                    </div>
                </button>

                {/* Separador - IGUAL QUE DESKTOP */}
                <div className="border-t border-gray-100 my-4"></div>


                {/* Lista de categorías - IGUAL QUE DESKTOP */}
                <div className="space-y-1">
                    {categoriesWithSubcategories.map((category) => {
                        const isSelected = selectedCategory === category.name;
                        const isExpanded = expandedCategories.has(category.name);
                        const hasSubcategories = category.subcategories.length > 0;

                        // Calcular marcas
                        const categoryBrands = [...new Set(
                            allProducts
                                .filter(product => product.category === category.name)
                                .map(product => product.brand)
                                .filter(Boolean)
                        )];
                        const hasExpandableContent = hasSubcategories || categoryBrands.length > 0;

                        return (
                            <div key={category.name} className="space-y-1">
                                {/* Categoría principal - IGUAL QUE DESKTOP */}
                                <div className="flex items-stretch">
                                    <button
                                        onClick={() => handleCategoryClick(category.name)}
                                        className={`flex-1 text-left px-3 py-2 rounded-l-lg transition-colors hover:bg-transparent ${isSelected
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="capitalize font-medium">{category.name}</span>
                                            <span className={`text-sm ${isSelected
                                                    ? 'text-gray-400'
                                                    : 'text-gray-500'
                                                }`}>
                                                {category.count}
                                            </span>
                                        </div>
                                    </button>

                                    {/* Botón expandir/contraer - IGUAL QUE DESKTOP */}
                                    {hasExpandableContent && (
                                        <button
                                            onClick={() => toggleCategory(category.name)}
                                            className={`px-2 py-2 rounded-r-lg transition-colors border-l ${isSelected
                                                    ? 'bg-gray-800 text-white border-gray-700'
                                                    : 'text-gray-500 border-gray-200'
                                                }`}
                                        >
                                            <svg
                                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''
                                                    }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {/* Subcategorías - IGUAL QUE DESKTOP */}
                                {isExpanded && hasExpandableContent && (
                                    <div className="ml-6 space-y-1 border-l border-gray-200 pl-3">
                                        {hasSubcategories ? (
                                            category.subcategories.map((subcategory) => (
                                                <button
                                                    key={subcategory.id}
                                                    onClick={() => handleSubcategoryClick(subcategory.id, category.name)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${selectedSubcategory === subcategory.id && selectedCategory === category.name
                                                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                            : 'text-gray-600'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="font-medium">{subcategory.name}</div>
                                                        </div>
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                                                            {subcategory.count}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            categoryBrands.map((brand) => {
                                                const brandCount = allProducts.filter(p =>
                                                    p.category === category.name && p.brand === brand
                                                ).length;
                                                const isBrandSelected = selectedSubcategory === brand.toLowerCase() && selectedCategory === category.name;

                                                return (
                                                    <button
                                                        key={brand}
                                                        onClick={() => handleSubcategoryClick(brand.toLowerCase(), category.name)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${isBrandSelected
                                                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                                : 'text-gray-600'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="font-medium">{brand}</div>
                                                            </div>
                                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                                                                {brandCount}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

export default MobileCategoriesModal;