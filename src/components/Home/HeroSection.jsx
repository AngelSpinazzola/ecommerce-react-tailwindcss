import React from 'react';
import HeroCarousel from './HeroCarousel';

const HeroSection = ({ products }) => {
    const scrollToSearch = () => {
        const element = document.getElementById('search-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 overflow-hidden">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="h-full w-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20">
                
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3l14 9-14 9V3z" />
                        </svg>
                        <span>Nueva Colección Primavera 2024</span>
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                        <span className="block text-gray-900">Moda</span>
                        <span className="block bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent italic">
                            Nova
                        </span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                        Descubre las últimas tendencias en moda. Piezas únicas que definen tu estilo personal.
                        <span className="block mt-2 font-medium text-gray-900">
                            Calidad premium, diseño contemporáneo.
                        </span>
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <button
                            onClick={scrollToSearch}
                            className="group bg-gradient-to-r from-rose-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-rose-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-rose-500/25"
                        >
                            <span className="flex items-center justify-center space-x-2">
                                <span>Explorar Colección</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </button>
                        
                        <button className="group bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
                            <span className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>Favoritos</span>
                            </span>
                        </button>
                    </div>
                    
                    {/* Fashion stats */}
                    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-16">
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">500+</div>
                            <div className="text-sm sm:text-base text-gray-600">Productos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">50+</div>
                            <div className="text-sm sm:text-base text-gray-600">Marcas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">4.9★</div>
                            <div className="text-sm sm:text-base text-gray-600">Valoración</div>
                        </div>
                    </div>
                </div>

                {/* Featured Products Showcase */}
                <div className="pb-16">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                            Tendencias de la Temporada
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Piezas seleccionadas por nuestros expertos en moda
                        </p>
                    </div>
                    
                    <div className="h-[60vh] sm:h-[70vh] lg:h-[80vh]">
                        <HeroCarousel products={products} />
                    </div>
                </div>

                {/* Category showcase */}
                <div className="pb-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        Compra por Categoría
                    </h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                        {[
                            { name: 'Mujer', image: '👗', color: 'from-rose-400 to-pink-500' },
                            { name: 'Hombre', image: '👔', color: 'from-blue-400 to-indigo-500' },
                            { name: 'Niños', image: '👶', color: 'from-yellow-400 to-orange-500' },
                            { name: 'Accesorios', image: '👜', color: 'from-purple-400 to-purple-600' }
                        ].map((category, index) => (
                            <button
                                key={index}
                                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
                            >
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                                    <span>{category.image}</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                                    {category.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fashion brands showcase */}
                <div className="pb-16">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                        Marcas Destacadas
                    </h3>
                    
                    <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                        {['ZARA', 'H&M', 'UNIQLO', 'MANGO', 'BERSHKA', 'PULL&BEAR'].map((brand, index) => (
                            <div key={index} className="text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                {brand}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating fashion elements */}
            <div className="absolute top-20 right-20 hidden lg:block">
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute bottom-40 left-20 hidden lg:block">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
            </div>
            <div className="absolute top-1/2 right-10 hidden lg:block">
                <div className="w-4 h-4 bg-indigo-400 rounded-full opacity-50 animate-pulse"></div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <button 
                    onClick={scrollToSearch}
                    className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    aria-label="Scroll to products"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </button>
            </div>
        </section>
    );
};

export default HeroSection;