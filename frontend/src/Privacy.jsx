import React from 'react';
import { Baby, ArrowLeft } from 'lucide-react';

export default function Privacy() {
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
            <h1 className="text-4xl font-bold text-gray-800">Privacy Policy</h1>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">Last updated: October 10, 2025</p>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">1. Information We Collect</h2>
              <p>When you use Boop, we collect the following information:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Personal Information:</strong> Your name, location, cultural background, and family preferences that you provide in our form</li>
                <li><strong>Usage Data:</strong> Browser type, device information, and how you interact with our service</li>
                <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store your credit card details)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">2. How We Use Your Information</h2>
              <p>We use your information solely to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Generate personalized baby name suggestions using AI</li>
                <li>Process payments for additional name suggestions</li>
                <li>Improve our service and user experience</li>
                <li>Communicate with you about your service usage</li>
              </ul>
              <p className="mt-3">
                <strong>We do not:</strong> Sell your data, share it with third parties for marketing, 
                or use it for purposes beyond providing our name suggestion service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">3. Data Storage and Security</h2>
              <p>
                Your form responses are temporarily stored in your browser's session storage and sent 
                to our AI service to generate name suggestions. We use industry-standard security measures 
                to protect your data.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Data is encrypted in transit using HTTPS</li>
                <li>We retain minimal data necessary for service operation</li>
                <li>Session data is cleared when you close your browser or start over</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">4. Third-Party Services</h2>
              <p>We use the following third-party services:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Anthropic (Claude AI):</strong> Processes your information to generate name suggestions</li>
                <li><strong>Stripe:</strong> Securely processes payments (see Stripe's privacy policy)</li>
                <li><strong>Vercel:</strong> Hosts our website and application</li>
              </ul>
              <p className="mt-3">
                These services have their own privacy policies and handle your data according to their terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">5. Cookies and Tracking</h2>
              <p>
                We use minimal cookies and browser storage (sessionStorage) to remember your form 
                responses during your session. We do not use tracking cookies or third-party analytics 
                that identify you personally.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Access the personal information we have about you</li>
                <li>Request deletion of your data</li>
                <li>Opt out of our service at any time</li>
                <li>Request corrections to your information</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, contact us at support@helloboop.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">7. Children's Privacy</h2>
              <p>
                Our service is intended for expectant parents and adults. We do not knowingly collect 
                information from children under 13. If you believe we have collected such information, 
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">8. International Users</h2>
              <p>
                Boop is operated from the United States. If you are accessing our service from outside 
                the US, your information may be transferred to and processed in the United States.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant 
                changes by updating the "Last updated" date. Continued use of our service constitutes 
                acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">10. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our data practices, contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> support@helloboop.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}