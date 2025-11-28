import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function HowToReturn() {
  const navigate = useNavigate();

  return (
    <div className="container-app py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mb-8"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">How to Return</h1>

        <div className="bg-white rounded-lg shadow-sm border p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Return Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We want you to be completely satisfied with your purchase. If for any reason you're not happy with your order, we offer a hassle-free return process.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Returns are accepted within 30 days of purchase</li>
              <li>Items must be in original condition and unused</li>
              <li>Original packaging and tags must be intact</li>
              <li>Proof of purchase is required</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Step-by-Step Return Process</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-lg mb-2">Step 1: Initiate Return</h3>
                <p className="text-gray-700">
                  Go to your order history, select the item you wish to return, and click "Return Item". Fill out the return reason.
                </p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-lg mb-2">Step 2: Print Label</h3>
                <p className="text-gray-700">
                  Once your return is approved, print the prepaid shipping label provided via email.
                </p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-lg mb-2">Step 3: Pack & Ship</h3>
                <p className="text-gray-700">
                  Pack your item securely in its original packaging. Attach the shipping label and drop it off at any authorized carrier location.
                </p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-lg mb-2">Step 4: Receive Refund</h3>
                <p className="text-gray-700">
                  Once we receive and inspect your return, we'll process your refund within 5-7 business days.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Shipping Costs</h2>
            <p className="text-gray-700 leading-relaxed">
              We provide prepaid return labels for all eligible returns. If you choose to use your own shipping method, return shipping costs are your responsibility unless the return is due to our error.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Non-Returnable Items</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Items marked as "Final Sale"</li>
              <li>Customized or personalized items</li>
              <li>Clearance items</li>
              <li>Items purchased more than 30 days ago</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about returns, please contact our customer service team at <span className="font-semibold">support@shopdb.com</span> or call <span className="font-semibold">1-800-SHOPDB-1</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
