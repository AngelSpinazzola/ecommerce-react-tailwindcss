import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

// Clave para localStorage
const CART_STORAGE_KEY = 'gametech_cart';

// Estados iniciales
const initialState = {
  items: [],
  loading: false,
  error: null
};

const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      // Valida que el formato sea correcto
      if (Array.isArray(parsedCart.items)) {
        return {
          ...initialState,
          items: parsedCart.items
        };
      }
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    // Si hay error, limpia localStorage corrupto
    localStorage.removeItem(CART_STORAGE_KEY);
  }
  return initialState;
};

// Función para guardar carrito en localStorage
const saveCartToStorage = (cartItems) => {
  try {
    const cartData = {
      items: cartItems,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Reducer para manejar acciones del carrito
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
        loading: false
      };

    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      let updatedItems;

      if (existingItemIndex >= 0) {
        // Si el producto ya existe, actualiza la cantidad
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: Math.min(item.quantity + action.payload.quantity, item.stock) }
            : item
        );
      } else {
        // Si es un producto nuevo, lo agrega
        updatedItems = [...state.items, { ...action.payload }];
      }

      // Guarda en localStorage
      saveCartToStorage(updatedItems);

      return {
        ...state,
        items: updatedItems
      };

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      saveCartToStorage(filteredItems);
      
      return {
        ...state,
        items: filteredItems
      };

    case 'UPDATE_QUANTITY':
      const updatedQuantityItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.min(Math.max(1, action.payload.quantity), item.stock) }
          : item
      );
      saveCartToStorage(updatedQuantityItems);

      return {
        ...state,
        items: updatedQuantityItems
      };

    case 'CLEAR_CART':
      saveCartToStorage([]);
      return {
        ...state,
        items: []
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  // Inicializa estado con datos de localStorage
  const [state, dispatch] = useReducer(cartReducer, initialState, loadCartFromStorage);

  useEffect(() => {
    const savedState = loadCartFromStorage();
    dispatch({ type: 'LOAD_CART', payload: savedState.items });
  }, []);

  // Limpia localStorage cuando el carrito esté vacío por mucho tiempo
  useEffect(() => {
    // Limpia carritos antiguos (más de 30 días)
    const clearOldCart = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          const timestamp = new Date(parsedCart.timestamp);
          const now = new Date();
          const daysDiff = (now - timestamp) / (1000 * 60 * 60 * 24);
          
          if (daysDiff > 30) {
            localStorage.removeItem(CART_STORAGE_KEY);
            dispatch({ type: 'CLEAR_CART' });
          }
        }
      } catch (error) {
        console.error('Error checking cart age:', error);
      }
    };

    clearOldCart();
  }, []);

  const addToCart = (product, quantity = 1) => {
    try {
      // Validaciones
      if (!product || !product.id) {
        toast.error('Producto inválido');
        return false;
      }

      if (quantity <= 0) {
        toast.error('Cantidad debe ser mayor a 0');
        return false;
      }

      if (!product.isActive) {
        toast.error('Este producto no está disponible');
        return false;
      }

      if (product.stock <= 0) {
        toast.error('Producto sin stock');
        return false;
      }

      // Verifica si ya existe en el carrito
      const existingItem = state.items.find(item => item.id === product.id);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const newTotalQuantity = currentQuantity + quantity;

      if (newTotalQuantity > product.stock) {
        toast.error(`Solo hay ${product.stock} unidades disponibles`);
        return false;
      }

      // Prepara item para el carrito
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        mainImageUrl: product.mainImageUrl,
        stock: product.stock,
        quantity: quantity
      };

      dispatch({ type: 'ADD_ITEM', payload: cartItem });
      
      if (existingItem) {
        toast.success(`Cantidad actualizada: ${product.name}`);
      } else {
        toast.success(`Agregado al carrito: ${product.name}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error al agregar al carrito');
      return false;
    }
  };

  const removeFromCart = (productId) => {
    try {
      const item = state.items.find(item => item.id === productId);
      if (item) {
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
        toast.success(`Eliminado: ${item.name}`);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Error al eliminar del carrito');
    }
  };

  const updateQuantity = (productId, quantity) => {
    try {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      const item = state.items.find(item => item.id === productId);
      if (item && quantity > item.stock) {
        toast.error(`Solo hay ${item.stock} unidades disponibles`);
        return;
      }

      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Error al actualizar cantidad');
    }
  };

  const clearCart = () => {
    try {
      dispatch({ type: 'CLEAR_CART' });
      toast.success('Carrito vaciado');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Error al vaciar carrito');
    }
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  const getCartItemQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Emigra carrito de usuario anónimo a usuario logueado
  const migrateAnonymousCart = async (userId) => {
    console.log('Cart migration for user:', userId);
  };

  // Limpia carrito vencido
  const cleanExpiredCart = () => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error cleaning expired cart:', error);
    }
  };

  const value = {
    // Estado
    cartItems: state.items,
    loading: state.loading,
    error: state.error,

    // Acciones
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // Utilidades
    getCartTotal,
    getCartItemsCount,
    isInCart,
    getCartItemQuantity,

    // Funciones avanzadas
    migrateAnonymousCart,
    cleanExpiredCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;