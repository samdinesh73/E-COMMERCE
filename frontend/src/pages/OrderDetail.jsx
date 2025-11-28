import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, ENDPOINTS } from "../constants/config";
import { ArrowLeft, Loader, MapPin, Package, ShoppingBag, User, Mail, Phone } from "lucide-react";

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetchOrder();
  }, [orderId, token]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE_URL}${ENDPOINTS.ORDERS}/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch order");
      }

      const data = await resp.json();
      // Handle multiple possible response shapes from backend:
      // - { order: {...} } where order has items array
      // - { order: {...}, items: [...] }
      // - direct order object with items
      let orderObj = data.order || data;
      let itemsArr = data.items || orderObj.items || [];
      setOrder(orderObj);
      setItems(itemsArr || []);
    } catch (err) {
      console.error("Fetch order error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Normalize variations for render: returns array of [key, displayValue]
  const getVariationEntries = (item) => {
    try {
      let variations = item.selectedVariations;
      // fallback to raw variations field if parsing didn't occur on server
      if ((!variations || Object.keys(variations).length === 0) && item.variations) {
        try {
          variations = typeof item.variations === 'string' ? JSON.parse(item.variations) : item.variations;
        } catch (e) {
          // if parsing fails, leave as string
          variations = { info: item.variations };
        }
      }

      if (!variations) return [];

      // If variations is an array, convert to object-like entries
      if (Array.isArray(variations)) {
        return variations.map((v, i) => [String(i), v]);
      }

      // If it's an object, return entries
      return Object.entries(variations);
    } catch (err) {
      console.error('Variation normalization error for item', item, err);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="h-10 w-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/myaccount')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div className="p-6 bg-white rounded-lg border border-red-100 text-red-700">{error || 'Order not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/myaccount')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Orders
        </button>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                <p className="text-gray-600 mt-1">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {order.status || 'pending'}
              </span>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900"><User className="h-5 w-5 text-blue-600" /> Customer</h2>
                <div className="mt-3 bg-gray-50 p-4 rounded">
                  <p className="font-medium text-gray-900">{order.full_name || order.guest_name || '-'}</p>
                  <p className="text-sm text-gray-600 mt-1">{order.email || order.guest_email || '-'}</p>
                  <p className="text-sm text-gray-600 mt-1">{order.phone || order.phone_number || '-'}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900"><Package className="h-5 w-5 text-blue-600" /> Summary</h2>
                <div className="mt-3 bg-gray-50 p-4 rounded">
                  <div className="flex justify-between"><span className="text-gray-700">Order ID</span><span className="font-semibold">#{order.id}</span></div>
                  <div className="flex justify-between mt-2"><span className="text-gray-700">Total</span><span className="font-semibold">₹{parseFloat(order.total_price || order.total_amount || 0).toFixed(2)}</span></div>
                  <div className="flex justify-between mt-2"><span className="text-gray-700">Payment</span><span className="font-semibold">{order.payment_method || '-'}</span></div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900"><MapPin className="h-5 w-5 text-blue-600" /> Shipping</h3>
              <div className="mt-3 bg-gray-50 p-4 rounded">
                <p className="font-medium text-gray-900">{order.shipping_address || '-'}</p>
                <p className="text-sm text-gray-600 mt-1">{order.city || '-'} • {order.pincode || '-'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-900"><ShoppingBag className="h-5 w-5 text-blue-600" /> Items</h3>
              {items && items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 rounded p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{item.product_name || item.name || 'Product'}</p>
                          <p className="text-sm text-gray-600 mt-1">Qty: <span className="font-medium">{item.quantity}</span></p>
                        </div>
                        <div className="text-gray-900 font-semibold">₹{(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
                      </div>

                      {getVariationEntries(item).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-700">
                          {getVariationEntries(item).map(([k, v]) => {
                            const display = (v && typeof v === 'object')
                              ? (v.variation_value || v.name || v.label || v.value || JSON.stringify(v))
                              : String(v);
                            return (
                              <div key={k} className="flex gap-2">
                                <span className="font-medium">{k}:</span>
                                <span>{display}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded text-center text-gray-600">No items found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
