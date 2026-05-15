import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <Link to="/" className="text-sm text-gray-300 hover:text-white transition">Back to home</Link>
        </div>
        <div className="space-y-4 text-sm text-gray-300">
          <p>By using CodeSentry, you agree to use the platform for lawful development and review purposes.</p>
          <p>You are responsible for credentials and third-party repository permissions connected to your account.</p>
          <p>Service limits and feature access vary by plan and may change with notice.</p>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
