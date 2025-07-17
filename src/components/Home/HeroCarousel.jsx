import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';

const HeroCarousel = ({ products = [] }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (products.length === 0) return;

        const timer = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentSlide((prev) => (prev + 1) % Math.min(products.length, 6));
                setIsTransitioning(false);
            }, 200);
        }, 5000);

        return () => clearInterval(timer);
    }, [products]);

    const handleSlideChange = (index) => {
        if (index !== currentSlide && !isTransitioning) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentSlide(index);
                setIsTransitioning(false);
            }, 200);
        }
    };

    const displayProducts = products.slice(0, 6);

    // Loading state
    if (!products || products.length === 0) {
        return (
            <div className="relative h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center space-x-2 mb-4">
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-300"></div>
                    </div>
                    <p className="text-gray-500 text-sm">Cargando colección...</p>
                </div>
            </div>
        );
    }

    const currentProduct = displayProducts[currentSlide];

    if (!currentProduct) return null;

    return (
        <div className="relative h-full bg-white rounded-3xl shadow-2xl overflow-hidden group">
            {/* Main content */}
            <div className="h-full flex flex-col lg:flex-row">
                
                {/* Product Image */}
                <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className={`h-full transition-all duration-500 ${isTransitioning ? 'scale-105 opacity-80' : 'scale-100 opacity-100'}`}>
                        <img
                            src={productService.getImageUrl(currentProduct.mainImageUrl)}
                            alt={currentProduct.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = 'https://picsum.photos/800/600?random=' + currentProduct.id;
                            }}
                        />
                    </div>
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                    
                    {/* Wishlist button */}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-rose-500 hover:bg-white transition-all duration-200 shadow-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Fashion badges */}
                    <div className="absolute bottom-6 left-6 flex space-x-2">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                            Nueva Temporada
                        </span>
                        <span className="bg-rose-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                            Trending
                        </span>
                    </div>
                </div>

                {/* Product Info */}
                <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center bg-white">
                    <div className={`transition-all duration-500 ${isTransitioning ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100'}`}>
                        <div className="space-y-6">
                            
                            {/* Category */}
                            <div className="flex items-center space-x-2">
                                <span className="text-rose-500 text-sm font-medium uppercase tracking-wide">
                                    {currentProduct.category}
                                </span>
                                <div className="w-1 h-1 bg-rose-500 rounded-full"></div>
                                <span className="text-gray-500 text-sm">Colección 2024</span>
                            </div>
                            
                            {/* Product name */}
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                {currentProduct.name}
                            </h3>
                            
                            {/* Description */}
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {currentProduct.description?.substring(0, 120) + '...' || 
                                 "Diseño contemporáneo que combina estilo y comodidad. Perfecto para cualquier ocasión especial."}
                            </p>
                            
                            {/* Price and sizing */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <span className="text-3xl font-bold text-gray-900">
                                        ${currentProduct.price.toFixed(2)}
                                    </span>
                                    <span className="text-sm text-gray-500 line-through">
                                        ${(currentProduct.price * 1.3).toFixed(2)}
                                    </span>
                                    <span className="bg-rose-100 text-rose-600 px-2 py-1 rounded-full text-sm font-medium">
                                        25% OFF
                                    </span>
                                </div>
                                
                                {/* Size selector */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium text-gray-900">Tallas disponibles:</span>
                                    <div className="flex space-x-2">
                                        {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                                            <button
                                                key={size}
                                                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-sm font-medium hover:border-rose-500 hover:text-rose-500 transition-colors"
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Color selector */}
                            <div className="space-y-2">
                                <span className="text-sm font-medium text-gray-900">Colores:</span>
                                <div className="flex space-x-2">
                                    {['bg-gray-900', 'bg-rose-500', 'bg-blue-500', 'bg-green-500'].map((color, index) => (
                                        <button
                                            key={index}
                                            className={`w-8 h-8 rounded-full ${color} border-2 border-white shadow-md hover:scale-110 transition-transform`}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Link
                                    to={`/product/${currentProduct.id}`}
                                    className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-4 rounded-full font-semibold text-center hover:from-rose-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    Ver Producto
                                </Link>
                                <button className="flex-1 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-4 rounded-full font-semibold transition-all duration-300">
                                    Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation dots */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 lg:bottom-8 lg:left-8 lg:transform-none">
                <div className="flex space-x-2">
                    {displayProducts.map((_, index) => (
                        <button
                            key={`dot-${index}`}
                            onClick={() => handleSlideChange(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index === currentSlide 
                                    ? 'bg-rose-500 w-8' 
                                    : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation arrows */}
            <button
                onClick={() => handleSlideChange((currentSlide - 1 + displayProducts.length) % displayProducts.length)}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200 shadow-lg opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Anterior"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            
            <button
                onClick={() => handleSlideChange((currentSlide + 1) % displayProducts.length)}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200 shadow-lg opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Siguiente"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Item counter */}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-gray-900">
                {currentSlide + 1} de {displayProducts.length}
            </div>
        </div>
    );
};

export default HeroCarousel;