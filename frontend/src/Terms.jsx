import React from 'react';
import { Baby, ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft size={20} />
          Back to Boop
        </a>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Baby className="text-blue-600" size={32} />
            <h1 className="text-4xl font-bold text-gray-800">Terms of Service</h1>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">Last updated: October 10, 2025</p>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">1. Service Description</h2>
              <p>
                Boop ("we," "our," or "us") provides an AI-powered baby name suggestion service. 
                By using our service at helloboop.com, you agree to these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">2. Use of Service</h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate information in the name generation form</li>
                <li>Use the service for personal, non-commercial purposes</li>
                <li>Not attempt to abuse, hack, or misuse our service</li>
                <li>Not share or resell generated names commercially</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">3. Payment Terms</h2>
              <p>
                Our service offers an initial set of 3 name suggestions for free. Additional names 
                can be purchased for $0.99 per set. All payments are processed securely through Stripe.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Payments are non-refundable once names are generated</li>
                <li>Prices are in USD and subject to change with notice</li>
                <li>You will receive the purchased names immediately after payment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">4. Refund Policy</h2>
              <p>
                Due to the instant digital nature of our service, all sales are final. Names are 
                generated immediately upon payment, and we cannot offer refunds. If you experience 
                technical issues, please contact us at support@helloboop.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">5. AI-Generated Content</h2>
              <p>
                Name suggestions are generated using artificial intelligence based on your input. 
                While we strive for quality and personalization:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Suggestions are not guaranteed to be unique or unused</li>
                <li>Cultural and historical context may vary in accuracy</li>
                <li>We do not guarantee any particular outcome or satisfaction</li>
                <li>Final naming decisions are solely your responsibility</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">6. Limitation of Liability</h2>
              <p>
                Boop is provided "as is" without warranties. We are not liable for any damages arising 
                from your use of our service, including but not limited to dissatisfaction with name 
                suggestions or any consequences of choosing a suggested name.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">7. Privacy</h2>
              <p>
                Your use of Boop is also governed by our Privacy Policy. We collect minimal personal 
                information and use it only to generate personalized name suggestions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the service 
                constitutes acceptance of updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">9. Contact</h2>
              <p>
                For questions about these Terms of Service, contact us at: support@helloboop.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}