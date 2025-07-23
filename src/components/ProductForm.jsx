import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';

const ProductForm = ({ product, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        brand: '',        // 🆕 NUEVO
        model: '',        // 🆕 NUEVO
        isActive: true
    });

    const [images, setImages] = useState([]); 
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);      // 🆕 NUEVO
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [isNewBrand, setIsNewBrand] = useState(false);    // 🆕 NUEVO
    const [newCategory, setNewCategory] = useState('');
    const [newBrand, setNewBrand] = useState('');          // 🆕 NUEVO

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                stock: product.stock?.toString() || '',
                category: product.category || '',
                brand: product.brand || '',        // 🆕 NUEVO
                model: product.model || '',        // 🆕 NUEVO
                isActive: product.isActive ?? true
            });

            loadProductImages(product.id);
        }

        loadCategories();
        loadBrands();    // 🆕 NUEVO
    }, [product]);

    const loadProductImages = async (productId) => {
        try {
            const images = await productService.getProductImages(productId);
            if (images && images.length > 0) {
                const existingImages = images
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((img) => ({
                        id: img.id,
                        url: productService.getImageUrl(img.imageUrl),
                        isMain: img.isMain,
                        displayOrder: img.displayOrder,
                        isExisting: true,
                        file: null
                    }));
                setImages(existingImages);
            } else if (product.mainImageUrl) {
                setImages([{
                    id: 'main',
                    url: productService.getImageUrl(product.mainImageUrl),
                    isMain: true,
                    displayOrder: 0,
                    isExisting: true,
                    file: null
                }]);
            }
        } catch (error) {
            console.error('Error loading product images:', error);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await productService.getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    // 🆕 NUEVO - Cargar marcas
    const loadBrands = async () => {
        try {
            const data = await productService.getBrands();
            console.log('🔍 Brands loaded:', data); // ✅ Debug
            setBrands(data);
        } catch (err) {
            console.error('Error loading brands:', err);
        }
    };

    const handleCategoryChange = (e) => {
        const selectedValue = e.target.value;

        if (selectedValue === 'nueva') {
            setIsNewCategory(true);
            setNewCategory(''); 
            setFormData(prev => ({ ...prev, category: '' }));
        } else {
            setIsNewCategory(false);
            setNewCategory('');
            setFormData(prev => ({ ...prev, category: selectedValue }));
        }
    };

    // 🆕 NUEVO - Manejo de marcas
    const handleBrandChange = (e) => {
        const selectedValue = e.target.value;

        if (selectedValue === 'nueva') {
            setIsNewBrand(true);
            setNewBrand(''); 
            setFormData(prev => ({ ...prev, brand: '' }));
        } else {
            setIsNewBrand(false);
            setNewBrand('');
            setFormData(prev => ({ ...prev, brand: selectedValue }));
        }
    };

    const handleNewCategoryChange = (e) => {
        const value = e.target.value;
        setNewCategory(value);
        if (isNewCategory) {
            setFormData(prev => ({ ...prev, category: value }));
        }
    };

    // 🆕 NUEVO - Manejo de nueva marca
    const handleNewBrandChange = (e) => {
        const value = e.target.value;
        setNewBrand(value);
        if (isNewBrand) {
            setFormData(prev => ({ ...prev, brand: value }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Valida archivos de imagen
    const validateImageFile = (file) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            return 'Solo se permiten archivos JPG, PNG y WebP';
        }

        if (file.size > maxSize) {
            return 'El archivo debe ser menor a 5MB';
        }

        return null;
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        addNewImages(files);
    };

    const addNewImages = (files) => {
        const newImages = [];

        files.forEach((file, index) => {
            const error = validateImageFile(file);
            if (error) {
                alert(`Error en ${file.name}: ${error}`);
                return;
            }

            const newImage = {
                id: `new_${Date.now()}_${index}`,
                url: URL.createObjectURL(file),
                isMain: false,
                displayOrder: images.length + index,
                isExisting: false,
                file: file
            };

            newImages.push(newImage);
        });

        setImages(prev => {
            const allImages = [...prev, ...newImages];
            return allImages.map((img, index) => ({
                ...img,
                displayOrder: index,
                isMain: index === 0  
            }));
        });
    };

    // Función para actualizar orden en el backend
    const updateImageOrder = async (reorderedImages) => {
        if (!product?.id) return; // Solo para productos existentes

        try {
            const imageOrders = reorderedImages
                .filter(img => img.isExisting && img.id !== 'main')
                .map((img, index) => ({
                    imageId: img.id,
                    displayOrder: index
                }));

            if (imageOrders.length > 0) {
                await productService.updateImagesOrder(product.id, imageOrders);

                // También actualizar cuál es la imagen principal
                const mainImage = reorderedImages.find(img => img.isMain);
                if (mainImage && mainImage.id !== 'main') {
                    await productService.setMainImage(product.id, mainImage.id);
                }
            }
        } catch (error) {
            console.error('Error updating image order:', error);
        }
    };

    // Drag & Drop para archivos
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        addNewImages(files);
    };

    // Drag & Drop para reordenar imágenes
    const handleImageDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleImageDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleImageDrop = async (e, dropIndex) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        const newImages = [...images];
        const draggedImage = newImages[draggedIndex];

        newImages.splice(draggedIndex, 1);
        newImages.splice(dropIndex, 0, draggedImage);

        const updatedImages = newImages.map((img, index) => ({
            ...img,
            displayOrder: index,
            isMain: index === 0  
        }));

        setImages(updatedImages);
        setDraggedIndex(null);

        await updateImageOrder(updatedImages);
    };

    const removeImage = async (index) => {
        const imageToRemove = images[index];

        if (imageToRemove.isExisting && imageToRemove.id !== 'main') {
            try {
                await productService.deleteProductImage(product.id, imageToRemove.id);
                console.log('✅ Image deleted from server:', imageToRemove.id);
            } catch (error) {
                console.error('🚨 Error deleting image:', error);
                alert('Error al eliminar la imagen: ' + error.message);
                return; 
            }
        }

        setImages(prev => {
            const newImages = prev.filter((_, i) => i !== index);
            return newImages.map((img, i) => ({
                ...img,
                displayOrder: i,
                isMain: i === 0  
            }));
        });
    };

    const setAsMainImage = (index) => {
        setImages(prev => prev.map((img, i) => ({
            ...img,
            isMain: i === index
        })));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'El precio debe ser mayor a 0';
        }

        if (!formData.stock || parseInt(formData.stock) < 0) {
            newErrors.stock = 'El stock debe ser 0 o mayor';
        }

        if (!formData.category.trim()) {
            newErrors.category = 'La categoría es requerida';
        }

        // 🆕 NUEVO - Validación de marca
        if (!formData.brand.trim()) {
            newErrors.brand = 'La marca es requerida';
        }

        if (images.length === 0) {
            newErrors.images = 'Debe agregar al menos una imagen';
        }

        if (isNewCategory && !newCategory.trim()) {
            newErrors.category = 'Debe ingresar una nueva categoría';
        }

        if (isNewBrand && !newBrand.trim()) {
            newErrors.brand = 'Debe ingresar una nueva marca';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🆕 ACTUALIZADO - Incluir nueva marca en formData
        if (isNewCategory) {
            setFormData(prev => ({ ...prev, category: newCategory }));
        }
        if (isNewBrand) {
            setFormData(prev => ({ ...prev, brand: newBrand }));
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const productData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category: formData.category.trim(),
                brand: formData.brand.trim(),      // 🆕 NUEVO
                model: formData.model.trim(),      // 🆕 NUEVO
                isActive: formData.isActive
            };

            const newImages = images.filter(img => !img.isExisting && img.file);

            console.log('🔍 Form data object:', formData);
            console.log('🔍 Images array:', images);
            console.log('🔍 New images:', newImages);
            console.log('🔍 Product data being prepared:', productData);
            console.log('🔍 Is update mode:', !!product);

            let savedProduct;

            if (product) {
                const basicProductData = {
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    category: formData.category.trim(),
                    brand: formData.brand.trim(),      // 🆕 NUEVO
                    model: formData.model.trim(),      // 🆕 NUEVO
                    isActive: formData.isActive
                };

                savedProduct = await productService.updateProduct(product.id, basicProductData);

                if (newImages.length > 0) {
                    try {
                        const imageFiles = newImages.map(img => img.file);
                        const mainImageIndex = newImages.findIndex(img => img.isMain);

                        await productService.addProductImages(savedProduct.id, {
                            imageFiles: imageFiles,
                            mainImageIndex: mainImageIndex >= 0 ? mainImageIndex : 0
                        });

                        console.log('✅ Images uploaded successfully');
                    } catch (imageError) {
                        console.error('🚨 Error uploading images:', imageError);
                        alert('Producto actualizado pero hubo un error con las imágenes: ' + imageError.message);
                    }
                }
                
                // ✅ NUEVO - Recargar marcas y categorías después de actualizar
                await loadBrands();
                await loadCategories();
            } else {
                if (newImages.length > 0) {
                    productData.imageFiles = newImages.map(img => img.file);
                    const mainImageIndex = newImages.findIndex(img => img.isMain);
                    if (mainImageIndex >= 0) {
                        productData.mainImageIndex = mainImageIndex;
                    }
                }
                savedProduct = await productService.createProduct(productData);
                
                // ✅ NUEVO - Recargar marcas y categorías después de crear
                await loadBrands();
                await loadCategories();
            }

            onSuccess?.();
        } catch (err) {
            console.error('🚨 Error saving product:', err);
            alert('Error al guardar producto: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nombre del producto *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.name ? 'border-red-500' : ''
                            }`}
                        placeholder="Ej: RTX 4090 Gaming"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Categoría */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Categoría *
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={isNewCategory ? 'nueva' : formData.category}
                        onChange={handleCategoryChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.category ? 'border-red-500' : ''}`}
                    >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="nueva">+ Crear nueva categoría</option>
                    </select>

                    {isNewCategory && (
                        <input
                            type="text"
                            value={newCategory}
                            onChange={handleNewCategoryChange}
                            placeholder="Ingrese nueva categoría"
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    )}

                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>

                {/* 🆕 NUEVO - Marca */}
                <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                        Marca *
                    </label>
                    <select
                        id="brand"
                        name="brand"
                        value={isNewBrand ? 'nueva' : formData.brand}
                        onChange={handleBrandChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.brand ? 'border-red-500' : ''}`}
                    >
                        <option value="">Seleccionar marca</option>
                        {brands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                        <option value="nueva">+ Crear nueva marca</option>
                    </select>

                    {isNewBrand && (
                        <input
                            type="text"
                            value={newBrand}
                            onChange={handleNewBrandChange}
                            placeholder="Ingrese nueva marca"
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    )}

                    {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
                </div>

                {/* 🆕 NUEVO - Modelo */}
                <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                        Modelo
                    </label>
                    <input
                        type="text"
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Ej: ROG Strix Gaming OC"
                    />
                </div>

                {/* Precio */}
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        Precio *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={handleInputChange}
                            className={`block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.price ? 'border-red-500' : ''
                                }`}
                            placeholder="0.00"
                        />
                    </div>
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>

                {/* Stock */}
                <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                        Stock *
                    </label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        min="0"
                        value={formData.stock}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.stock ? 'border-red-500' : ''
                            }`}
                        placeholder="0"
                    />
                    {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                </div>
            </div>

            {/* Descripción */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descripción <span className="text-gray-500">({formData.description.length}/1000 caracteres)</span>
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    maxLength={1000}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Describe las características del producto..."
                />
                {formData.description.length > 950 && (
                    <p className="mt-1 text-sm text-amber-600">
                        ⚠️ Te quedan {1000 - formData.description.length} caracteres
                    </p>
                )}
                {formData.description.length >= 1000 && (
                    <p className="mt-1 text-sm text-red-600">
                        ❌ Has alcanzado el límite máximo de caracteres
                    </p>
                )}
            </div>

            {/* Estado activo */}
            <div className="flex items-center">
                <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Producto activo (visible en la tienda)
                </label>
            </div>

            {/* Gestión de imágenes */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                    Imágenes del producto *
                </label>

                {/* Drop zone para subir imágenes */}
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragOver
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="text-indigo-600 font-medium hover:text-indigo-500">
                                Haz click para seleccionar
                            </span>
                            <span className="text-gray-500"> o arrastra imágenes aquí</span>
                        </label>
                        <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="sr-only"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, WebP hasta 5MB cada una
                    </p>
                </div>

                {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}

                {/* Lista de imágenes con drag & drop para reordenar */}
                {images.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Imágenes cargadas ({images.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {images.map((image, index) => (
                                <div
                                    key={image.id}
                                    draggable
                                    onDragStart={(e) => handleImageDragStart(e, index)}
                                    onDragOver={(e) => handleImageDragOver(e, index)}
                                    onDrop={(e) => handleImageDrop(e, index)}
                                    className={`relative group cursor-move border-2 rounded-lg overflow-hidden transition-all ${draggedIndex === index
                                        ? 'opacity-50'
                                        : 'hover:border-indigo-300'
                                        } ${image.isMain ? 'border-indigo-500' : 'border-gray-300'
                                        }`}
                                >
                                    {/* Imagen */}
                                    <div className="aspect-w-1 aspect-h-1">
                                        <img
                                            src={image.url}
                                            alt={`Producto ${index + 1}`}
                                            className="w-full h-32 object-cover"
                                        />
                                    </div>

                                    {/* Overlay con controles */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                                                title="Eliminar imagen"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="absolute top-2 left-2 space-y-1">
                                        {image.isMain && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                ⭐ Principal
                                            </span>
                                        )}
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {index + 1}
                                        </span>
                                    </div>

                                    {/* Indicador de drag */}
                                    <div className="absolute top-2 right-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                            💡 Arrastra las imágenes para reordenarlas. La primera imagen será la principal por defecto.
                        </p>
                    </div>
                )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                >
                    {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')} Producto
                </button>
            </div>
        </form>
    );
};

export default ProductForm;