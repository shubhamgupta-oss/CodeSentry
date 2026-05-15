import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Shield, ShieldCheck } from 'lucide-react';

const SecurityPage = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <header className="border-b border-dark-800 bg-dark-900/70 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-400" />
            <span className="font-semibold">CodeSentry Security</span>
          </Link>
          <Link to="/" className="text-sm text-gray-300 hover:text-white transition">Back to home</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <h1 className="text-3xl font-bold">Security and trust</h1>
        <p className="text-gray-400">CodeSentry is designed for secure code workflows and safe collaboration.</p>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-dark-800 bg-dark-900/50">
            <Lock className="w-5 h-5 text-blue-400 mb-2" />
            <h2 className="font-semibold mb-1">Secure transport</h2>
            <p className="text-sm text-gray-400">API traffic is expected over HTTPS in production environments.</p>
          </div>
          <div className="p-5 rounded-xl border border-dark-800 bg-dark-900/50">
            <ShieldCheck className="w-5 h-5 text-green-400 mb-2" />
            <h2 className="font-semibold mb-1">Auth boundaries</h2>
            <p className="text-sm text-gray-400">User-scoped history and GitHub routes are protected by auth middleware.</p>
          </div>
          <div className="p-5 rounded-xl border border-dark-800 bg-dark-900/50">
            <Shield className="w-5 h-5 text-violet-400 mb-2" />
            <h2 className="font-semibold mb-1">OAuth hardening</h2>
            <p className="text-sm text-gray-400">GitHub OAuth callbacks are state-verified to reduce CSRF risks.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecurityPage;
