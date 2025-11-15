import React, { useState } from "react";
import { productService } from "../../services/api";

export default function DeleteProductConfirm({ product, onDeleted, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!product) return <p className="text-gray-600">Select a product to delete from the list.</p>;

  const handleDelete = async () => {
    setError(null);
    try {
      setLoading(true);
      await productService.remove(product.id);
      onDeleted && onDeleted(product.id);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-card">
      <h3 className="text-2xl font-semibold mb-4">Delete Product</h3>
      <p className="mb-4">Are you sure you want to delete <strong>{product.name}</strong>?</p>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="flex gap-3">
        <button onClick={handleDelete} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded">{loading ? "Deleting..." : "Delete"}</button>
        <button onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
      </div>
    </div>
  );
}
