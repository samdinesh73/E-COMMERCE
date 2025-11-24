import React, { useState, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function VariationForm({ productId, onComplete }) {
  const [variations, setVariations] = useState([]);
  const [variationValues, setVariationValues] = useState(["S", "M", "L", "XL"]);
  const [variationPrices, setVariationPrices] = useState({ S: 0, M: 0, L: 0, XL: 0 });
  const [variationImages, setVariationImages] = useState({ S: null, M: null, L: null, XL: null });
  const [variationImagePreviews, setVariationImagePreviews] = useState({ S: null, M: null, L: null, XL: null });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchVariations();
    }
  }, [productId]);

  const fetchVariations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/variations/${productId}`);
      setVariations(response.data || []);
    } catch (err) {
      console.error("Error fetching variations:", err);
    }
  };

  const handlePriceChange = (value, price) => {
    setVariationPrices((prev) => ({ ...prev, [value]: parseFloat(price) || 0 }));
  };

  const handleImageChange = (value, file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setVariationImagePreviews((prev) => ({ ...prev, [value]: e.target.result }));
        setVariationImages((prev) => ({ ...prev, [value]: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateVariations = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (variationValues.length === 0) {
      setMessage({ type: "error", text: "Please add at least one variation value" });
      return;
    }

    try {
      setLoading(true);

      // Create each variation
      for (const value of variationValues) {
        try {
          // Step 1: Create variation
          const res = await axios.post(`${API_BASE_URL}/variations/${productId}`, {
            variation_type: "Size",
            variation_value: value,
            price_adjustment: variationPrices[value] || 0,
            stock_quantity: 100,
          });

          const variationId = res.data.id;

          // Step 2: Upload image if exists
          if (variationImages[value]) {
            const imageFormData = new FormData();
            imageFormData.append("image", variationImages[value]);

            await axios.post(
              `${API_BASE_URL}/variations/${productId}/${variationId}/images`,
              imageFormData,
              { headers: { "Content-Type": "multipart/form-data" } }
            );
          }
        } catch (err) {
          console.error(`Error creating variation ${value}:`, err);
        }
      }

      setMessage({ type: "success", text: `✓ Created ${variationValues.length} variations successfully!` });
      setVariationValues(["S", "M", "L", "XL"]);
      setVariationPrices({ S: 0, M: 0, L: 0, XL: 0 });
      setVariationImages({ S: null, M: null, L: null, XL: null });
      setVariationImagePreviews({ S: null, M: null, L: null, XL: null });

      // Fetch updated variations
      await fetchVariations();
      onComplete?.();
    } catch (err) {
      console.error("Error creating variations:", err);
      setMessage({ type: "error", text: "Failed to create variations" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariation = async (variationId) => {
    if (!window.confirm("Delete this variation?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/variations/${productId}/${variationId}`);
      setMessage({ type: "success", text: "Variation deleted" });
      await fetchVariations();
    } catch (err) {
      console.error("Error deleting variation:", err);
      setMessage({ type: "error", text: "Failed to delete variation" });
    }
  };

  const addVariationValue = () => {
    const newVal = `Size ${variationValues.length + 1}`;
    setVariationValues((prev) => [...prev, newVal]);
    setVariationPrices((prev) => ({ ...prev, [newVal]: 0 }));
  };

  const removeVariationValue = (value) => {
    setVariationValues((prev) => prev.filter((v) => v !== value));
    const { [value]: _, ...rest } = variationPrices;
    setVariationPrices(rest);
  };

  return (
    <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-300 mt-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-900">👕 Variation Management (Size, Images & Prices)</h3>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleCreateVariations} className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <h4 className="text-lg font-semibold mb-4 text-gray-900">Add Variation Values</h4>

          <div className="space-y-3">
            {variationValues.map((value) => (
              <div key={value} className="border border-gray-200 rounded p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Value */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700">SIZE</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const oldValue = value;
                        const updatedValues = variationValues.map((v) => v === oldValue ? e.target.value : v);
                        setVariationValues(updatedValues);
                      }}
                      className="w-full border border-gray-300 rounded px-2 py-2 text-sm font-medium"
                      placeholder="e.g., S"
                    />
                  </div>

                  {/* Price Adjustment */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700">PRICE (+/-)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={variationPrices[value] || 0}
                      onChange={(e) => handlePriceChange(value, e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700">IMAGE</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(value, e.target.files[0])}
                      className="w-full border border-gray-300 rounded px-2 py-2 text-xs"
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="flex items-end">
                    {variationValues.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariationValue(value)}
                        className="w-full px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center gap-1 text-sm"
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Image Preview */}
                {variationImagePreviews[value] && (
                  <div className="mt-3">
                    <img
                      src={variationImagePreviews[value]}
                      alt={value}
                      className="h-20 w-20 object-cover rounded border border-gray-300"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addVariationValue}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Size
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 font-semibold"
        >
          {loading ? "Creating..." : "✓ Create All Variations"}
        </button>
      </form>

      {/* Existing Variations */}
      {variations.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded-lg border border-blue-200">
          <h4 className="text-lg font-semibold mb-4 text-gray-900">Existing Variations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {variations.map((variation) => (
              <div key={variation.id} className="border border-gray-300 rounded p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{variation.variation_value}</p>
                    <p className="text-xs text-gray-600">₹ {variation.price_adjustment}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteVariation(variation.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {variation.images && variation.images.length > 0 && (
                  <img
                    src={`${API_BASE_URL}/${variation.images[0].image_path}`}
                    alt={variation.variation_value}
                    className="w-full h-24 object-cover rounded border border-gray-200"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
