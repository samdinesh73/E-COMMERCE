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

  const verifyToken = async (tok) => {
    try {
      const resp = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH_ME}`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setUser(data.user);
      } else {
        setToken(null);
        localStorage.removeItem("auth_token");
      }
    } catch (err) {
      console.error("Token verification error:", err);
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
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("auth_token", data.token);
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
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("auth_token", data.token);
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
    <AuthContext.Provider value={{ user, token, loading, signup, signin, logout }}>
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
