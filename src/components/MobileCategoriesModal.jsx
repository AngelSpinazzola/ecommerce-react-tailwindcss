
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
        <div className="lg:hidden bg-[#2c2c2c] border border-gray-600 rounded-lg shadow-2xl mb-6 overflow-hidden overflow-x-hidden">
            {/* Contenido desplegable */}
            <div className="py-3 max-h-96 overflow-y-auto overflow-x-hidden">
                {/* Todos los productos */}
                <button
                    onClick={() => {
                        onCategoryChange('');
                        onSubcategoryChange('');
                        setExpandedCategories(new Set());
                        onClose();
                    }}
                    className={`w-full text-left px-4 py-2.5 transition-colors duration-150 flex items-center justify-between group ${selectedCategory === ''
                        ? 'bg-[#3a3a3a] text-white'
                        : 'text-gray-300'
                        }`}
                >
                    <span className="text-sm font-medium">Todos los productos</span>
                </button>

                {/* Separador sutil */}
                <div className="h-px bg-[#3a3a3a] mx-3 my-3"></div>

                {/* Lista de categorías */}
                <div>
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
                            <div key={category.name}>
                                {/* Categoría principal - igual que desktop */}
                                <button
                                    onClick={() => handleCategoryClick(category.name)}
                                    className={`w-full text-left px-4 py-2.5 transition-colors duration-150 flex items-center justify-between group ${isSelected
                                        ? 'bg-[#3a3a3a] text-white'
                                        : 'text-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="capitalize text-sm font-medium">{category.name}</span>
                                        <div className="flex items-center gap-2">
                                            {/* Flecha integrada */}
                                            {hasExpandableContent && (
                                                <span
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleCategory(category.name);
                                                    }}
                                                    className="text-gray-500 cursor-pointer"
                                                >
                                                    <svg
                                                        className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''
                                                            }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {/* Subcategorías - igual que desktop */}
                                {isExpanded && (
                                    <div className="ml-4 border-l border-[#3a3a3a]">
                                        {hasSubcategories ? (
                                            // Mostrar subcategorías definidas
                                            category.subcategories.map((subcategory) => (
                                                <button
                                                    key={subcategory.id}
                                                    onClick={() => handleSubcategoryClick(subcategory.id, category.name)}
                                                    className={`w-full text-left px-3 py-2 ml-1 transition-colors duration-150 group ${selectedSubcategory === subcategory.id && selectedCategory === category.name
                                                        ? 'bg-[#3a3a3a] text-white'
                                                        : 'text-gray-400'
                                                        }`}
                                                >
                                                    <span className="text-sm">{subcategory.name}</span>
                                                </button>
                                            ))
                                        ) : (
                                            // Mostrar marcas cuando no hay subcategorías
                                            categoryBrands.map((brand) => {
                                                const brandCount = allProducts.filter(p =>
                                                    p.category === category.name && p.brand === brand
                                                ).length;
                                                const isBrandSelected = selectedSubcategory === brand.toLowerCase() && selectedCategory === category.name;

                                                return (
                                                    <button
                                                        key={brand}
                                                        onClick={() => handleSubcategoryClick(brand.toLowerCase(), category.name)}
                                                        className={`w-full text-left px-3 py-2 ml-1 transition-colors duration-150 group ${isBrandSelected
                                                            ? 'bg-[#3a3a3a] text-white'
                                                            : 'text-gray-400'
                                                            }`}
                                                    >
                                                        <span className="text-sm">{brand}</span>
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