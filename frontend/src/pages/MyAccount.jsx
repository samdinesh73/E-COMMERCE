import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, ENDPOINTS } from "../constants/config";
import { ChevronRight } from "lucide-react";

export default function MyAccount() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUserProfile();
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}${ENDPOINTS.ORDERS}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await resp.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) {
        throw new Error("Failed to load user profile");
      }

      const data = await resp.json();
      setUserProfile(data.user);
    } catch (err) {
      console.error("Fetch user profile error:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!token) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="container-app py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        <button onClick={handleLogout} className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800">
          Logout
        </button>
      </div>

      {/* User Profile Banner + Menu (Light Mode) */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-semibold text-gray-700 overflow-hidden">
            {userProfile?.avatar ? (
              // Check if avatar is a URL (starts with /) or an emoji
              userProfile.avatar.startsWith('/') ? (
                <img src={`${API_BASE_URL}${userProfile.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                // Display emoji avatar
                <span className="text-4xl">{userProfile.avatar}</span>
              )
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-gray-900">{userProfile?.name || user?.name}</p>
                <p className="text-sm text-gray-600">{userProfile?.email || user?.email}</p>
                {(userProfile?.phone || user?.phone) && <p className="text-sm text-gray-600 mt-1">{userProfile?.phone || user?.phone}</p>}
              </div>
              <button onClick={() => navigate('/account/edit')} className="text-yellow-600 font-medium">Edit</button>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-lg border overflow-hidden">
          {[
            'Orders',
            'Customer Care',
          
      
            'My Rewards',
            'Address',
           
            
            'How To Return',
            'Terms & Conditions',
            'Privacy Policy'
          
          ].map((label) => (
            <button
              key={label}
              onClick={() => {
                if (label === 'Orders') navigate('/orders');
                if (label === 'Address') navigate('/addresses');
                if (label === 'How To Return') navigate('/how-to-return');
                if (label === 'Terms & Conditions') navigate('/terms-conditions');
                if (label === 'Privacy Policy') navigate('/privacy-policy');
              }}
              className={`w-full flex items-center justify-between px-4 py-4 border-b last:border-b-0 hover:bg-gray-50 text-left`}
            >
              <span className="text-sm text-gray-900">{label}</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Orders moved to separate /orders page */}
    </div>
  );
}
