import React, { useState, useImperativeHandle, forwardRef } from 'react';

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
            newExpanded.add(categoryName);
        }
        setExpandedCategories(newExpanded);
    };

    const handleCategoryClick = (categoryName) => {
        onCategoryChange(categoryName);
        onClose();
    };

    const handleSubcategoryClick = (subcategoryId, categoryName) => {
        onCategoryChange(categoryName);
        onSubcategoryChange(subcategoryId);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="lg:hidden bg-white border border-gray-200 rounded-lg shadow-lg mb-6">
            {/* Contenido desplegable */}
            <div className="max-h-96 overflow-y-auto p-4">
                {/* Todos los productos */}
                <button
                    onClick={() => {
                        onCategoryChange('');
                        onSubcategoryChange('');
                        setExpandedCategories(new Set());
                        onClose();
                    }}
                    className={`w-full text-left p-3 rounded-lg mb-3 transition-colors ${selectedCategory === ''
                        ? 'bg-orange-50 text-orange-700 border-l-4 border-orange-500'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Todos los productos</span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {allProducts.length}
                        </span>
                    </div>
                </button>

                {/* Lista de categorías */}
                <div className="space-y-1">
                    {categoriesWithSubcategories.map((category) => {
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
                            <div key={category.name}>
                                {/* Categoría principal */}
                                <div
                                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${selectedCategory === category.name
                                        ? 'bg-orange-50 text-orange-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <button
                                        onClick={() => handleCategoryClick(category.name)}
                                        className="flex-1 text-left flex items-center justify-between"
                                    >
                                        <span className="font-medium capitalize">{category.name}</span>
                                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {category.count}
                                        </span>
                                    </button>

                                    {hasExpandableContent && (
                                        <button
                                            onClick={() => toggleCategory(category.name)}
                                            className="p-1 ml-2 hover:bg-gray-200 rounded transition-colors"
                                        >
                                            <svg
                                                className={`w-4 h-4 text-orange-500 transition-transform ${isExpanded ? 'rotate-90' : ''
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

                                {/* Subcategorías */}
                                {isExpanded && hasExpandableContent && (
                                    <div className="ml-6 mt-2 space-y-1 border-l-2 border-orange-200 pl-4">
                                        {hasSubcategories ? (
                                            category.subcategories.map((subcategory) => (
                                                <button
                                                    key={subcategory.id}
                                                    onClick={() => handleSubcategoryClick(subcategory.id, category.name)}
                                                    className={`w-full text-left p-2 text-sm rounded transition-colors ${selectedSubcategory === subcategory.id
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{subcategory.name}</span>
                                                        <span className="text-xs text-gray-400">
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
                                                const isBrandSelected = selectedSubcategory === brand.toLowerCase();

                                                return (
                                                    <button
                                                        key={brand}
                                                        onClick={() => handleSubcategoryClick(brand.toLowerCase(), category.name)}
                                                        className={`w-full text-left p-2 text-sm rounded transition-colors ${isBrandSelected
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span>{brand}</span>
                                                            <span className="text-xs text-gray-400">
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