import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { API_BASE_URL, ENDPOINTS } from "../constants/config";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (err) {
        console.error("Error loading wishlist:", err);
      }
    }
  }, []);

  // Sync wishlist with backend when user logs in
  useEffect(() => {
    if (user && token) {
      fetchWishlistFromBackend();
    }
  }, [user, token]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const fetchWishlistFromBackend = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.WISHLIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const wishlistItems = response.data.items.map((item) => ({
        id: item.product_id,
        name: item.name,
        price: item.price,
        image: item.image,
        description: item.description,
        addedAt: item.added_at,
      }));
      setWishlist(wishlistItems);
    } catch (err) {
      console.error("Error fetching wishlist from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev;
      }
      return [...prev, { ...product, addedAt: new Date().toISOString() }];
    });

    // Sync with backend if user is logged in
    if (user && token) {
      try {
        await axios.post(
          `${API_BASE_URL}${ENDPOINTS.WISHLIST}`,
          { product_id: product.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Error adding item to backend wishlist:", err);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));

    // Sync with backend if user is logged in
    if (user && token) {
      try {
        await axios.delete(`${API_BASE_URL}${ENDPOINTS.WISHLIST}/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Error removing item from backend wishlist:", err);
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const clearWishlist = async () => {
    setWishlist([]);

    // Note: Backend doesn't have clear all endpoint, delete individually if needed
    if (user && token) {
      try {
        for (const item of wishlist) {
          await axios.delete(`${API_BASE_URL}${ENDPOINTS.WISHLIST}/${item.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (err) {
        console.error("Error clearing backend wishlist:", err);
      }
    }
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        getWishlistCount,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};
