import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';

const SidebarHierarchical = forwardRef(({
    allProducts,
    selectedCategory,
    selectedSubcategory,
    onCategoryChange,
    onSubcategoryChange,
    sidebarOpen,
    setSidebarOpen,
    categoriesWithSubcategories
}, ref) => {
    const [expandedCategories, setExpandedCategories] = useState(new Set([selectedCategory]));

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

    // Exponer función para resetear desde el padre
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
        setSidebarOpen(false);
    };

    const handleSubcategoryClick = (subcategoryId, categoryName) => {
        if (selectedCategory !== categoryName) {
            onCategoryChange(categoryName);
        }

        onSubcategoryChange(subcategoryId);
        setSidebarOpen(false);
    };

    return (
        <div className={`
            fixed lg:static top-0 left-0 z-50 lg:z-auto
            w-80 lg:w-64 h-full lg:h-auto bg-[#2c2c2c]
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            flex-shrink-0 shadow-2xl lg:shadow-none
        `}>
            {/* Header móvil */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#3a3a3a]">
                <h3 className="text-sm font-medium text-white">Categorías</h3>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-[#3a3a3a] rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="hidden lg:block p-4 border-b border-[#3a3a3a]">
                <h3 className="text-sm font-medium text-white">Categorías</h3>
            </div>
            {/* Contenido del sidebar - SIN header en desktop */}
            <div className="py-3 max-h-full overflow-y-auto overflow-x-hidden">

                {/* Todos los productos */}
                <button
                    onClick={() => {
                        onCategoryChange('');
                        onSubcategoryChange('');
                        setExpandedCategories(new Set());
                        setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 transition-colors duration-150 flex items-center justify-between group ${selectedCategory === ''
                        ? 'bg-[#3a3a3a] text-white'
                        : 'text-gray-300 hover:bg-[#3a3a3a] hover:text-white'
                        }`}
                >
                    <span className="text-sm font-medium">Todos los productos</span>
                </button>

                {/* Separador sutil */}
                <div className="h-px bg-[#3a3a3a] mx-3 my-3"></div>

                {/* Categorías con estructura jerárquica */}
                {categoriesWithSubcategories.map((category) => {
                    const isSelected = selectedCategory === category.name;
                    const isExpanded = expandedCategories.has(category.name);
                    const hasSubcategories = category.subcategories.length > 0;

                    // Calcular si tiene marcas (para mostrar flecha)
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
                            {/* Categoría principal - UN SOLO BOTÓN */}
                            <button
                                onClick={() => handleCategoryClick(category.name)}
                                className={`w-full text-left px-4 py-2.5 transition-colors duration-150 flex items-center justify-between group ${isSelected
                                    ? 'bg-[#3a3a3a] text-white'
                                    : 'text-gray-300 hover:bg-[#3a3a3a] hover:text-white'
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
                                                className="text-gray-500 group-hover:text-gray-300 cursor-pointer"
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

                            {/* Subcategorías o Marcas */}
                            {isExpanded && (
                                <div className="ml-4 border-l border-[#3a3a3a]">
                                    {hasSubcategories ? (
                                        // Mostrar subcategorías definidas
                                        category.subcategories.map((subcategory) => (
                                            <button
                                                key={subcategory.id}
                                                onClick={() => handleSubcategoryClick(subcategory.id, category.name)}
                                                className={`w-full text-left px-3 py-2 ml-1 transition-colors duration-150 flex items-center justify-between group ${selectedSubcategory === subcategory.id
                                                    ? 'bg-[#3a3a3a] text-white'
                                                    : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-gray-200'
                                                    }`}
                                            >
                                                <span className="text-sm">{subcategory.name}</span>
                                            </button>
                                        ))
                                    ) : (
                                        // Mostrar marcas cuando no hay subcategorías
                                        (() => {
                                            const categoryBrands = [...new Set(
                                                allProducts
                                                    .filter(product => product.category === category.name)
                                                    .map(product => product.brand)
                                                    .filter(Boolean)
                                            )];

                                            return categoryBrands.map((brand) => {
                                                const brandCount = allProducts.filter(p =>
                                                    p.category === category.name && p.brand === brand
                                                ).length;

                                                const isBrandSelected = selectedSubcategory === brand.toLowerCase();

                                                return (
                                                    <button
                                                        key={brand}
                                                        onClick={() => handleSubcategoryClick(brand.toLowerCase(), category.name)}
                                                        className={`w-full text-left px-3 py-2 ml-1 transition-colors duration-150 flex items-center justify-between group ${isBrandSelected
                                                            ? 'bg-[#3a3a3a] text-white'
                                                            : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-gray-200'
                                                            }`}
                                                    >
                                                        <span className="text-sm">{brand}</span>
                                                    </button>
                                                );
                                            });
                                        })()
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default SidebarHierarchical;