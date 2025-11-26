import React, { useState, useEffect } from "react";
import { categoryService } from "../../services/api";
import { Link } from "react-router-dom";
import { getBackendImageUrl } from "../../utils/imageHelper";
import { Loader } from "lucide-react";

const SAMPLE_CATEGORIES = [
  { id: "c1", name: "SHIRTS", slug: "shirts", image: "/assets/img/categories/shirts.jpg" },
  { id: "c2", name: "TROUSERS", slug: "trousers", image: "/assets/img/categories/trousers.jpg" },
  { id: "c3", name: "WINTERWEAR", slug: "winterwear", image: "/assets/img/categories/winterwear.jpg" },
  { id: "c4", name: "CARGOS", slug: "cargos", image: "/assets/img/categories/cargos.jpg" },
  { id: "c5", name: "JEANS", slug: "jeans", image: "/assets/img/categories/jeans.jpg" },
  { id: "c6", name: "JOGGERS", slug: "joggers", image: "/assets/img/categories/joggers.jpg" },
  { id: "c7", name: "OVERSIZED T-SHIRTS", slug: "oversized-tshirts", image: "/assets/img/categories/oversized.jpg" },
  { id: "c8", name: "PRINTED T-SHIRTS", slug: "printed-tshirts", image: "/assets/img/categories/printed.jpg" },
];

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll()
        .catch(() => ({ data: { categories: [] } }));

      const remoteCats = res?.data?.categories || [];
      // prefer remote categories but fall back to sample images/names (limit 8)
      const final = (remoteCats.length > 0 ? remoteCats : SAMPLE_CATEGORIES).slice(0, 10);
      setCategories(final);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories(SAMPLE_CATEGORIES.slice(0, 8));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">Shop by category</h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {categories.map((cat) => {
            const imageSrc = cat.image ? (cat.image.startsWith("/") ? cat.image : getBackendImageUrl(cat.image)) : "/assets/img/placeholder.jpg";
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="block overflow-hidden"
              >
                <div className="relative aspect-[4/5] bg-gray-100">
                  <img
                    src={imageSrc}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "/assets/img/placeholder.jpg")}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
