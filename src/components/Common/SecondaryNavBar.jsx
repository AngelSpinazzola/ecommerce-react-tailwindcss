import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';

const SecondaryNavBar = () => {
    const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
    const [menuStructure, setMenuStructure] = useState({ categories: [] });
    const [expandedCategory, setExpandedCategory] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadMenuStructure();
    }, []);

    const loadMenuStructure = async () => {
        try {
            const structure = await productService.getMenuStructure();
            setMenuStructure(structure);
        } catch (error) {
            console.error('Error loading menu structure:', error);
            setMenuStructure({ categories: [] });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showCategoriesDropdown && !event.target.closest('.categories-dropdown-container')) {
                setShowCategoriesDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCategoriesDropdown]);

    const navigateToProducts = (category, brand = null) => {
        let path = '/';
        let params = new URLSearchParams();
        
        if (category) {
            params.append('category', category);
        }
        if (brand) {
            params.append('brand', brand);
        }
        
        if (params.toString()) {
            path += '?' + params.toString();
        }
        
        navigate(path);
        setShowCategoriesDropdown(false);
        
        setTimeout(() => {
            const productsSection = document.getElementById('all-products-section');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    // 🆕 NUEVA FUNCIÓN - Navegación a página de categorías
    const navigateToCategoriesPage = (category = null, brand = null) => {
        let path = '/categories';
        let params = new URLSearchParams();
        
        if (category) {
            params.append('category', category);
        }
        if (brand) {
            params.append('brand', brand);
        }
        
        if (params.toString()) {
            path += '?' + params.toString();
        }
        
        navigate(path);
        setShowCategoriesDropdown(false);
    };

    return (
        <div className="bg-gray-800/90 border-t border-gray-700 fixed top-20 w-full z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center h-14">
                    <nav className="flex items-center space-x-8">
                        <Link
                            to="/productos"
                            className="text-base text-gray-300 hover:text-purple-400 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-gray-700/50"
                        >
                            Productos
                        </Link>
                        <Link
                            to="/ofertas"
                            className="text-base text-gray-300 hover:text-purple-400 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-gray-700/50"
                        >
                            Ofertas
                        </Link>
                        <div className="relative categories-dropdown-container">
                            <button
                                onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                                className="flex items-center space-x-2 text-base text-gray-300 hover:text-purple-400 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-gray-700/50"
                            >
                                <span>Categorías</span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${showCategoriesDropdown ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showCategoriesDropdown && (
                                <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-96 bg-gray-900 rounded-xl shadow-2xl border border-gray-800 z-50 overflow-hidden max-h-96 overflow-y-auto">
                                    <div className="p-3">
                                        {/* 🆕 NUEVO - Botón para ver todas las categorías */}
                                        <div className="border-b border-gray-800 pb-3 mb-3">
                                            <button
                                                onClick={() => navigateToCategoriesPage()}
                                                className="w-full text-left py-3 px-4 text-sm font-bold text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 rounded-lg transition-all duration-200 bg-purple-900/20"
                                            >
                                                🔥 Ver todas las categorías
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-1">
                                            {menuStructure.categories.map((category) => (
                                                <div key={category.name} className="border-b border-gray-800 last:border-b-0 py-1">
                                                    <div className="flex items-center justify-between">
                                                        <button
                                                            onClick={() => navigateToCategoriesPage(category.name)}
                                                            className="flex-1 text-left py-3 px-4 text-sm font-semibold text-gray-300 hover:text-purple-400 hover:bg-purple-900/20 rounded-lg transition-all duration-200"
                                                        >
                                                            {category.name}
                                                        </button>
                                                        {category.brands.length > 0 && (
                                                            <button
                                                                onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
                                                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                                            >
                                                                <svg
                                                                    className={`w-4 h-4 text-gray-400 transition-transform ${
                                                                        expandedCategory === category.name ? 'rotate-180' : ''
                                                                    }`}
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>

                                                    {expandedCategory === category.name && category.brands.length > 0 && (
                                                        <div className="ml-6 pb-3 space-y-1">
                                                            <div className="grid grid-cols-2 gap-1">
                                                                {category.brands.map((brand) => (
                                                                    <button
                                                                        key={brand.name}
                                                                        onClick={() => navigateToCategoriesPage(category.name, brand.name)}
                                                                        className="text-left text-sm text-gray-400 hover:text-purple-400 py-2 px-3 rounded-lg hover:bg-purple-900/20 transition-colors"
                                                                    >
                                                                        • {brand.name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default SecondaryNavBar;