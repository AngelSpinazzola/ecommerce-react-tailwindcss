import React, { useState, useImperativeHandle, forwardRef } from 'react';

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
            newExpanded.add(categoryName);
        }
        setExpandedCategories(newExpanded);
    };

    const handleCategoryClick = (categoryName) => {
        onCategoryChange(categoryName);
        onSubcategoryChange(''); // Limpiar subcategoría
        setSidebarOpen(false);

        // Auto-expandir la categoría seleccionada
        const newExpanded = new Set(expandedCategories);
        newExpanded.add(categoryName);
        setExpandedCategories(newExpanded);
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
            w-80 lg:w-64 h-full lg:h-auto bg-white
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            border-r border-gray-100 flex-shrink-0
        `}>
            {/* Header móvil */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">Categorías</h3>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Contenido del sidebar */}
            <div className="p-4 space-y-1 max-h-full overflow-y-auto">

                {/* Todos los productos */}
                <button
                    onClick={() => {
                        onCategoryChange('');
                        onSubcategoryChange('');
                        setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === ''
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Todos los productos</span>
                        <span className="text-sm opacity-75">
                            {allProducts.length}
                        </span>
                    </div>
                </button>

                {/* Separador */}
                <div className="border-t border-gray-100 my-4"></div>

                {/* Título de sección */}
                <div className="px-3 py-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Categorías
                    </h4>
                </div>

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
                        <div key={category.name} className="space-y-1">
                            {/* Categoría principal */}
                            <div className="flex items-stretch">
                                <button onClick={() => handleCategoryClick(category.name)}
                                    className={`flex-1 text-left px-3 py-2 rounded-l-lg transition-colors ${isSelected
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="capitalize font-medium">{category.name}</span>
                                        <span className="text-sm opacity-75">
                                            {category.count}
                                        </span>
                                    </div>
                                </button>

                                {/* Botón expandir/contraer */}
                                {hasExpandableContent && (
                                    <button
                                        onClick={() => toggleCategory(category.name)}
                                        className={`px-2 py-2 rounded-r-lg transition-colors border-l ${isSelected
                                            ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
                                            : 'text-gray-500 hover:bg-gray-100 border-gray-200'
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

                            {/* Subcategorías o Marcas */}
                            {isExpanded && (
                                <div className="ml-6 space-y-1 border-l border-gray-200 pl-3">
                                    {hasSubcategories ? (
                                        // Mostrar subcategorías definidas
                                        category.subcategories.map((subcategory) => (
                                            <button
                                                key={subcategory.id}
                                                onClick={() => handleSubcategoryClick(subcategory.id, category.name)}
                                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${selectedSubcategory === subcategory.id
                                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
                                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${isBrandSelected
                                                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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