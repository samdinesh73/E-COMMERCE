import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { API_BASE_URL, ENDPOINTS } from "../constants/config";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("cart_items");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const raw = localStorage.getItem("cart_coupon");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Sync cart with backend when user logs in
  useEffect(() => {
    if (user && token) {
      fetchCartFromBackend();
    }
  }, [user, token]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart_items", JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  // Save coupon to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart_coupon", JSON.stringify(appliedCoupon));
    } catch (e) {}
  }, [appliedCoupon]);

  const fetchCartFromBackend = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.CART}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartItems = response.data.items.map((item) => ({
        id: item.product_id,
        name: item.name,
        price: item.price,
        image: item.image,
        description: item.description,
        quantity: item.quantity,
      }));
      setItems(cartItems);
    } catch (err) {
      console.error("Error fetching cart from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1, selectedVariations = {}) => {
    console.log(`🛒 Adding to cart:`, { product, quantity, selectedVariations });
    
    setItems((prev) => {
      // Check if exact same product with same variations already exists
      const existing = prev.find((i) => {
        // Same product ID
        if (i.id !== product.id) return false;
        
        // Check if variations match
        const existingVarStr = JSON.stringify(i.selectedVariations || {});
        const newVarStr = JSON.stringify(selectedVariations);
        
        return existingVarStr === newVarStr;
      });
      
      if (existing) {
        console.log(`🔄 Item already in cart, updating quantity`);
        return prev.map((i) =>
          i.id === product.id && JSON.stringify(i.selectedVariations || {}) === JSON.stringify(selectedVariations)
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      
      console.log(`✅ Adding new item to cart`);
      const newItem = { ...product, quantity, selectedVariations };
      console.log(`📦 New cart item:`, newItem);
      return [...prev, newItem];
    });

    // Sync with backend if user is logged in
    if (user && token) {
      try {
        console.log(`🔄 Syncing with backend...`);
        await axios.post(
          `${API_BASE_URL}${ENDPOINTS.CART}`,
          {
            product_id: product.id,
            quantity,
            price: product.price,
            selectedVariations,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`✅ Backend sync successful`);
      } catch (err) {
        console.error("Error adding item to backend cart:", err);
      }
    }
  };

  const removeFromCart = async (productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));

    // Sync with backend if user is logged in
    if (user && token) {
      try {
        await axios.delete(`${API_BASE_URL}${ENDPOINTS.CART}/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Error removing item from backend cart:", err);
      }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity } : i))
    );

    // Sync with backend if user is logged in
    if (user && token) {
      try {
        await axios.put(
          `${API_BASE_URL}${ENDPOINTS.CART}/${productId}`,
          { quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Error updating cart quantity in backend:", err);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);

    // Sync with backend if user is logged in
    if (user && token) {
      try {
        await axios.delete(`${API_BASE_URL}${ENDPOINTS.CART}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Error clearing backend cart:", err);
      }
    }
  };

  const getTotalPrice = () => {
    return items.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1),
      0
    );
  };

  const getTotalItems = () =>
    items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.discountAmount || 0;
  };

  const getFinalTotal = () => {
    const subtotal = getTotalPrice();
    const discount = getDiscountAmount();
    return Math.max(0, subtotal - discount);
  };

  const applyCoupon = (couponData) => {
    setAppliedCoupon(couponData);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        appliedCoupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        getDiscountAmount,
        getFinalTotal,
        applyCoupon,
        removeCoupon,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export default CartContext;
