const Shipping = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-light tracking-widest mb-6 text-gray-900">
            SHIPPING & DELIVERY POLICY
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 italic">Fast, Reliable, and Secure Delivery</p>
        </div>

        {/* Policy Content */}
        <div className="max-w-4xl mx-auto">
          
          {/* Section 1: Processing & Delivery Time */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">1.</span>
              Processing & Delivery Time
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Orders are processed within <strong className="text-gray-900">2-3 business days</strong> and delivered within <strong className="text-gray-900">5-10 business days</strong>.
            </p>
          </div>

          {/* Section 2: Shipping Charges */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">2.</span>
              Shipping Charges
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Shipping charges depend on the delivery location and will be displayed at checkout.
            </p>
          </div>

          {/* Section 3: Order Tracking */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">3.</span>
              Order Tracking
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Customers will receive a tracking number via email upon dispatch.
            </p>
          </div>

          {/* Section 4: International Shipping */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">4.</span>
              International Shipping
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Currently, we ship within <strong className="text-gray-900">India only</strong>.
            </p>
          </div>

        </div>

        {/* Additional Info Section */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Need Help?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about shipping or delivery, please feel free to contact our customer service team.
            </p>
            <a 
              href="/contact" 
              className="inline-block mt-4 px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors duration-200"
            >
              Contact Us
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Shipping;


