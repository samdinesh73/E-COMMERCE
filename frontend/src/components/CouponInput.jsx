import React, { useState } from "react";
import { Check, X, Loader } from "lucide-react";
import axios from "axios";

const CouponInput = ({ orderTotal, onCouponApply, appliedCoupon, onRemoveCoupon }) => {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleValidateCoupon = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/coupons/validate`;
      console.log("🔍 Validating coupon at:", apiUrl);
      console.log("📦 Request data:", { code: couponCode, orderTotal: orderTotal });
      
      const response = await axios.post(apiUrl, {
        code: couponCode,
        orderTotal: orderTotal,
      });

      console.log("✅ Response received:", response.data);

      if (response.data.valid) {
        setSuccess(true);
        setCouponCode("");
        console.log("🎉 Coupon applied:", response.data.coupon.code);
        onCouponApply(response.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Invalid coupon code";
      setError(errorMsg);
      console.error("❌ Coupon validation error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">
                Coupon Applied: {appliedCoupon.coupon.code}
              </p>
              <p className="text-sm text-green-700">
                Discount: ₹{appliedCoupon.discountAmount}
              </p>
            </div>
          </div>
          <button
            onClick={onRemoveCoupon}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Remove coupon"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Have a coupon code?
      </label>
      <form onSubmit={handleValidateCoupon} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => {
            setCouponCode(e.target.value.toUpperCase());
            setError("");
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !couponCode.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Applying...
            </>
          ) : (
            "Apply"
          )}
        </button>
      </form>
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}
      {success && !appliedCoupon && (
        <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
          <Check className="w-4 h-4" />
          Coupon applied successfully!
        </div>
      )}
    </div>
  );
};

export default CouponInput;
