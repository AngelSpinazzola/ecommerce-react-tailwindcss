import api from './api';

export const productService = {
  // Obtiene todos los productos (público)
  getAllProducts: async () => {
    const response = await api.get('/product');
    return response.data;
  },

  // Obtiene producto por ID (público)
  getProductById: async (id) => {
    const response = await api.get(`/product/${id}`);
    return response.data;
  },

  // Crea producto (Admin)
  createProduct: async (productData) => {
    const formData = new FormData();

    // Agrega campos de texto
    formData.append('Name', productData.name);
    formData.append('Description', productData.description || '');
    formData.append('Price', productData.price.toString());
    formData.append('Stock', productData.stock.toString());
    formData.append('Category', productData.category || '');

    // Agrega múltiples imágenes si existen
    if (productData.imageFiles && productData.imageFiles.length > 0) {
      for (let i = 0; i < productData.imageFiles.length; i++) {
        formData.append('ImageFiles', productData.imageFiles[i]);
      }
    }

    // Agrega MainImageIndex si existe
    if (productData.mainImageIndex !== undefined) {
      formData.append('MainImageIndex', productData.mainImageIndex.toString());
    }

    console.log('🔍 FormData contents (CREATE):');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ', pair[1]);
    }


    const response = await api.post('/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Actualiza producto (Admin)
  updateProduct: async (id, productData) => {
    const formData = new FormData();

    formData.append('Name', productData.name);
    formData.append('Description', productData.description || '');
    formData.append('Price', productData.price.toString());
    formData.append('Stock', productData.stock.toString());
    formData.append('Category', productData.category || '');
    formData.append('IsActive', productData.isActive.toString());

    // Agrega nuevas imágenes si existen
    if (productData.imageFiles && productData.imageFiles.length > 0) {
      for (let i = 0; i < productData.imageFiles.length; i++) {
        formData.append('ImageFiles', productData.imageFiles[i]);
      }
    }

    // Agrega MainImageIndex si existe
    if (productData.mainImageIndex !== undefined) {
      formData.append('MainImageIndex', productData.mainImageIndex.toString());
    }

    // Justo antes de: const response = await api.put(`/product/${id}`, formData...
    console.log('🔍 FormData contents (UPDATE):');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ', pair[1]);
    }
    const response = await api.put(`/product/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Elimina producto (Admin)
  deleteProduct: async (id) => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  },

  // Obtiene imágenes de un producto
  getProductImages: async (productId) => {
    const response = await api.get(`/product/${productId}/images`);
    return response.data;
  },

  // Agrega imágenes a un producto existente
  addProductImages: async (productId, imageData) => {
    const formData = new FormData();

    if (imageData.imageFiles && imageData.imageFiles.length > 0) {
      for (let i = 0; i < imageData.imageFiles.length; i++) {
        formData.append('ImageFiles', imageData.imageFiles[i]);
      }
    }

    if (imageData.imageUrls && imageData.imageUrls.length > 0) {
      for (let i = 0; i < imageData.imageUrls.length; i++) {
        formData.append('ImageUrls', imageData.imageUrls[i]);
      }
    }

    if (imageData.mainImageIndex !== undefined) {
      formData.append('MainImageIndex', imageData.mainImageIndex.toString());
    }

    // Justo antes de: const response = await api.post(`/product/${productId}/images`, formData...
    console.log('🔍 FormData contents (ADD IMAGES):');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ', pair[1]);
    }
    const response = await api.post(`/product/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Elimina imagen específica
  deleteProductImage: async (productId, imageId) => {
    const response = await api.delete(`/product/${productId}/images/${imageId}`);
    return response.data;
  },

  // Establece imagen principal
  setMainImage: async (productId, imageId) => {
    const response = await api.put(`/product/${productId}/images/${imageId}/main`);
    return response.data;
  },

  // Actualiza orden de imágenes
  updateImagesOrder: async (productId, imagesOrder) => {
    const response = await api.put(`/product/${productId}/images/order`, {
      images: imagesOrder
    });
    return response.data;
  },

  // Obtiene productos por categoría (público)
  getProductsByCategory: async (category) => {
    const response = await api.get(`/product/category/${category}`);
    return response.data;
  },

  // Busca productos (público)
  searchProducts: async (term) => {
    const response = await api.get(`/product/search?term=${encodeURIComponent(term)}`);
    return response.data;
  },

  // Obtiene categorías (público)
  getCategories: async () => {
    const response = await api.get('/product/categories');
    return response.data;
  },

  // Construye URL completa de imagen
  getImageUrl: (imageUrl) => {
    if (!imageUrl) return 'https://picsum.photos/400/300?random=1';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://localhost:7209${imageUrl}`;
  }
};