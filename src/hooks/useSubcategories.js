import { useMemo } from 'react';
import { detectSubcategory } from '../utils/subcategoryDetector';
import { SUBCATEGORY_RULES } from '../config/subcategories';

export const useSubcategories = (products, selectedCategory) => {
    return useMemo(() => {
        if (!selectedCategory) return [];

        const normalizedCategory = selectedCategory.toLowerCase();

        // Verificar si esta categoría tiene subcategorías definidas
        if (!SUBCATEGORY_RULES[normalizedCategory]) {
            // Si no hay subcategorías definidas, devolver las marcas como subcategorías
            const categoryProducts = products.filter(product =>
                product.category.toLowerCase() === normalizedCategory
            );

            const brands = [...new Set(
                categoryProducts
                    .map(product => product.brand)
                    .filter(Boolean)
            )];

            return brands.map(brand => ({
                id: brand.toLowerCase(),
                name: brand,
                category: selectedCategory,
                count: categoryProducts.filter(p => p.brand === brand).length,
                priority: 999 // Prioridad baja para marcas
            }));
        }

        // Filtrar productos de la categoría seleccionada
        const categoryProducts = products.filter(product =>
            product.category.toLowerCase() === normalizedCategory
        );

        // Agrupar por subcategoría
        const subcategoryGroups = {};

        categoryProducts.forEach(product => {
            const subcategory = detectSubcategory(product.name, selectedCategory);

            if (!subcategoryGroups[subcategory.id]) {
                subcategoryGroups[subcategory.id] = {
                    ...subcategory,
                    products: [],
                    count: 0
                };
            }

            subcategoryGroups[subcategory.id].products.push(product);
            subcategoryGroups[subcategory.id].count++;
        });

        // Convertir a array y ordenar por prioridad
        return Object.values(subcategoryGroups)
            .sort((a, b) => a.priority - b.priority);

    }, [products, selectedCategory]);
};