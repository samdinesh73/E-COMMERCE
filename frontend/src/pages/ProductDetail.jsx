import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../services/api";
import { getImageUrl } from "../utils/imageHelper";
import ProductImageGallery from "../components/common/ProductImageGallery";
import { useCart } from "../context/CartContext";
import { Heart, ShoppingCart, Truck, Shield, RotateCcw, Loader, AlertCircle } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
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
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <Loader className="h-10 sm:h-12 w-10 sm:w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-base sm:text-lg text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="h-10 sm:h-12 w-10 sm:w-12 text-red-600 mx-auto mb-4" />
          <p className="text-base sm:text-lg text-red-600 mb-4 font-semibold">{error || "Product not found"}</p>
          <button
            onClick={() => navigate("/shop")}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.image);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm sm:text-base"
          >
            ← Back to Shop
          </button>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Image Section - Using Gallery Component */}
          <div className="flex items-start justify-center">
            <div className="w-full">
              <ProductImageGallery
                mainImage={product.image}
                additionalImages={product.additional_images}
              />
            </div>
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col">
            {/* Product Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3 gap-4">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-blue-600 mb-2">PRODUCT ID: {product.id}</p>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 break-words">{product.name}</h1>
                </div>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex-shrink-0 p-2 sm:p-3 rounded-full transition-all ${
                    isFavorite
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Heart className={`h-5 sm:h-6 w-5 sm:w-6 ${isFavorite ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm sm:text-base">★</span>
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium">(328 reviews)</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 mb-6"></div>

            {/* Price Section */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-2 flex-wrap">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">₹{product.price}</span>
                <span className="inline-block px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs sm:text-sm font-semibold rounded-full">
                  In Stock
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Incl. of all taxes</p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="mb-6 sm:mb-8 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Quantity</label>
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-300 rounded-lg p-1 sm:p-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center hover:bg-gray-100 rounded transition-colors font-bold text-gray-600 hover:text-gray-900 text-sm sm:text-base"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 sm:w-16 text-center font-semibold text-gray-900 focus:outline-none text-sm sm:text-base"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center hover:bg-gray-100 rounded transition-colors font-bold text-gray-600 hover:text-gray-900 text-sm sm:text-base"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Main CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={handleAddToCart}
                  className="px-4 sm:px-6 py-3 sm:py-4 bg-blue-600 text-white font-semibold text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-4 sm:h-5 w-4 sm:w-5" />
                  Add to Cart
                </button>
                <button className="px-4 sm:px-6 py-3 sm:py-4 border-2 border-blue-600 text-blue-600 font-semibold text-sm sm:text-base rounded-lg hover:bg-blue-50 transition-colors">
                  Buy Now
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-100">
              <div className="text-center">
                <Truck className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs font-semibold text-gray-900">Free Delivery</p>
                <p className="text-xs text-gray-600 hidden sm:block">On orders ₹500+</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs font-semibold text-gray-900">Easy Return</p>
                <p className="text-xs text-gray-600 hidden sm:block">30-day policy</p>
              </div>
              <div className="text-center">
                <Shield className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs font-semibold text-gray-900">Secure Buy</p>
                <p className="text-xs text-gray-600 hidden sm:block">100% safe</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Premium quality materials",
              "Long-lasting durability",
              "Easy to use and maintain",
              "Environmentally friendly"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  ✓
                </span>
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Specifications */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Delivery Info */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Delivery Information</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <div>
                    <p className="font-semibold text-gray-900">Free Shipping</p>
                    <p className="text-sm text-gray-600">On orders above ₹500</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <div>
                    <p className="font-semibold text-gray-900">Fast Delivery</p>
                    <p className="text-sm text-gray-600">3-5 business days</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <div>
                    <p className="font-semibold text-gray-900">Order Tracking</p>
                    <p className="text-sm text-gray-600">Real-time tracking available</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Product Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Availability</span>
                  <span className="text-green-600 font-bold">In Stock</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Product ID</span>
                  <span className="text-gray-900 font-semibold">PROD-{product.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Category</span>
                  <span className="text-gray-900 font-semibold">General</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 font-medium">Return Policy</span>
                  <span className="text-gray-900 font-semibold">30 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-600 font-medium">Related products coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
