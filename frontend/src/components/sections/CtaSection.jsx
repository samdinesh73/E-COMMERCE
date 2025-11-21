import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";
import { ShoppingCart, Zap, Shield, Truck } from "lucide-react";

export default function CtaSection() {
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Browse our shop, add items to your cart, and proceed to checkout. Fill in your details and choose your payment method (COD or Razorpay)."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept two payment methods: Cash on Delivery (COD) and online payments through Razorpay."
    },
    {
      question: "How long does shipping take?",
      answer: "We typically ship orders within 2-3 business days. Delivery time varies based on your location."
    },
    {
      question: "Can I return or exchange products?",
      answer: "Yes, we offer returns and exchanges within 30 days of purchase. Please contact our support team for assistance."
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order from 'My Account' section after logging in or from the order confirmation email."
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Newsletter Section */}
      <div className="border-t border-gray-300 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-black">Stay Updated</h2>
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            Subscribe to get special offers and updates about new products
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
            />
            <Button className="text-sm sm:text-base px-4 sm:px-6">Subscribe</Button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center text-black">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="border rounded-lg overflow-hidden">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className={index !== faqs.length - 1 ? "border-b" : ""}
            >
              <AccordionTrigger className="hover:bg-gray-50">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}