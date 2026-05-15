import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Shield,
  Clock,
  Code,
  Bug,
  TestTube,
  GitPullRequest,
  Check,
  X,
  Calendar,
  Activity,
  GitBranch,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Trash2,
  Eye,
  BarChart3,
  TrendingUp,
  CalendarDays,
  FileCode,
  LogOut,
  Github,
  Crown,
  Zap,
  Users,
  ArrowUpRight
} from 'lucide-react';
import clsx from 'clsx';

const MODE_ICONS = {
  'code-review': Code,
  'debug': Bug,
  'generate-tests': TestTube,
  'analyze-pr': GitPullRequest,
  'repo-review': Shield
};

const MODE_LABELS = {
  'code-review': 'Code Review',
  'debug': 'Debug',
  'generate-tests': 'Test Generation',
  'analyze-pr': 'PR Analysis',
  'repo-review': 'Repository Review'
};

const MODE_COLORS = {
  'code-review': 'from-blue-500 to-cyan-500',
  'debug': 'from-red-500 to-orange-500',
  'generate-tests': 'from-green-500 to-emerald-500',
  'analyze-pr': 'from-purple-500 to-pink-500',
  'repo-review': 'from-orange-500 to-amber-500'
};

const PLAN_CONFIG = {
  free: {
    name: 'Free',
    color: 'gray',
    icon: Zap,
    limits: { reviews: 10, features: ['Code Review', 'Debug', 'Basic Tests'] }
  },
  pro: {
    name: 'Pro',
    color: 'violet',
    icon: Crown,
    limits: { reviews: 100, features: ['All Analysis Types', 'Priority Support', 'Advanced Security'] }
  },
  team: {
    name: 'Team',
    color: 'amber',
    icon: Users,
    limits: { reviews: 500, features: ['Unlimited Reviews', 'Team Dashboard', 'Custom Integrations'] }
  }
};

const Profile = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState(null);

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await api.get('/auth/stats');
      if (response.data.success) {
        setUserStats(response.data.stats);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get('/auth/history', { params: { limit: 50 } });
      if (response.data.success) {
        setHistory(response.data.history || []);
      }
    } catch (err) {
      console.error('Fetch history error:', err);
      toast.error('Failed to load history');
    } finally {
      setLoadingHistory(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }
    if (user) {
      fetchUserStats();
      fetchHistory();
    }
  }, [user, authLoading, navigate, fetchUserStats, fetchHistory]);

  const handleDeleteHistoryItem = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      setHistory(prev => prev.filter(item => item._id !== id));
      toast.success('Deleted successfully');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPlanInfo = () => {
    const plan = userStats?.plan || user?.plan || 'free';
    return PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  };

  const getUsagePercentage = () => {
    if (!userStats?.usage) return 0;
    const { reviewsUsed = 0, reviewsLimit = 10 } = userStats.usage;
    return Math.min(Math.round((reviewsUsed / reviewsLimit) * 100), 100);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const planInfo = getPlanInfo();
  const usagePercentage = getUsagePercentage();

  return (
    <div className="min-h-screen bg-dark-950">
      <header className="bg-dark-900/80 backdrop-blur-xl border-b border-dark-800 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">CodeSentry</h1>
                <p className="text-xs text-gray-500">AI Code Analysis Platform</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-xl text-sm font-medium transition border border-dark-700"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6 sticky top-24 space-y-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={user?.github?.avatar || 'https://avatars.githubusercontent.com/u/0'}
                    alt={user?.github?.username}
                    className="w-24 h-24 rounded-2xl mx-auto shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-dark-900 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mt-4">{user?.github?.username || 'User'}</h2>
                <p className="text-gray-500 text-sm mt-1">{user?.github?.email || 'No email'}</p>
                <a
                  href={`https://github.com/${user?.github?.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm text-violet-400 hover:text-violet-300 transition"
                >
                  <Github className="w-4 h-4" />
                  View GitHub Profile
                </a>
              </div>

              <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl p-4 border border-violet-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                    <planInfo.icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{planInfo.name} Plan</div>
                    <div className="text-xs text-gray-500">Current subscription</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Reviews Used</span>
                    <span className="text-white font-medium">
                      {userStats?.usage?.reviewsUsed || 0} / {userStats?.usage?.reviewsLimit || 10}
                    </span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-right">{usagePercentage}% used</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-dark-800">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Member since</span>
                  </div>
                  <span className="text-sm text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-dark-800">
                  <div className="flex items-center gap-3 text-gray-400">
                    <GitBranch className="w-4 h-4" />
                    <span className="text-sm">Repositories</span>
                  </div>
                  <span className="text-sm text-white">{userStats?.github?.publicRepos || 0}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-dark-800">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Followers</span>
                  </div>
                  <span className="text-sm text-white">{userStats?.github?.followers || 0}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 text-gray-400">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm">Following</span>
                  </div>
                  <span className="text-sm text-white">{userStats?.github?.following || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-dark-900/50 rounded-2xl border border-dark-800">
              <div className="flex border-b border-dark-800">
                {[
                  { id: 'overview', label: 'Overview', icon: Activity },
                  { id: 'history', label: 'History', icon: Clock },
                  { id: 'stats', label: 'Statistics', icon: BarChart3 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'flex-1 px-6 py-4 text-sm font-medium transition relative flex items-center justify-center gap-2',
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Usage Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-dark-800 rounded-xl border border-dark-700">
                          <BarChart3 className="w-5 h-5 text-blue-400 mb-2" />
                          <div className="text-2xl font-bold text-white">
                            {userStats?.usage?.reviewsUsed || 0}
                          </div>
                          <div className="text-xs text-gray-500">Reviews Used</div>
                        </div>
                        <div className="p-4 bg-dark-800 rounded-xl border border-dark-700">
                          <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
                          <div className="text-2xl font-bold text-green-400">
                            {history.length > 0 ? Math.round((history.filter(h => h.status === 'success').length / history.length) * 100) : 0}%
                          </div>
                          <div className="text-xs text-gray-500">Success Rate</div>
                        </div>
                        <div className="p-4 bg-dark-800 rounded-xl border border-dark-700">
                          <CalendarDays className="w-5 h-5 text-violet-400 mb-2" />
                          <div className="text-2xl font-bold text-violet-400">
                            {userStats?.usage?.reviewsLimit - (userStats?.usage?.reviewsUsed || 0)}
                          </div>
                          <div className="text-xs text-gray-500">Remaining</div>
                        </div>
                        <div className="p-4 bg-dark-800 rounded-xl border border-dark-700">
                          <Activity className="w-5 h-5 text-orange-400 mb-2" />
                          <div className="text-2xl font-bold text-orange-400">
                            {history.filter(h => h.mode === 'repo-review').length}
                          </div>
                          <div className="text-xs text-gray-500">Repo Reviews</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                      {history.length > 0 ? (
                        <div className="space-y-3">
                          {history.slice(0, 5).map((item) => {
                            const ModeIcon = MODE_ICONS[item.mode] || Code;
                            return (
                              <div
                                key={item._id}
                                className="flex items-center gap-4 p-4 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-dark-600 transition"
                              >
                                <div className={clsx('w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center', MODE_COLORS[item.mode] || 'from-gray-500 to-gray-600')}>
                                  <ModeIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{MODE_LABELS[item.mode] || item.mode}</p>
                                  <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {item.status === 'success' ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                  ) : item.status === 'failed' ? (
                                    <X className="w-4 h-4 text-red-400" />
                                  ) : (
                                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileCode className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-500">No analyses yet</p>
                          <Link
                            to="/dashboard"
                            className="inline-block mt-4 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-sm font-medium transition"
                          >
                            Start Your First Analysis
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Analysis History</h3>
                      <button
                        onClick={fetchHistory}
                        disabled={loadingHistory}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition"
                      >
                        <RefreshCw className={clsx('w-4 h-4', loadingHistory && 'animate-spin')} />
                      </button>
                    </div>

                    {loadingHistory ? (
                      <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading history...</p>
                      </div>
                    ) : history.length > 0 ? (
                      <div className="space-y-3">
                        {history.map((item) => {
                          const ModeIcon = MODE_ICONS[item.mode] || Code;
                          return (
                            <div
                              key={item._id}
                              className="p-4 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-dark-600 transition group"
                            >
                              <div className="flex items-start gap-4">
                                <div className={clsx('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0', MODE_COLORS[item.mode] || 'from-gray-500 to-gray-600')}>
                                  <ModeIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-white font-medium">{MODE_LABELS[item.mode] || item.mode}</h4>
                                    <span className={clsx('text-xs px-2 py-0.5 rounded-full', item.status === 'success' ? 'bg-green-500/20 text-green-400' : item.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400')}>
                                      {item.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-400 truncate">
                                    {item.input?.repo || item.input?.language ? `${item.input.language || ''} ${item.input.framework ? `(${item.input.framework})` : ''}`.trim() : 'Code analysis'}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDate(item.createdAt)}
                                    </span>
                                    {item.metadata?.tokensUsed && (
                                      <span className="flex items-center gap-1">
                                        <Zap className="w-3 h-3" />
                                        {item.metadata.tokensUsed} tokens
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                  {item.output && (
                                    <button className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition" title="View">
                                      <Eye className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteHistoryItem(item._id)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileCode className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500">No analysis history</p>
                        <p className="text-gray-600 text-sm mt-1">Your analysis history will appear here</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Analysis Breakdown</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(MODE_LABELS).map(([mode, label]) => {
                          const count = history.filter(item => item.mode === mode).length;
                          const Icon = MODE_ICONS[mode];
                          return (
                            <div key={mode} className="p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={clsx('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center', MODE_COLORS[mode])}>
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm text-gray-400">{label}</span>
                              </div>
                              <div className="text-2xl font-bold text-white">{count}</div>
                              <div className="text-xs text-gray-500">analyses</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                        <div className="flex items-center gap-3 mb-2">
                          <Check className="w-5 h-5 text-green-400" />
                          <span className="text-white font-medium">Successful Analyses</span>
                        </div>
                        <div className="text-3xl font-bold text-green-400">
                          {history.filter(item => item.status === 'success').length}
                        </div>
                      </div>
                      <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                        <div className="flex items-center gap-3 mb-2">
                          <X className="w-5 h-5 text-red-400" />
                          <span className="text-white font-medium">Failed Analyses</span>
                        </div>
                        <div className="text-3xl font-bold text-red-400">
                          {history.filter(item => item.status === 'failed').length}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-dark-800/50 rounded-xl border border-dark-700">
                      <h4 className="text-white font-medium mb-4">Plan Features</h4>
                      <div className="space-y-2">
                        {planInfo.limits.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-dark-700">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Reviews per month</span>
                          <span className="text-white font-medium">{planInfo.limits.reviews}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
