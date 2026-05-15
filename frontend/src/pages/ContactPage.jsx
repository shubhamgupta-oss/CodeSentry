import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Shield } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <header className="border-b border-dark-800 bg-dark-900/70 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-400" />
            <span className="font-semibold">CodeSentry</span>
          </Link>
          <Link to="/pricing" className="text-sm text-gray-300 hover:text-white transition">Pricing</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-3">Contact sales and support</h1>
        <p className="text-gray-400 mb-8">Need help with onboarding, billing, or enterprise setup? Reach out below.</p>

        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-dark-800 bg-dark-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold">Email</h2>
            </div>
            <p className="text-sm text-gray-300">support@codesentry.dev</p>
          </div>
          <div className="p-5 rounded-xl border border-dark-800 bg-dark-900/50">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-green-400" />
              <h2 className="font-semibold">Response SLA</h2>
            </div>
            <p className="text-sm text-gray-300">Free: 48h, Pro: 12h, Team: 4h business response target.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
