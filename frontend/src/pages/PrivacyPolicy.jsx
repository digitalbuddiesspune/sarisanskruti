const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-light tracking-widest mb-6 text-gray-900">
            PRIVACY POLICY
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 italic">Last updated: January 2026</p>
        </div>

        {/* Policy Content */}
        <div className="max-w-4xl mx-auto">
          
          {/* Introduction */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Gamotech Software ("we", "our", or "us") operates the Sarisanskruti mobile application and website (collectively referred to as the "Service"). This page informs users about our policies regarding the collection, use, and disclosure of personal information when using our Service.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              By using Sarisanskruti, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
          </div>

          {/* Section 1: Information We Collect */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">1.</span>
              Information We Collect
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              We collect only the information necessary to provide and improve our services.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">a) Personal Information</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-3">
              When you register or use our app, we may collect:
            </p>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-2 list-disc list-inside mb-4 ml-4">
              <li>Email address</li>
              <li>Phone number</li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed mb-3">
              This information is used to:
            </p>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-2 list-disc list-inside ml-4">
              <li>Create and manage your account</li>
              <li>Process orders and transactions</li>
              <li>Send order updates, OTPs, and important notifications</li>
              <li>Provide customer support</li>
            </ul>
          </div>

          {/* Section 2: Payments */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">2.</span>
              Payments
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              We use third-party payment gateways to process payments securely.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-3">
              <strong className="text-gray-900">Payment Partner:</strong>
            </p>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-2 list-disc list-inside mb-4 ml-4">
              <li>PayU</li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed">
              We do not store or process your debit/credit card details or banking information on our servers. All payment information is handled directly by PayU in accordance with their privacy and security policies.
            </p>
          </div>

          {/* Section 3: Third-Party Services */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">3.</span>
              Third-Party Services
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              We may use third-party services to operate and improve our application:
            </p>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-2 list-disc list-inside mb-4 ml-4">
              <li><strong className="text-gray-900">PayU</strong> – for secure online payments</li>
              <li><strong className="text-gray-900">Fast2SMS</strong> – for sending OTPs, order confirmations, and transactional messages</li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed">
              These services may collect information as required to perform their functions. Their use of your information is governed by their respective privacy policies.
            </p>
          </div>

          {/* Section 4: How We Use Your Information */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">4.</span>
              How We Use Your Information
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-3">
              We use the collected data to:
            </p>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-2 list-disc list-inside mb-4 ml-4">
              <li>Provide and maintain our Service</li>
              <li>Process orders and payments</li>
              <li>Communicate with users regarding their accounts and orders</li>
              <li>Improve our application and user experience</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed">
              We do not sell or rent your personal information to third parties.
            </p>
          </div>

          {/* Section 5: Data Security */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">5.</span>
              Data Security
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We value your trust in providing your personal information and use commercially acceptable means to protect it. However, please note that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          {/* Section 6: User Rights */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">6.</span>
              User Rights
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-2 list-disc list-inside mb-4 ml-4">
              <li>Access your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed">
              To exercise any of these rights, contact us at:
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mt-2">
              📧 <a href="mailto:support@sarisanskruti.in" className="text-amber-600 hover:text-amber-700 underline">support@sarisanskruti.in</a>
            </p>
          </div>

          {/* Section 7: Log Data */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">7.</span>
              Log Data
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              In case of an error in the app, we may collect data and information (through third-party tools) called Log Data. This may include:
            </p>
            <ul className="text-lg text-gray-700 leading-relaxed space-y-2 list-disc list-inside mb-4 ml-4">
              <li>Device type and model</li>
              <li>IP address</li>
              <li>App version</li>
              <li>Date and time of usage</li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed">
              This data is used only for troubleshooting and improving the Service.
            </p>
          </div>

          {/* Section 8: Children's Privacy */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">8.</span>
              Children's Privacy
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our Service does not address anyone under the age of 13. We do not knowingly collect personal information from children under 13. If we discover that a child has provided us with personal information, we will delete it immediately.
            </p>
          </div>

          {/* Section 9: Changes to This Privacy Policy */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">9.</span>
              Changes to This Privacy Policy
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We may update our Privacy Policy from time to time. Any changes will be posted on this page. You are advised to review this page periodically for updates.
            </p>
          </div>

          {/* Section 10: Contact Us */}
          <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-amber-600 mr-3">10.</span>
              Contact Us
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              If you have any questions or suggestions regarding this Privacy Policy, please contact us:
            </p>
            <div className="text-lg text-gray-700 leading-relaxed space-y-2">
              <p><strong className="text-gray-900">Developer / Company Name:</strong> Gamotech Software</p>
              <p><strong className="text-gray-900">App Name:</strong> Sarisanskruti</p>
              <p><strong className="text-gray-900">Email:</strong> <a href="mailto:support@sarisanskruti.in" className="text-amber-600 hover:text-amber-700 underline">support@sarisanskruti.in</a></p>
              <p><strong className="text-gray-900">Website:</strong> <a href="https://sarisanskruti.in" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 underline">https://sarisanskruti.in</a></p>
            </div>
          </div>

        </div>

        {/* Additional Info Section */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Questions About Privacy?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions or concerns about our Privacy Policy, please feel free to contact our customer service team.
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

export default PrivacyPolicy;
