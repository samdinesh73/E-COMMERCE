import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../constants/config";
import { ArrowLeft, Loader, Trash2, Edit2, Plus, MapPin } from "lucide-react";

export default function Addresses() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    is_default: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchAddresses();
  }, [token]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) throw new Error("Failed to load addresses");
      const data = await resp.json();
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error("Fetch addresses error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      address_line: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      is_default: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId
        ? `${API_BASE_URL}/users/addresses/${editingId}`
        : `${API_BASE_URL}/users/addresses`;

      const resp = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!resp.ok) throw new Error("Failed to save address");

      await fetchAddresses();
      resetForm();
    } catch (err) {
      console.error("Save address error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const resp = await fetch(`${API_BASE_URL}/users/addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) throw new Error("Failed to delete address");

      await fetchAddresses();
    } catch (err) {
      console.error("Delete address error:", err);
      setError(err.message);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header with premium styling */}
      <div className=" text-black py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/myaccount")}
            className="flex items-center gap-2 mb-6 text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Account
          </button>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <MapPin className="h-9 w-9" />
            My Addresses
          </h1>
          <p className="text-gray-400 mt-2">Manage your delivery addresses</p>
        </div>
      </div>

      <div className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Add Address Button (when form not visible) */}
          {!showForm && (
            <div className="mb-8 flex justify-end">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-medium"
              >
                <Plus className="h-5 w-5" />
                Add New Address
              </button>
            </div>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
              <h2 className="text-2xl font-bold text-black mb-6 pb-4 border-b border-gray-200">
                {editingId ? "Edit Address" : "Add New Address"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Address Line <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address_line"
                    value={formData.address_line}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white"
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white"
                      placeholder="Postal code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white"
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleInputChange}
                    className="w-5 h-5 border border-gray-300 rounded cursor-pointer accent-black"
                  />
                  <label htmlFor="is_default" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Set as default delivery address
                  </label>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                  >
                    {submitting ? "Saving..." : "Save Address"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader className="h-8 w-8 text-black animate-spin" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-6 text-lg">No addresses saved yet</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-all font-semibold"
                >
                  Add Your First Address
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`border rounded-xl p-6 transition-all relative group ${
                    address.is_default 
                      ? "border-black bg-black text-white shadow-lg" 
                      : "border-gray-300 bg-white hover:shadow-md hover:border-gray-400"
                  }`}
                >
                  {address.is_default && (
                    <div className="absolute top-4 right-4 bg-white text-black text-xs px-3 py-1 rounded-full font-semibold">
                      Default
                    </div>
                  )}

                  <h3 className={`font-bold mb-3 text-lg ${address.is_default ? "text-white" : "text-gray-900"}`}>
                    {address.address_line}
                  </h3>
                  <div className={`text-sm space-y-1 mb-6 ${address.is_default ? "text-gray-200" : "text-gray-600"}`}>
                    <p>{address.city}{address.state ? `, ${address.state}` : ""}</p>
                    <p className="font-medium">{address.pincode}</p>
                    {address.country && <p>{address.country}</p>}
                  </div>

                  <div className="flex gap-3 pt-4 border-t" style={{ borderTopColor: address.is_default ? "rgba(255,255,255,0.2)" : "#e5e7eb" }}>
                    <button
                      onClick={() => handleEdit(address)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                        address.is_default
                          ? "bg-white text-black hover:bg-gray-100"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                        address.is_default
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-gray-100 text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
