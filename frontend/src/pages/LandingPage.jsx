import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  CheckCircle2,
  Star,
  ArrowRight,
  Github,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Workflow,
  AlertCircle,
  Brain,
  Lock,
  TrendingUp,
  TestTube,
  Code2
} from 'lucide-react';
import toast from 'react-hot-toast';

const LandingPage = () => {
  const { login, isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      toast.error('GitHub authentication failed. Please try again.');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const features = [
    {
      icon: ShieldCheck,
      title: 'Security Analysis',
      description: 'Identify vulnerabilities, security risks, and compliance issues in your code.',
      color: 'red'
    },
    {
      icon: Code2,
      title: 'Code Quality',
      description: 'Detect performance issues, anti-patterns, and code smells automatically.',
      color: 'blue'
    },
    {
      icon: TestTube,
      title: 'Test Generation',
      description: 'Generate comprehensive test cases and improve code coverage.',
      color: 'green'
    },
    {
      icon: Brain,
      title: 'AI Debugging',
      description: 'Get instant insights and solutions for bugs and errors in your code.',
      color: 'purple'
    },
    {
      icon: Lock,
      title: 'Dependency Check',
      description: 'Scan dependencies for known vulnerabilities and outdated packages.',
      color: 'orange'
    },
    {
      icon: TrendingUp,
      title: 'Performance Optimization',
      description: 'Get recommendations to improve your code performance and efficiency.',
      color: 'cyan'
    }
  ];

  const testimonials = [
    {
      name: 'Alex Johnson',
      role: 'Senior Developer',
      company: 'TechCorp',
      comment: 'CodeSentry caught a critical SQL injection vulnerability we missed in code review. Highly recommend!',
      avatar: '👨‍💻'
    },
    {
      name: 'Sarah Chen',
      role: 'Engineering Lead',
      company: 'DevFlow Inc',
      comment: 'Reduced our code review time by 50% while improving security. Game changer for our team.',
      avatar: '👩‍💼'
    },
    {
      name: 'Mike Rodriguez',
      role: 'DevOps Engineer',
      company: 'CloudFirst',
      comment: 'The dependency vulnerability scanning alone has saved us from multiple production incidents.',
      avatar: '👨‍🔧'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Connect GitHub',
      description: 'Sign in with your GitHub account to access your repositories.'
    },
    {
      number: '02',
      title: 'Select PR or Code',
      description: 'Choose a pull request or paste your code for analysis.'
    },
    {
      number: '03',
      title: 'Get AI Insights',
      description: 'Receive detailed feedback, suggestions, and improvements instantly.'
    }
  ];

  const handleConnectGitHub = async () => {
    try {
      await login();
    } catch (error) {
      toast.error('Failed to connect to GitHub');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CodeSentry</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition">How it Works</a>
              <Link to="/pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
              <Link to="/docs" className="text-gray-300 hover:text-white transition">Docs</Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link 
                    to="/dashboard"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="text-gray-300 hover:text-white transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConnectGitHub}
                  className="flex items-center gap-2 bg-white text-dark-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  <Github className="w-5 h-5" />
                  Connect GitHub
                </button>
              )}
            </div>

            <button
              className="md:hidden text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-dark-800 border-t border-dark-700">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-300 hover:text-white">Features</a>
              <a href="#how-it-works" className="block text-gray-300 hover:text-white">How it Works</a>
              <Link to="/pricing" className="block text-gray-300 hover:text-white">Pricing</Link>
              <Link to="/docs" className="block text-gray-300 hover:text-white">Docs</Link>
              <button
                onClick={handleConnectGitHub}
                className="w-full flex items-center justify-center gap-2 bg-white text-dark-900 px-4 py-2 rounded-lg font-medium"
              >
                <Github className="w-5 h-5" />
                Connect GitHub
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 mb-8">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Security-First Code Analysis</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Catch Security Bugs{' '}
                <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Before</span>
                {' '}They Reach Production
              </h1>
              
              <p className="text-xl text-gray-400 mb-8 max-w-xl">
                CodeSentry uses advanced AI to identify security vulnerabilities, code quality issues, 
                performance problems, and dependency risks across your entire codebase.
              </p>

              {/* Key benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Detect Vulnerabilities</p>
                    <p className="text-gray-400 text-sm">Find security risks and compliance issues instantly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">AI-Powered Analysis</p>
                    <p className="text-gray-400 text-sm">GPT-4 powered insights with actionable recommendations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Automated Testing</p>
                    <p className="text-gray-400 text-sm">Generate comprehensive tests for better coverage</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <button
                  onClick={handleConnectGitHub}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition transform hover:scale-105 shadow-lg hover:shadow-red-500/50"
                >
                  <Github className="w-5 h-5" />
                  Connect GitHub
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#features"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-dark-800 hover:bg-dark-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition border border-dark-600"
                >
                  Explore Features
                </a>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row items-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Free tier available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>No credit card needed</span>
                </div>
              </div>
            </div>

            {/* Right side - Visual showcase */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Code window mockup */}
                <div className="bg-dark-800 border border-dark-700 rounded-xl shadow-2xl overflow-hidden">
                  <div className="bg-dark-900 px-4 py-3 border-b border-dark-700 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-400 ml-4">security-scan.analysis</span>
                  </div>
                  <div className="p-6 font-mono text-sm text-gray-300 space-y-2">
                    <div className="text-red-400">⚠️ SQL Injection Vulnerability</div>
                    <div className="text-gray-500">Found in: src/services/database.js:42</div>
                    <div className="text-orange-400 mt-4">🔍 Issue: User input not sanitized</div>
                    <div className="text-gray-500">query = "SELECT * FROM users WHERE id = " + userId</div>
                    <div className="text-green-400 mt-4">✅ Recommendation:</div>
                    <div className="text-gray-500">Use parameterized queries or ORM</div>
                    <div className="text-blue-400">→ Learn how to fix</div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold">
                  Security Alert Detected
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-dark-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400">Comprehensive Analysis</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything Your Code Needs
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From security vulnerabilities to code quality, performance optimization to dependency management 
              - CodeSentry has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                red: 'bg-red-500/10 text-red-400 border-red-500/20 hover:border-red-500/40',
                blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-500/40',
                green: 'bg-green-500/10 text-green-400 border-green-500/20 hover:border-green-500/40',
                purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500/40',
                orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:border-orange-500/40',
                cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/40'
              };
              
              return (
                <div
                  key={index}
                  className="group p-8 bg-dark-900 rounded-2xl border border-dark-700 hover:border-dark-600 transition-all duration-300 hover:shadow-lg hover:shadow-dark-800/50 hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 border transition-all ${colorClasses[feature.color]}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-opacity-90">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-dark-800 border-y border-dark-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by Dev Teams Worldwide
            </h2>
            <p className="text-xl text-gray-400">See how CodeSentry helps teams secure their code</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group p-8 bg-dark-900 rounded-2xl border border-dark-700 hover:border-dark-600 transition-all duration-300 hover:shadow-lg hover:shadow-dark-800/50"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.comment}"</p>
                <div className="flex items-center gap-4 pt-6 border-t border-dark-700">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6">
              <Workflow className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Simple Setup</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Three simple steps to secure your code with AI-powered analysis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="p-8 bg-dark-800 rounded-2xl border border-dark-700 h-full hover:border-dark-600 transition-all">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mb-6 font-bold text-white text-lg shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 transform -translate-y-1/2 justify-center items-center">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent" />
                    <ChevronRight className="w-6 h-6 text-primary-500/50 -ml-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-dark-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400">Flexible Plans</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Plans for Every Team
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Start free, scale with confidence. Upgrade anytime or stay on our free tier forever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl border transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-primary-600/20 to-primary-500/5 border-primary-500/50 shadow-2xl shadow-primary-500/20 transform scale-105'
                    : 'bg-dark-900 border-dark-700 hover:border-dark-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-red-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                      <Star className="w-4 h-4 fill-white" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 text-lg">/{plan.period}</span>
                    </div>
                    <p className="text-gray-400">{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleConnectGitHub}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary-600 to-red-600 hover:from-primary-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-dark-800 hover:bg-dark-700 text-white border border-dark-600 hover:border-dark-500'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-800 border-t border-dark-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ship Secure Code with Confidence
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Stop worrying about security vulnerabilities and code quality issues. Let CodeSentry protect your codebase.
          </p>
          <button
            onClick={handleConnectGitHub}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-4 rounded-xl font-semibold text-lg transition transform hover:scale-105 shadow-lg hover:shadow-red-500/50"
          >
            <Github className="w-5 h-5" />
            Connect GitHub & Start Scanning
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-dark-700 bg-dark-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <p className="text-white font-semibold mb-4">Product</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link to="/security" className="hover:text-white transition">Security</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-4">Resources</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/docs" className="hover:text-white transition">Documentation</Link></li>
                <li><Link to="/docs" className="hover:text-white transition">API Reference</Link></li>
                <li><Link to="/docs" className="hover:text-white transition">Product Updates</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-4">Follow</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button className="hover:text-white transition cursor-pointer">GitHub</button></li>
                <li><button className="hover:text-white transition cursor-pointer">Twitter</button></li>
                <li><button className="hover:text-white transition cursor-pointer">Discord</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-dark-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CodeSentry</span>
            </div>
            
            <p className="text-sm text-gray-400 text-center">
              © 2024 CodeSentry. All rights reserved. | Powered by GPT-4
            </p>

            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-white transition">
                <Github className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-white transition">
                <Star className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
