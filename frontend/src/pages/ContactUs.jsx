import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, AlertCircle } from "lucide-react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/contact`, form);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error.response?.data?.error || "Failed to send message. Please try again or contact us directly.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "support@fashionhub.com",
      href: "mailto:support@fashionhub.com"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+91 123-456-7890",
      href: "tel:+911234567890"
    },
    {
      icon: MapPin,
      title: "Address",
      value: "123 Fashion Street, New Delhi, India",
      href: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600">
            We'd love to hear from you. Get in touch with us today.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {/* Contact Info Cards */}
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <a
                  key={index}
                  href={info.href}
                  className="p-8 border border-gray-200 rounded-lg text-center hover:border-gray-900 transition-colors group"
                >
                  <div className="flex justify-center mb-4">
                    <Icon className="w-8 h-8 text-gray-900 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                  <p className="text-gray-600">{info.value}</p>
                </a>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Send us a Message</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium">✓ Message sent successfully! We'll get back to you soon.</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us more..."
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              {
                q: "How long does delivery take?",
                a: "Standard delivery takes 3-5 business days. Express delivery is available for 1-2 business days."
              },
              {
                q: "What's your return policy?",
                a: "We offer 30-day returns on most items. The product must be in original condition with all tags attached."
              },
              {
                q: "Do you offer international shipping?",
                a: "Currently, we ship within India. International shipping will be available soon."
              },
              {
                q: "How do I track my order?",
                a: "You can track your order using the order number sent to your email after purchase."
              }
            ].map((faq, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Response Time Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get a Response Fast</h2>
          <p className="text-gray-300 mb-2">We typically respond to inquiries within 24 hours</p>
          <p className="text-gray-400 text-sm">Available Monday - Friday, 10 AM - 6 PM IST</p>
        </div>
      </section>
    </div>
  );
}
