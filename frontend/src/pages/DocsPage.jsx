import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Code2, Shield } from 'lucide-react';

const DocsPage = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <header className="border-b border-dark-800 bg-dark-900/70 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-400" />
            <span className="font-semibold">CodeSentry Docs</span>
          </Link>
          <Link to="/dashboard" className="text-sm text-gray-300 hover:text-white transition">Open dashboard</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <h1 className="text-3xl font-bold">Documentation</h1>
        <p className="text-gray-400">
          Everything needed to set up your workflow quickly and run reliable AI-assisted code analysis.
        </p>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-dark-900/50 border border-dark-800">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold">Getting started</h2>
            </div>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>Connect your GitHub account.</li>
              <li>Select repository + PR or paste code.</li>
              <li>Choose analysis mode and run review.</li>
            </ol>
          </div>
          <div className="p-5 rounded-xl bg-dark-900/50 border border-dark-800">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="w-5 h-5 text-green-400" />
              <h2 className="font-semibold">Best practices</h2>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
              <li>Use PR URL mode for context-rich analysis.</li>
              <li>Run repo review before major releases.</li>
              <li>Post summarized results back to PR comments.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DocsPage;
