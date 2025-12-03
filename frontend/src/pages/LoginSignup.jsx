import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginSignup() {
  const [mode, setMode] = useState("signin"); // "signin", "signup", "phone", "otp"
  const [authMethod, setAuthMethod] = useState("email"); // "email" or "phone"
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    name: "",
    phone: "",
    otp: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const { signin, signup } = useAuth();
  const navigate = useNavigate();

  // OTP Timer Effect
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    setError("");
  };

  // Validate Phone Number
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    if (!form.phone) {
      setError("Phone number is required");
      return;
    }

    const cleanedPhone = form.phone.replace(/\D/g, '');
    console.log("[Frontend] Sending OTP for phone:", cleanedPhone);

    if (!validatePhone(cleanedPhone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      console.log("[Frontend] API URL:", apiUrl);
      
      const response = await fetch(`${apiUrl}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanedPhone })
      });

      console.log("[Frontend] Response status:", response.status);
      
      const data = await response.json();
      console.log("[Frontend] Response data:", data);
      
      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to send OTP");
      }

      setOtpSent(true);
      setOtpTimer(60); // 60 seconds timer
      setError("");
    } catch (err) {
      console.error("[Frontend] Send OTP error:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and Signup
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!form.otp) {
      setError("OTP is required");
      return;
    }

    if (form.otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    if (mode === "signup" && !form.name) {
      setError("Name is required");
      return;
    }

    if (mode === "signup" && (!form.password || !form.confirmPassword)) {
      setError("Password and confirm password are required");
      return;
    }

    if (mode === "signup" && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cleanedPhone = form.phone.replace(/\D/g, '');
      console.log("[Frontend-Verify] Verifying OTP:", { phone: cleanedPhone, otp: form.otp });

      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: cleanedPhone,
          otp: form.otp,
          name: form.name,
          password: form.password,
          action: mode === "signin" ? "login" : "signup"
        })
      });

      console.log("[Frontend-Verify] Response status:", response.status);

      const data = await response.json();
      console.log("[Frontend-Verify] Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to verify OTP");
      }

      // Store token if provided
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/myaccount");
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Email Authentication
  const handleEmailSubmit = async (e) => {
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
        if (form.password !== form.confirmPassword) {
          throw new Error("Passwords do not match");
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

  const switchAuthMethod = () => {
    setAuthMethod(authMethod === "email" ? "phone" : "email");
    setOtpSent(false);
    setOtpTimer(0);
    setError("");
    setForm({ email: "", password: "", name: "", phone: "", otp: "", confirmPassword: "" });
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setAuthMethod("email");
    setOtpSent(false);
    setOtpTimer(0);
    setError("");
    setForm({ email: "", password: "", name: "", phone: "", otp: "", confirmPassword: "" });
  };

  return (
    <div className="container-app py-12 flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-2 text-center">
          {mode === "signin" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          {mode === "signin" ? "Sign in to your account" : "Join our community"}
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Auth Method Tabs */}
        {!otpSent && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => authMethod === "phone" && switchAuthMethod()}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                authMethod === "email"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📧 Email
            </button>
            {/* <button
              onClick={() => authMethod === "email" && switchAuthMethod()}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                authMethod === "phone"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📱 Phone
            </button> */}
          </div>
        )}

        {/* Email Authentication */}
        {authMethod === "email" && !otpSent && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="••••••••"
                required
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        )}

        {/* Phone OTP Authentication */}
        {authMethod === "phone" && !otpSent && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-gray-100 rounded-lg border border-gray-300 text-gray-600 font-medium">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="10-digit number"
                  maxLength="10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* OTP Verification */}
        {authMethod === "phone" && otpSent && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Enter OTP sent to +91 {form.phone}
              </label>
              <input
                type="text"
                name="otp"
                value={form.otp}
                onChange={handleChange}
                maxLength="6"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-center text-2xl font-bold tracking-widest"
                placeholder="000000"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Didn't receive OTP?</span>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpTimer > 0 || loading}
                className="text-black font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Verifying..." : "Verify OTP & Continue"}
            </button>
          </form>
        )}

        {/* Toggle Mode */}
        <div className="mt-6 text-center border-t pt-6">
          <p className="text-sm text-gray-600 mb-3">
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={switchMode}
            className="text-sm font-semibold text-black underline hover:opacity-80 transition-opacity"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
          💡 <strong>Tip:</strong> {authMethod === "email" 
            ? "Use email for traditional login with password" 
            : "Use phone number for quick OTP-based login"}
        </div>
      </div>
    </div>
  );
}
