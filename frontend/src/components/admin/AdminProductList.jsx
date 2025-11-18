import React, { useEffect, useState } from "react";
import { productService } from "../../services/api";
import { getImageUrl } from "../../utils/imageHelper";
import { Edit2, Trash2, Loader, AlertCircle } from "lucide-react";

export default function AdminProductList({ onEdit, onDelete }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">All Products</h3>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img
                  src={getImageUrl(p.image)}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "assets/img/placeholder.png";
                  }}
                />
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">{p.name}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description || "No description"}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">₹{parseFloat(p.price).toFixed(2)}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">In Stock</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
