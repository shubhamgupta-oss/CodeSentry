import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <Link to="/" className="text-sm text-gray-300 hover:text-white transition">Back to home</Link>
        </div>
        <div className="space-y-4 text-sm text-gray-300">
          <p>CodeSentry processes account and usage data to provide analysis services.</p>
          <p>Repository metadata and code content are used only for requested analysis workflows.</p>
          <p>You can request data deletion and account closure via support channels.</p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
