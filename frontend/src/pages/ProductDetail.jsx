import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../services/api";
import { getImageUrl } from "../utils/imageHelper";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productService.getById(id);
        setProduct(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, Number(quantity || 1));
    alert(`Added ${quantity} item(s) to cart`);
  };

  if (loading) {
    return (
      <div className="container-app py-16">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-app py-16">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error || "Product not found"}</p>
          <button
            onClick={() => navigate("/shop")}
            className="px-6 py-2 bg-black text-white rounded font-semibold hover:opacity-90"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.image);

  return (
    <div className="container-app py-12">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 border border-black rounded font-semibold hover:bg-black hover:text-white transition-colors"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="flex items-center justify-center rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain max-h-96"
            onError={(e) => {
              e.target.src = "assets/img/placeholder.png";
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-black mb-4">{product.name}</h1>

          <div className="mb-6">
            <p className="text-5xl font-bold text-black">₹ {product.price}</p>
            <p className="text-sm text-gray-600 mt-2">Inclusive of all taxes</p>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Product Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-black mb-3">Product Details</h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Product ID:</strong> #{product.id}
              </p>
              <p>
                <strong>Availability:</strong> In Stock
              </p>
              <p>
                <strong>Shipping:</strong> Free shipping on orders above ₹500
              </p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-black mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-black rounded flex items-center justify-center hover:bg-black hover:text-white transition-colors font-semibold"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-3 py-2 border border-black rounded text-center"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-black rounded flex items-center justify-center hover:bg-black hover:text-white transition-colors font-semibold"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 px-6 py-3 bg-black text-white rounded font-semibold hover:opacity-90 transition-opacity text-lg"
            >
              Add to Cart
            </button>
            <button className="flex-1 px-6 py-3 border border-black text-black rounded font-semibold hover:bg-black hover:text-white transition-colors text-lg">
              ♡ Wishlist
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-300">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-black mb-1">✓ Genuine Product</h4>
                <p className="text-sm text-gray-600">100% authentic and original</p>
              </div>
              <div>
                <h4 className="font-semibold text-black mb-1">✓ Easy Returns</h4>
                <p className="text-sm text-gray-600">30-day return policy on all orders</p>
              </div>
              <div>
                <h4 className="font-semibold text-black mb-1">✓ Secure Payments</h4>
                <p className="text-sm text-gray-600">Your payments are 100% secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section (Optional) */}
      <div className="mt-16 pt-8 border-t border-gray-300">
        <h2 className="text-3xl font-bold text-black mb-6">You May Also Like</h2>
        <div className="text-center text-gray-600">
          <p>Related products coming soon...</p>
        </div>
      </div>
    </div>
  );
}
