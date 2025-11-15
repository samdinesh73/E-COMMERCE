import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginSignup() {
  const [mode, setMode] = useState("signin"); // "signin" or "signup"
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signin, signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signin") {
        if (!form.email || !form.password) {
          throw new Error("Email and password are required");
        }
        await signin(form.email, form.password);
      } else {
        if (!form.email || !form.password || !form.name) {
          throw new Error("Email, password and name are required");
        }
        await signup(form.email, form.password, form.name);
      }
      navigate("/myaccount");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-12 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md border rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </h1>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded focus:outline-none focus:border-black"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded focus:outline-none focus:border-black"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded focus:outline-none focus:border-black"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-black text-white rounded font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setForm({ email: "", password: "", name: "" });
            }}
            className="text-sm font-semibold text-black underline hover:opacity-80"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
