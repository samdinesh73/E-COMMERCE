import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import axios from "axios";
import { categoryService, productService } from "../../services/api";
import { getImageUrl, getBackendImageUrl } from "../../utils/imageHelper";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function SideDrawer({ isOpen, onClose }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [colorsLoading, setColorsLoading] = useState(false);
  const [colorList, setColorList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll();
      const cats = res.data.categories || [];
      setCategories(cats);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchColorVariations = async () => {
    try {
      setColorsLoading(true);
      
      // Fetch colors from the colors table with their hex codes
      const colorsRes = await axios.get(`${API_BASE_URL}/colors`);
      const colorMap = {};
      (colorsRes.data || []).forEach(color => {
        colorMap[color.name.toLowerCase()] = color.hex_code;
      });

      // Fetch all products then fetch variations per product
      const resp = await productService.getAll();
      const products = resp.data || [];

      const found = {};
      for (const p of products) {
        try {
          const variationResp = await axios.get(`${API_BASE_URL}/variations/${p.id}`);
          const variations = Array.isArray(variationResp.data) ? variationResp.data : (variationResp.data.variations || []);
          for (const v of variations) {
            if ((v.variation_type || '').toLowerCase() === 'color') {
              const key = (v.variation_value || '').trim();
              if (!key) continue;
              if (!found[key]) {
                found[key] = {
                  value: key,
                  hex_code: colorMap[key.toLowerCase()] || null,
                };
              }
            }
          }
        } catch (e) {
          // ignore per-product failures
        }
      }

      setColorList(Object.values(found));
    } catch (err) {
      console.error('Error fetching color variations', err);
      setColorList([]);
    } finally {
      setColorsLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed top-0 left-0 h-screen w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-center flex-1">CATEGORIES</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="p-4 border-b border-gray-200 flex gap-2 overflow-x-auto">
          <button className="px-3 py-1.5 bg-black text-white rounded text-xs font-semibold whitespace-nowrap">
            ALL
          </button>
          <button
            onClick={() => {
              setShowColors((s) => !s);
              if (!showColors) fetchColorVariations();
            }}
            className={`px-3 py-1.5 border ${showColors ? 'border-black text-black bg-gray-50' : 'border-gray-300 text-gray-700'} rounded text-xs font-semibold whitespace-nowrap hover:bg-gray-50`}
          >
            Shop by color
          </button>
          <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold whitespace-nowrap hover:bg-gray-50">
            TRENDING
          </button>
          <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold whitespace-nowrap hover:bg-gray-50">
            TOP
          </button>
        </div>

        {/* Categories List or Color List */}
        <div className="p-4">
          {showColors ? (
            colorsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading colors...</div>
            ) : colorList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No colors found</div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {colorList.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      // Navigate to shop with color query and close drawer
                      navigate(`/shop?color=${encodeURIComponent(c.value)}`);
                      onClose();
                    }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    {/* Color Circle */}
                    <div className="w-16 h-16 rounded-full flex-shrink-0 bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-gray-200 hover:border-gray-400 transition-all">
                      {c.hex_code ? (
                        <div className="w-full h-full" style={{ backgroundColor: c.hex_code }} />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-600">N/A</span>
                        </div>
                      )}
                    </div> 
                    {/* Color Name */}
                    <span className="text-xs font-medium text-gray-700 text-center group-hover:text-black transition-colors truncate max-w-[60px]">
                      {c.value}
                    </span>
                  </button>
                ))}
              </div>
            )
          ) : (
            loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No categories found</div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug || category.id}`}
                    onClick={onClose}
                    className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {/* Category Image */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                      <img
                        src={category.image ? (category.image.startsWith("/") ? category.image : getBackendImageUrl(category.image)) : "assets/img/placeholder.jpg"}
                        alt={category.name}
                        className="w-full h-full object-cover object-bottom"
                        onError={(e) => {
                          e.currentTarget.src = "assets/img/placeholder.jpg";
                        }}
                      />
                    </div>

                    {/* Category Name & Arrow */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {category.name}
                      </h3>
                      {category.product_count && (
                        <p className="text-xs text-gray-500">
                          {category.product_count} products
                        </p>
                      )}
                    </div>

                    {/* Arrow Icon */}
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
