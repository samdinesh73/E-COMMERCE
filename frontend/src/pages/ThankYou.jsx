import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Package, MapPin, Phone, Mail, Calendar } from "lucide-react";
import { getImageUrl } from "../utils/imageHelper";
import { API_BASE_URL, ENDPOINTS } from "../constants/config";

export default function ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order details from location state
    const orderData = location.state?.order;
    const orderItems = location.state?.items || [];

    if (!orderData) {
      // No order data passed, redirect to shop
      navigate("/shop");
      return;
    }

    setOrder(orderData);
    setItems(orderItems);
    setLoading(false);
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Order details not found.</p>
          <button
            onClick={() => navigate("/shop")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-20 h-20 text-green-600 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Thank You for Your Order!</h1>
          <p className="text-gray-600 text-lg">Your order has been successfully placed.</p>
          <p className="text-green-600 font-semibold mt-2">
            A confirmation email has been sent to your inbox.
          </p>
        </div>

        {/* Order Number */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-8 text-center">
          <p className="text-gray-600 text-sm font-medium">Order Number</p>
          <p className="text-3xl font-bold text-blue-600">#{order.id}</p>
          <p className="text-gray-500 text-sm mt-2">
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Package className="w-6 h-6 mr-2 text-blue-600" />
            Order Items
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Quantity</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <p className="font-semibold text-gray-900">
                          {item.product_name || item.name || "Product"}
                        </p>
                      </td>
                      <td className="text-center py-4 px-4 text-gray-600">{item.quantity}</td>
                      <td className="text-right py-4 px-4 text-gray-600">
                        ₹{parseFloat(item.price).toFixed(2)}
                      </td>
                      <td className="text-right py-4 px-4 font-semibold text-gray-900">
                        ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                    {/* Show Variations if present */}
                    {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <td colSpan="4" className="py-3 px-4">
                          <div className="text-sm">
                            <p className="font-semibold text-gray-700 mb-2">Variations:</p>
                            <div className="space-y-1 ml-4">
                              {Object.entries(item.selectedVariations).map(([type, variation]) => (
                                <p key={type} className="text-gray-600">
                                  <span className="font-medium">{type}:</span> {variation.variation_value || variation.name}
                                </p>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t-2 border-gray-200 flex justify-end">
            <div className="w-full sm:w-64">
              <div className="flex justify-between mb-3">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900 font-semibold">
                  ₹{parseFloat(order.total_price).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-900 font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-900 font-bold">Total Amount:</span>
                <span className="text-green-600 font-bold text-xl">
                  ₹{parseFloat(order.total_price).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Shipping Address
            </h3>
            <div className="text-gray-700 space-y-2">
              <p className="font-semibold">{order.full_name || order.guest_name || "Customer"}</p>
              <p>{order.shipping_address}</p>
              <p>
                {order.city}, {order.pincode}
              </p>
              {order.phone && (
                <p className="flex items-center mt-3">
                  <Phone className="w-4 h-4 mr-2 text-blue-600" />
                  {order.phone}
                </p>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-600" />
              Payment Details
            </h3>
            <div className="text-gray-700 space-y-3">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-semibold capitalize">
                  {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Order Status:</span>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold capitalize">
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span>Email:</span>
                <span className="font-semibold text-sm">
                  {order.email || order.guest_email || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3">What's Next?</h3>
          <ul className="text-gray-700 space-y-2 ml-4 list-disc">
            <li>Your order will be processed and packed within 1-2 business days</li>
            <li>You'll receive a shipping update via email with tracking details</li>
            <li>Expected delivery: 5-7 business days</li>
            <li>Check your email for order confirmation and further updates</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/shop")}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/myaccount")}
            className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            View My Orders
          </button>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Need help? Contact us at{" "}
            <a href="mailto:support@shop.com" className="text-blue-600 font-semibold hover:underline">
              support@shop.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
