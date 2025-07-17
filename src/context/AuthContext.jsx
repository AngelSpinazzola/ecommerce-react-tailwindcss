import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

// Estados posibles
const authReducer = (state, action) => {
    switch (action.type) {
        case 'INIT_AUTH':
            return {
                ...state,
                loading: false,
                isAuthenticated: action.payload.isAuthenticated,
                user: action.payload.user,
                token: action.payload.token,
            };
        case 'LOGIN_START':
            return {
                ...state,
                loading: true,
                error: null,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                token: null,
                error: action.payload,
            };
        case 'UPDATE_USER':
            return {
                ...state,
                user: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
                error: null,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem('token');
            const storedUser = authService.getStoredUser();

            if (token && storedUser) {
                dispatch({
                    type: 'INIT_AUTH',
                    payload: {
                        isAuthenticated: true,
                        user: storedUser,
                        token
                    },
                });
            } else {
                dispatch({
                    type: 'INIT_AUTH',
                    payload: {
                        isAuthenticated: false,
                        user: null,
                        token: null
                    },
                });
            }
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            dispatch({ type: 'LOGIN_START' });
            const data = await authService.login(credentials);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: data,
            });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error de conexión';
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: errorMessage,
            });
            return { success: false, error: errorMessage };
        }
    };

    const register = async (userData) => {
        try {
            dispatch({ type: 'LOGIN_START' });
            const data = await authService.register(userData);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: data,
            });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error de conexión';
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: errorMessage,
            });
            return { success: false, error: errorMessage };
        }
    };

    const updateProfile = async (userData) => {
        try {
            const updatedUser = await authService.updateProfile(userData);
            dispatch({
                type: 'UPDATE_USER',
                payload: updatedUser,
            });
            return updatedUser;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        dispatch({ type: 'LOGOUT' });
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        clearError,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};