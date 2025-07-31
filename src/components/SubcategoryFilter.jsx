import React from 'react';
import { useSubcategories } from '../hooks/useSubcategories';

export const SubcategoryFilter = ({ 
    products, 
    selectedCategory, 
    selectedSubcategory, 
    onSubcategoryChange 
}) => {
    const subcategories = useSubcategories(products, selectedCategory);
    
    if (subcategories.length === 0) {
        return null; // No mostrar si no hay subcategorías
    }
    
    return (
        <div className="ml-6 space-y-1 border-l border-gray-100 pl-3">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Tipos de {selectedCategory}
            </h5>
            
            {subcategories.map((subcategory) => (
                <button
                    key={subcategory.id}
                    onClick={() => onSubcategoryChange(subcategory.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        selectedSubcategory === subcategory.id
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="font-medium">{subcategory.name}</div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {subcategory.description}
                            </p>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-3 flex-shrink-0">
                            {subcategory.count}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
};