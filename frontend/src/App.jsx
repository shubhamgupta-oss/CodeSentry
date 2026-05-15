import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PricingPage from './pages/PricingPage';
import DocsPage from './pages/DocsPage';
import SecurityPage from './pages/SecurityPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route 
          path="/dashboard" 
          element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
          } 
        />
        <Route path="/auth/github/callback" element={<GitHubCallback />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

const GitHubCallback = () => {
  React.useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');
      
      if (error) {
        window.location.href = '/?error=' + encodeURIComponent(error);
        return;
      }
      
      if (!code) {
        window.location.href = '/?error=No+code+received';
        return;
      }

      try {
        // Exchange code with backend
        const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiBaseUrl}/auth/github/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ code, state: params.get('state') })
        });

        const data = await response.json();
        
        if (data.success && data.token) {
          localStorage.setItem('authToken', data.token);
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/?error=' + encodeURIComponent(data.error || 'Authentication failed');
        }
      } catch (err) {
        console.error('Callback error:', err);
        window.location.href = '/?error=' + encodeURIComponent('Authentication failed');
      }
    };

    handleCallback();
  }, []);
  
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Connecting to GitHub...</p>
      </div>
    </div>
  );
};

export default App;
