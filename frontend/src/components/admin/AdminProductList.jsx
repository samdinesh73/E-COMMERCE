import React, { useEffect, useState } from "react";
import { productService } from "../../services/api";
import { getImageUrl } from "../../utils/imageHelper";
import { Edit2, Trash2, Loader, AlertCircle, Search, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
} from "../ui";

export default function AdminProductList({ onEdit, onDelete }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll();
      setProducts(res.data);
      setFilteredProducts(res.data);
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

  useEffect(() => {
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">All Products</h2>
        <p className="text-slate-600 mt-1">Manage and view all your products</p>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products by name or description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading products...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">
              {searchTerm ? "No products match your search" : "No products found"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grid View */}
      {!loading && !error && filteredProducts.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <Card
              key={p.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-slate-100 overflow-hidden group">
                <img
                  src={getImageUrl(p.image)}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "assets/img/placeholder.png";
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    ✓ Active
                  </span>
                </div>
              </div>

              {/* Product Content */}
              <CardHeader className="flex-1">
                <CardTitle className="text-base line-clamp-2">{p.name}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2">
                  {p.description || "No description available"}
                </CardDescription>
              </CardHeader>

              {/* Price and Actions */}
              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{parseFloat(p.price).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      ID: {p.id}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => onEdit(p)}
                    variant="default"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => onDelete(p)}
                    variant="destructive"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && !error && filteredProducts.length > 0 && viewMode === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Products List</CardTitle>
            <CardDescription>
              Total products: {filteredProducts.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Image</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Description</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">Price</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <img
                          src={getImageUrl(p.image)}
                          alt={p.name}
                          className="h-10 w-10 rounded object-cover"
                          onError={(e) => {
                            e.target.src = "assets/img/placeholder.png";
                          }}
                        />
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{p.name}</td>
                      <td className="py-3 px-4 text-slate-600 line-clamp-2">
                        {p.description || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-blue-600">
                        ₹{parseFloat(p.price).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={() => onEdit(p)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => onDelete(p)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Package } from "lucide-react";
