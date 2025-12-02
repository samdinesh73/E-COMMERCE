import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Package, Truck, Shield, Users } from "lucide-react";

export default function AboutUs() {
  const values = [
    {
      icon: Package,
      title: "Quality Products",
      description: "Carefully curated selection of premium apparel and fashion items"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to your doorstep"
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Your privacy and security are our top priority"
    },
    {
      icon: Users,
      title: "Customer First",
      description: "Dedicated support for the best shopping experience"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            About Us
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We believe in delivering premium fashion that combines style, quality, and affordability. 
            Our mission is to make exceptional apparel accessible to everyone.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Founded with a simple vision: to revolutionize online fashion retail by offering premium quality apparel 
              at competitive prices. We started as a small team passionate about style and have grown into a trusted 
              destination for fashion enthusiasts.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Every product in our collection is carefully selected to ensure it meets our high standards for quality, 
              design, and comfort. We work directly with manufacturers to bring you the best deals without compromising on quality.
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
            <span className="text-gray-400">Premium Collection</span>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <Icon className="w-10 h-10 text-gray-900" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-gray-900 mb-2">10K+</p>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900 mb-2">5K+</p>
              <p className="text-gray-600">Premium Products</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900 mb-2">24/7</p>
              <p className="text-gray-600">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Start Shopping Today</h2>
          <p className="text-gray-300 mb-8">Discover our curated collection of premium apparel</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-900 rounded font-semibold hover:bg-gray-100 transition-colors"
          >
            Browse Collection
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
