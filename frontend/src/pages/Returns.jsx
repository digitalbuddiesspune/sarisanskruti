const Returns = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-light tracking-widest mb-6 text-gray-900">
            REFUND & CANCELLATION POLICY
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 italic">Easy Returns, Hassle-Free Refunds</p>
        </div>

        {/* Policy Content */}
        <div className="max-w-4xl mx-auto">
          
          {/* Section 1: Order Cancellation */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">1.</span>
              Order Cancellation
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Customers can cancel an order before it is shipped by contacting customer support.
            </p>
          </div>

          {/* Section 2: Return & Refund Process */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">2.</span>
              Return & Refund Process
            </h2>
            <div className="text-lg text-gray-700 leading-relaxed space-y-3">
              <p>
                Returns are accepted only on the same day of delivery if the customer sends an email request.
              </p>
              <p>
                Refunds will be processed within <strong className="text-gray-900">5-7 business days</strong>.
              </p>
              <p>
                Items must be <strong className="text-gray-900">unused and in original packaging</strong>.
              </p>
            </div>
          </div>

          {/* Section 3: Non-Refundable Items */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">3.</span>
              Non-Refundable Items
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              <strong className="text-gray-900">Customized and perishable products</strong> are non-refundable.
            </p>
          </div>

        </div>

        {/* Additional Info Section */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Need Help with Returns?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about returns, refunds, or cancellations, please feel free to contact our customer service team.
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

export default Returns;


