import React from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';

const ProductCard = ({ product, index = 0 }) => {
    return (
        <div 
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <Link
                to={`/product/${product.id}`}
                className="group block bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
            >
                {/* Product Image */}
                <div className="aspect-square bg-gray-50 overflow-hidden relative">
                    <img
                        src={productService.getImageUrl(product.mainImageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.target.src = 'https://picsum.photos/400/400?random=' + product.id;
                        }}
                    />
                    
                    {/* Out of stock overlay */}
                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-gray-900 font-medium mb-1">Sin Stock</div>
                                <div className="text-gray-500 text-sm">Próximamente</div>
                            </div>
                        </div>
                    )}

                    {/* Quick add button */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                            className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-md"
                            onClick={(e) => {
                                e.preventDefault();
                                // Add to cart logic
                            }}
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-2">
                    {/* Category */}
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {product.category}
                    </div>
                    
                    {/* Product name */}
                    <h3 className="font-medium text-gray-900 line-clamp-2 leading-tight group-hover:text-gray-700 transition-colors">
                        {product.name}
                    </h3>
                    
                    {/* Price and stock info */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="space-y-1">
                            <div className="text-lg font-semibold text-gray-900">
                                ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                            
                            {product.stock > 0 && (
                                <div className="text-xs text-green-600 font-bold">
                                    En stock
                                </div>
                            )}
                        </div>
                        
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;