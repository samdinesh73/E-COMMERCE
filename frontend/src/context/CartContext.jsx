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

  const addToCart = async (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...product, quantity }];
    });

    // Sync with backend if user is logged in
    if (user && token) {
      try {
        await axios.post(
          `${API_BASE_URL}${ENDPOINTS.CART}`,
          {
            product_id: product.id,
            quantity,
            price: product.price,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
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

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
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
