import React, { useEffect, useState } from "react";
import { productService } from "../../services/api";

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
      <h3 className="text-xl font-semibold mb-4">All Products</h3>

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="p-4 border rounded flex flex-col justify-between">
              <div>
                <h4 className="font-semibold">{p.name}</h4>
                <p className="text-sm text-gray-600">₹ {p.price}</p>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => onEdit(p)} className="px-3 py-1 border rounded">Edit</button>
                <button onClick={() => onDelete(p)} className="px-3 py-1 border rounded text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
