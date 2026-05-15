import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Github, Shield } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Best for evaluation and personal projects',
    features: ['10 code reviews / month', 'Basic debugging insights', 'Community support'],
    cta: 'Start Free'
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For individual developers shipping often',
    features: ['Unlimited reviews', 'Advanced security analysis', 'PR comment posting', 'Priority support'],
    cta: 'Upgrade to Pro',
    highlight: true
  },
  {
    name: 'Team',
    price: '$99',
    period: 'per month',
    description: 'For teams that need scale and governance',
    features: ['Everything in Pro', 'Team usage visibility', 'Custom policies', 'Dedicated onboarding'],
    cta: 'Contact Sales'
  }
];

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <header className="border-b border-dark-800 bg-dark-900/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-semibold">CodeSentry</span>
          </Link>
          <Link to="/" className="text-sm text-gray-300 hover:text-white transition">Back to home</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Simple pricing for secure shipping</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Start free, scale when needed, and keep your AI security-review costs predictable.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 ${plan.highlight ? 'border-violet-500 bg-violet-500/10' : 'border-dark-700 bg-dark-900/50'}`}
            >
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="text-3xl font-bold mt-3">{plan.price}<span className="text-sm text-gray-400 font-normal">/{plan.period}</span></p>
              <p className="text-sm text-gray-400 mt-2">{plan.description}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full mt-6 px-4 py-2.5 rounded-lg bg-white text-dark-900 font-medium hover:bg-gray-100 transition">
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 transition border border-dark-700">
            <Github className="w-4 h-4" />
            Continue with GitHub
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
