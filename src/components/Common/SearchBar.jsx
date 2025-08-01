import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SearchBar = ({ searchTerm, setSearchTerm, placeholder = "Buscar productos..." }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');

    useEffect(() => {
        if (location.pathname.includes('/products') && setSearchTerm) {
            const handler = setTimeout(() => {
                setSearchTerm(localSearchTerm);
            }, 300);

            return () => clearTimeout(handler);
        }
    }, [localSearchTerm, location.pathname, setSearchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmedSearch = localSearchTerm.trim();

        if (trimmedSearch) {
            if (location.pathname === '/' || location.pathname === '/home') {
                navigate(`/products?search=${encodeURIComponent(trimmedSearch)}`);
            } else {
                setSearchTerm(trimmedSearch);
            }
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setLocalSearchTerm(value);
    };

    useEffect(() => {
        if (searchTerm !== undefined) {
            setLocalSearchTerm(searchTerm);
        }
    }, [searchTerm]);

    return (
        <div className="relative group">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={localSearchTerm}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 pl-12 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-nova-cyan focus:border-nova-cyan transition-all duration-200 group-hover:border-gray-600 text-base"
                />
                <svg className="absolute left-4 top-3.5 w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </form>
        </div>
    );
};

export default SearchBar;