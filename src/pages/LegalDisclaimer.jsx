
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react'; // Only Shield is used now
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '@/components/SEO'; // Assuming SEO component exists and is imported from here

// The 'sections' array and Accordion related imports are no longer needed
// as the entire structure is being replaced.

export default function LegalDisclaimer() {
  return (
    <>
      <SEO
        title="Legal Disclaimer - Helper33"
        description="Legal information and disclaimers for Helper33 services"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-10 h-10 text-emerald-600" />
                <CardTitle className="text-3xl font-bold text-gray-900">Legal Disclaimer</CardTitle>
              </div>
              <CardDescription className="text-base">
                Last Updated: November 5, 2025
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Not Medical or Legal Advice</h2>
                <p className="text-gray-700 leading-relaxed">
                  Helper33 provides AI-powered wellness tools, grief support, and personal guidance. Our services are NOT a substitute for professional medical, mental health, legal, or financial advice. Always consult qualified professionals for serious concerns.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">2. AI-Generated Content</h2>
                <p className="text-gray-700 leading-relaxed">
                  All AI coaches, companions, and generated content are powered by artificial intelligence. While designed to be helpful and supportive, AI responses may contain errors, biases, or inappropriate suggestions. Use your judgment and seek human support when needed.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Crisis Support</h2>
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <p className="text-red-900 font-semibold mb-2">
                    🚨 If you are experiencing a mental health crisis:
                  </p>
                  <ul className="text-red-800 space-y-1">
                    <li>• Call 988 (Suicide & Crisis Lifeline) - USA</li>
                    <li>• Text "HELLO" to 741741 (Crisis Text Line)</li>
                    <li>• Call emergency services (911) for immediate danger</li>
                  </ul>
                  <p className="text-red-800 mt-2">
                    Helper33's AI cannot replace emergency mental health services.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Voice Cloning Technology</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Our Grief Coach persona feature uses voice cloning technology that requires:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Proper legal authorization (death certificate, executor consent, or documented permission)</li>
                  <li>Verification of identity and authority</li>
                  <li>Acknowledgment that this is AI, not the actual person</li>
                  <li>Understanding that all cloned voices are watermarked and restricted to therapeutic use</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Misuse of voice cloning technology is prohibited and may result in account termination and legal action.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Data Privacy & Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement industry-standard security measures to protect your data. However, no system is 100% secure. See our <Link to={createPageUrl('PrivacyPolicy')} className="text-emerald-600 hover:text-emerald-700 underline">Privacy Policy</Link> for details on data handling.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Third-Party Integrations</h2>
                <p className="text-gray-700 leading-relaxed">
                  Helper33 integrates with third-party services (Google Calendar, Zoom, health tracking apps, etc.). These integrations are governed by their respective terms of service. We are not responsible for third-party service outages or data breaches.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Marketplace Transactions</h2>
                <p className="text-gray-700 leading-relaxed">
                  Helper33 facilitates transactions between sellers and buyers but is not a party to these agreements. We provide buyer protection and dispute resolution, but make no guarantees about product quality or seller reliability. All marketplace transactions are subject to our platform fees and policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  Helper33 is provided "as is" without warranties of any kind. We are not liable for decisions made based on AI-generated content, technical issues, data loss, or any damages arising from use of our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our Kids Studio and family features are designed for use under parental supervision. Children under 13 should only use Helper33 with explicit parental consent and supervision. We comply with COPPA (Children's Online Privacy Protection Act).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Changes to Services</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue any part of our services at any time. Paid subscriptions will be honored according to their terms, but features may change.
                </p>
              </section>

              <section className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-emerald-900 mb-3">Contact Us</h2>
                <p className="text-emerald-800 mb-2">
                  Questions about this disclaimer or our services?
                </p>
                <p className="text-emerald-800">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:support@helper33.com" className="underline font-semibold hover:text-emerald-900">
                    support@helper33.com
                  </a>
                </p>
                <p className="text-emerald-800 mt-2">
                  <strong>Website:</strong>{' '}
                  <a href="https://www.helper33.com" className="underline font-semibold hover:text-emerald-900" target="_blank" rel="noopener noreferrer">
                    www.helper33.com
                  </a>
                </p>
              </section>

              <section className="text-center pt-6">
                <p className="text-sm text-gray-600">
                  By using Helper33, you acknowledge that you have read and understood this disclaimer.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
