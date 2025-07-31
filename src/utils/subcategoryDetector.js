import { SUBCATEGORY_RULES } from '../config/subcategories';

// Motor de detección universal
export const detectSubcategory = (productName, categoryName) => {
    const normalizedCategory = categoryName.toLowerCase();
    const normalizedName = productName.toLowerCase();
    
    // Buscar reglas para esta categoría
    const categoryRules = SUBCATEGORY_RULES[normalizedCategory];
    if (!categoryRules) {
        return null; // No hay subcategorías definidas
    }
    
    // Ordenar tipos por prioridad
    const sortedTypes = Object.values(categoryRules.types)
        .sort((a, b) => a.priority - b.priority);
    
    // Detectar el primer tipo que haga match
    for (const type of sortedTypes) {
        const hasMatch = type.keywords.some(keyword => 
            normalizedName.includes(keyword.toLowerCase())
        );
        
        if (hasMatch) {
            return {
                ...type,
                category: categoryName
            };
        }
    }
    
    // Si no encuentra nada, retornar tipo "otros"
    return {
        id: 'otros',
        name: 'Otros',
        description: 'Otros productos de esta categoría',
        category: categoryName,
        priority: 999
    };
};