import React, { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL, ENDPOINTS } from "../constants/config";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("auth_token") || null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Refresh current user profile from server (returns user or null)
  const refreshUser = async (tok = token) => {
    if (!tok) return null;
    try {
      // Use the auth/me endpoint defined in ENDPOINTS.AUTH_ME
      const resp = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH_ME}`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      // Endpoint returns { user: { ... } }
      if (data?.user) {
        setUser(data.user);
        return data.user;
      }
      // Fallback: if API returns the user object directly
      if (data && data.id) {
        setUser(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error('Refresh user error:', err);
      return null;
    }
  };

  const verifyToken = async (tok) => {
    try {
      // prefer the richer /users/me which includes avatar and phone
      const userProfile = await refreshUser(tok);
      if (!userProfile) {
        setToken(null);
        localStorage.removeItem("auth_token");
      }
    } catch (err) {
      console.error("Token verification error:", err);
      setToken(null);
      localStorage.removeItem("auth_token");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, name) => {
    try {
      const resp = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH_SIGNUP}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Signup failed");
      }

      const data = await resp.json();
      // store token then fetch full profile
      setToken(data.token);
      localStorage.setItem("auth_token", data.token);
      await refreshUser(data.token);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const signin = async (email, password) => {
    try {
      const resp = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH_SIGNIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Signin failed");
      }

      const data = await resp.json();
      // store token then fetch full profile
      setToken(data.token);
      localStorage.setItem("auth_token", data.token);
      await refreshUser(data.token);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, signin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
