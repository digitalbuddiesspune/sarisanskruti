const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-light tracking-widest mb-6 text-gray-900">
            KEEP IN TOUCH WITH US
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 italic">
            We're talking about clean beauty gift sets, of course – and we've got a bouquet of beauties for yourself or someone you love.
          </p>
        </div>

        {/* Contact Information */}
        <div className="max-w-2xl mx-auto">
          
          {/* Store Location */}
          <div className="mb-12">
            <h2 className="text-3xl font-light tracking-wider mb-6 text-gray-900 text-center">
              STORE LOCATION
            </h2>
            <div className="flex items-start space-x-4 p-6 bg-white border-2 border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl text-amber-600">📍</div>
              <div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  123 Main Street, Business District, City, State, 123456
                </p>
              </div>
            </div>
          </div>

          {/* Contact Us */}
          <div className="mb-12">
            <h2 className="text-3xl font-light tracking-wider mb-6 text-gray-900 text-center">
              CONTACT US
            </h2>
            <div className="flex items-start space-x-4 p-6 bg-white border-2 border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl text-amber-600">📧</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-700">
                  <a href="mailto:contact@example.com" className="hover:text-amber-600 transition-colors">
                    contact@example.com
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="mb-12">
            <h2 className="text-3xl font-light tracking-wider mb-6 text-gray-900 text-center">
              PHONE
            </h2>
            <div className="flex items-start space-x-4 p-6 bg-white border-2 border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl text-amber-600">📱</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile</h3>
                <p className="text-gray-700">
                  +91 98765 43210
                </p>
              </div>
            </div>
          </div>
             <div className="mb-12">
            <h2 className="text-3xl font-light tracking-wider mb-6 text-gray-900 text-center">
              COMPANY DETAILS
            </h2>
            <div className="flex items-start space-x-4 p-6 bg-white border-2 border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl text-amber-600">🏢</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Company Name</h3>
                <p className="text-gray-700">
                    ABC Enterprises Private Limited
                </p>
              </div>
            </div>
          </div>

          {/* Open Hours */}
          <div>
            <h2 className="text-3xl font-light tracking-wider mb-6 text-gray-900 text-center">
              OPEN HOURS
            </h2>
            <div className="flex items-start space-x-4 p-6 bg-white border-2 border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl text-amber-600">🕐</div>
              <div>
                <p className="text-lg text-gray-700 mb-2">
                  <span className="font-semibold">Monday – Saturday:</span> 8:00 am – 4:00pm
                </p>
                <p className="text-lg text-gray-700">
                  <span className="font-semibold">Sunday:</span> Close
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;
