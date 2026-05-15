import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { githubService, aiService } from '../services/api';
import toast from 'react-hot-toast';
import {
  Code,
  Bug,
  TestTube,
  GitPullRequest,
  RefreshCw,
  Copy,
  Download,
  Check,
  AlertTriangle,
  LogOut,
  Loader2,
  ShieldAlert,
  Menu,
  X,
  Zap,
  Shield,
  GitBranch,
  Lightbulb,
  ChevronRight,
  Search,
  Sparkles,
  Activity,
  Target,
  TrendingUp,
  Terminal,
  LayoutGrid,
  Package,
  Lock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  ExternalLink,
  MessageSquare,
  Link2,
  FileCode,
  Plus,
  Minus
} from 'lucide-react';
import clsx from 'clsx';

const MODES = [
  { id: 'code-review', label: 'Code Review', icon: Code, color: 'blue', gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'debug', label: 'Debug', icon: Bug, color: 'red', gradient: 'from-red-500 to-orange-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  { id: 'generate-tests', label: 'Generate Tests', icon: TestTube, color: 'green', gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  { id: 'analyze-pr', label: 'PR Analysis', icon: GitPullRequest, color: 'purple', gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { id: 'repo-review', label: 'Repo Review', icon: ShieldAlert, color: 'orange', gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' }
];

const FRAMEWORKS = [
  { id: 'jest', name: 'Jest', language: 'javascript' },
  { id: 'mocha', name: 'Mocha', language: 'javascript' },
  { id: 'jasmine', name: 'Jasmine', language: 'javascript' },
  { id: 'cypress', name: 'Cypress', language: 'javascript' },
  { id: 'playwright', name: 'Playwright', language: 'javascript' },
  { id: 'pytest', name: 'Pytest', language: 'python' },
  { id: 'unittest', name: 'Unittest', language: 'python' },
  { id: 'python-selenium', name: 'Python Selenium', language: 'python' },
  { id: 'java-selenium', name: 'Java Selenium', language: 'java' },
  { id: 'go-testing', name: 'Go Testing', language: 'go' }
];

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' }
];

const Dashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [repos, setRepos] = useState([]);
  const [pulls, setPulls] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedPR, setSelectedPR] = useState(null);
  const [selectedRepoForReview, setSelectedRepoForReview] = useState(null);
  const [mode, setMode] = useState('code-review');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [diff, setDiff] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [framework, setFramework] = useState('jest');
  const [analysisTypes, setAnalysisTypes] = useState(['security', 'code-quality', 'best-practices', 'performance']);
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [, setLoadingPRs] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [prUrl, setPrUrl] = useState('');
  const [loadingPR, setLoadingPR] = useState(false);
  const [currentPR, setCurrentPR] = useState(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [inputMode, setInputMode] = useState('paste');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const [repoSearch, setRepoSearch] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      fetchRepos();
    }
  }, [authLoading, user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const fetchRepos = async () => {
    setLoadingRepos(true);
    try {
      const response = await githubService.getRepos();
      if (response && response.repos) {
        setRepos(response.repos);
      } else {
        toast.error('Invalid response from server');
      }
    } catch (err) {
      console.error('Fetch repos error:', err);
      toast.error(err.message || 'Failed to fetch repositories');
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchPulls = async (repo) => {
    setSelectedRepo(repo);
    setSelectedPR(null);
    setLoadingPRs(true);
    try {
      const response = await githubService.getPullRequests(repo.owner.login, repo.name);
      if (response && response.pulls) {
        setPulls(response.pulls);
      } else {
        toast.error('Invalid response from server');
      }
    } catch (err) {
      console.error('Fetch PRs error:', err);
      toast.error(err.message || 'Failed to fetch pull requests');
    } finally {
      setLoadingPRs(false);
    }
  };

  const selectPR = async (pr) => {
    setSelectedPR(pr);
    try {
      const diffResponse = await githubService.getPullRequestDiff(
        selectedRepo.owner.login,
        selectedRepo.name,
        pr.number
      );
      if (diffResponse && diffResponse.diff) {
        setDiff(diffResponse.diff);
        setMode('analyze-pr');
        setCurrentPR({
          number: pr.number,
          title: pr.title,
          url: `https://github.com/${selectedRepo.owner.login}/${selectedRepo.name}/pull/${pr.number}`
        });
      } else {
        toast.error('Invalid response from server');
      }
    } catch (err) {
      console.error('Fetch diff error:', err);
      toast.error(err.message || 'Failed to fetch PR diff');
    }
  };

  const fetchPRByUrl = async () => {
    if (!prUrl.trim()) {
      toast.error('Please enter a PR URL');
      return;
    }

    setLoadingPR(true);
    try {
      const response = await githubService.fetchPullRequestByUrl(prUrl);
      if (response.success) {
        setCurrentPR(response.pr);
        setDiff(response.diff);
        setMode('analyze-pr');
        setInputMode('paste');
        toast.success(`Loaded PR #${response.pr.number}: ${response.pr.title}`);
      } else {
        toast.error(response.error || 'Failed to fetch PR');
      }
    } catch (err) {
      console.error('Fetch PR error:', err);
      toast.error(err.message || 'Failed to fetch PR. Make sure the PR is public or you have access.');
    } finally {
      setLoadingPR(false);
    }
  };

  const postPRComment = async () => {
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!currentPR?.url) {
      toast.error('No PR selected. Please fetch a PR first.');
      return;
    }

    setPostingComment(true);
    try {
      const response = await githubService.postPullRequestComment(
        currentPR.url,
        commentText,
        output?.id
      );

      if (response.success) {
        toast.success('Comment posted successfully!');
        setCommentText('');
        setShowCommentBox(false);
      } else {
        toast.error(response.error || 'Failed to post comment');
      }
    } catch (err) {
      console.error('Post comment error:', err);
      toast.error(err.message || 'Failed to post comment. You may not have permission.');
    } finally {
      setPostingComment(false);
    }
  };

  const generateCommentText = () => {
    if (!output) return '';

    let comment = `## 🔍 CodeSentry AI Review Results\n\n`;
    
    if (output.summary) {
      comment += `### Summary\n${typeof output.summary === 'string' ? output.summary : output.summary.overallScore ? `Overall Score: ${output.summary.overallScore}/100` : ''}\n\n`;
    }

    if (output.bugs?.length > 0) {
      comment += `### 🐛 Bugs Found (${output.bugs.length})\n`;
      output.bugs.forEach((bug, idx) => {
        comment += `- **[${bug.severity?.toUpperCase()}]** ${bug.description}\n`;
        if (bug.cwe) comment += `  - CWE-${bug.cwe}\n`;
        if (bug.owasp) comment += `  - OWASP A${bug.owasp}\n`;
        if (bug.suggestion) comment += `  - Fix: ${bug.suggestion}\n`;
      });
      comment += '\n';
    }

    if (output.securityIssues?.length > 0) {
      comment += `### 🔒 Security Issues (${output.securityIssues.length})\n`;
      output.securityIssues.forEach((issue) => {
        comment += `- **[${issue.severity?.toUpperCase()}]** ${issue.type || issue.category}: ${issue.description}\n`;
        if (issue.cwe) comment += `  - CWE-${issue.cwe}\n`;
        if (issue.owasp) comment += `  - OWASP A${issue.owasp}\n`;
        if (issue.fix) comment += `  - Fix: ${issue.fix}\n`;
      });
      comment += '\n';
    } else if (output.security?.vulnerabilities?.length > 0) {
      comment += `### 🔒 Security Issues (${output.security.vulnerabilities.length})\n`;
      output.security.vulnerabilities.forEach((vuln) => {
        comment += `- **[${vuln.severity?.toUpperCase()}]** ${vuln.type || vuln.category}: ${vuln.description}\n`;
        if (vuln.cwe) comment += `  - CWE-${vuln.cwe}\n`;
        if (vuln.owasp) comment += `  - OWASP A${vuln.owasp}\n`;
        if (vuln.fix) comment += `  - Fix: ${vuln.fix}\n`;
      });
      comment += '\n';
    }

    if (output.improvements?.length > 0) {
      comment += `### 💡 Suggestions (${output.improvements.length})\n`;
      output.improvements.forEach((imp) => {
        comment += `- **${imp.type}**: ${imp.description}\n`;
      });
      comment += '\n';
    }

    if (output.secrets?.length > 0) {
      comment += `### ⚠️ Secrets Detected (${output.secrets.length})\n`;
      comment += `> **CRITICAL**: These secrets should be rotated immediately!\n`;
      output.secrets.forEach((secret) => {
        comment += `- **[CRITICAL]** ${secret.type}: ${secret.description}\n`;
        if (secret.file) comment += `  - File: ${secret.file}${secret.line ? `:${secret.line}` : ''}\n`;
      });
      comment += '\n';
    }

    comment += `---\n*Reviewed with CodeSentry AI* 🤖`;

    return comment;
  };

  const handlePostComment = () => {
    const generatedComment = generateCommentText();
    setCommentText(generatedComment);
    setShowCommentBox(true);
  };

  const getValidationMessage = () => {
    if (mode === 'code-review' && !code.trim() && !diff.trim()) {
      return 'Paste code or load a PR diff to run code review.';
    }
    if (mode === 'debug' && !code.trim() && !diff.trim()) {
      return 'Add code or PR diff before running debug mode.';
    }
    if (mode === 'debug' && !error.trim() && inputMode === 'paste') {
      return 'Add the error message so debugging can be targeted.';
    }
    if (mode === 'generate-tests' && !code.trim() && !diff.trim()) {
      return 'Provide code or PR diff to generate tests.';
    }
    if (mode === 'analyze-pr' && !diff.trim()) {
      return 'Select a PR or paste a diff to analyze.';
    }
    if (mode === 'repo-review' && !selectedRepoForReview) {
      return 'Select a repository to start repository review.';
    }
    return '';
  };

  const handleSubmit = async () => {
    const validationMessage = getValidationMessage();
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    setLoading(true);
    setOutput(null);

    try {
      let response;

      switch (mode) {
        case 'code-review':
          if (inputMode === 'url' && diff.trim()) {
            response = await aiService.codeReview(null, language, {}, diff, currentPR);
          } else {
            response = await aiService.codeReview(code, language, {}, null, null);
          }
          break;
        case 'debug':
          if (inputMode === 'url' && diff.trim()) {
            response = await aiService.debug(diff, error || 'PR changes review', language);
          } else {
            response = await aiService.debug(code, error, language);
          }
          break;
        case 'generate-tests':
          if (inputMode === 'url' && diff.trim()) {
            response = await aiService.generateTests({
              code: diff,
              language: language || 'javascript',
              framework: framework || 'jest',
              testType: 'all',
              includeEdgeCases: true,
              includeNegativeCases: true,
              coverageTarget: 80
            });
          } else {
            response = await aiService.generateTests({
              code,
              language: language || 'javascript',
              framework: framework || 'jest',
              testType: 'all',
              includeEdgeCases: true,
              includeNegativeCases: true,
              coverageTarget: 80
            });
          }
          break;
        case 'analyze-pr':
          response = await aiService.analyzePR(
            diff,
            selectedRepo ? `${selectedRepo.owner.login}/${selectedRepo.name}` : null,
            selectedPR?.number,
            ''
          );
          break;
        case 'repo-review':
          response = await aiService.reviewRepository(
            `${selectedRepoForReview.owner.login}/${selectedRepoForReview.name}`,
            language,
            analysisTypes
          );
          break;
        default:
          throw new Error('Unknown mode');
      }

      setOutput(response.data);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mode}-result-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-400 bg-red-500/10 border-red-500/30',
      high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      low: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    };
    return colors[severity] || colors.low;
  };

  const clearAll = () => {
    setCode('');
    setError('');
    setDiff('');
    setSelectedRepoForReview(null);
    setSelectedPR(null);
    setSelectedRepo(null);
    setAnalysisTypes(['security', 'code-quality', 'best-practices', 'performance']);
    setOutput(null);
    setPrUrl('');
    setCurrentPR(null);
    setShowCommentBox(false);
    setCommentText('');
    setInputMode('paste');
  };

  const currentMode = MODES.find(m => m.id === mode);
  const validationMessage = getValidationMessage();
  const canSubmit = !loading && !validationMessage;
  const filteredRepos = repos.filter((repo) => {
    if (!repoSearch.trim()) {
      return true;
    }
    const search = repoSearch.toLowerCase();
    return (
      repo.name.toLowerCase().includes(search) ||
      repo.owner?.login?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <header className="bg-dark-900/80 backdrop-blur-xl border-b border-dark-800 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">CodeSentry</h1>
                  <p className="text-xs text-gray-500">AI Code Analysis Platform</p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>AI-Powered</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-3 px-3 py-2 bg-dark-800 rounded-xl border border-dark-700 hover:border-dark-600 transition"
              >
                <img
                  src={user?.github?.avatar || 'https://avatars.githubusercontent.com/u/0'}
                  alt={user?.github?.username}
                  className="w-7 h-7 rounded-lg"
                />
                <span className="text-sm text-white font-medium">{user?.github?.username}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {isMobile && sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            aria-label="Close sidebar overlay"
          />
        )}
        <aside className={clsx(
          'bg-dark-900/50 border-r border-dark-800 overflow-y-auto transition-all duration-300 lg:relative lg:translate-x-0 lg:w-80',
          'fixed left-0 top-[73px] h-[calc(100vh-73px)] w-80 z-40',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
          <div className="p-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <LayoutGrid className="w-4 h-4 text-gray-500" />
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Analysis Modes</h2>
              </div>
              <div className="space-y-2">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMode(m.id);
                        setSidebarOpen(false);
                      }}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                        isActive
                          ? `bg-gradient-to-r ${m.gradient} text-white shadow-lg`
                          : 'bg-dark-800/50 text-gray-400 hover:bg-dark-800 hover:text-white border border-transparent hover:border-dark-700'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium flex-1 text-left">{m.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-gray-500" />
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Repositories</h2>
                </div>
                <button
                  onClick={fetchRepos}
                  disabled={loadingRepos}
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-dark-800 rounded-lg transition"
                >
                  {loadingRepos ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </button>
              </div>
              <input
                type="text"
                value={repoSearch}
                onChange={(e) => setRepoSearch(e.target.value)}
                placeholder="Search repositories..."
                className="w-full mb-3 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-violet-500"
              />

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {loadingRepos ? (
                  <p className="text-xs text-gray-500 text-center py-4">Loading repositories...</p>
                ) : repos.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No repositories found.</p>
                ) : filteredRepos.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No repositories match your search.</p>
                ) : (
                  filteredRepos.slice(0, 12).map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => {
                        fetchPulls(repo);
                        setSidebarOpen(false);
                      }}
                      className={clsx(
                        'w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200',
                        selectedRepo?.id === repo.id
                          ? 'bg-violet-500/10 border border-violet-500/30'
                          : 'bg-dark-800/30 border border-dark-800 hover:bg-dark-800/50'
                      )}
                    >
                      <p className="text-sm font-medium text-white truncate">{repo.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {repo.language && (
                          <span className="text-xs text-gray-500">{repo.language}</span>
                        )}
                        {repo.stars > 0 && (
                          <span className="text-xs text-yellow-500/70">★ {repo.stars}</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {selectedRepo && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <GitPullRequest className="w-4 h-4 text-gray-500" />
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pull Requests</h2>
                </div>
                <p className="text-xs text-gray-600 mb-2">{selectedRepo.name}</p>

                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {pulls.length === 0 ? (
                    <p className="text-xs text-gray-600 text-center py-4">No open pull requests</p>
                  ) : (
                    pulls.map((pr) => (
                      <button
                        key={pr.number}
                        onClick={() => selectPR(pr)}
                        className={clsx(
                          'w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm',
                          selectedPR?.number === pr.number
                            ? 'bg-purple-500/10 border border-purple-500/30'
                            : 'bg-dark-800/30 border border-dark-800 hover:bg-dark-800/50'
                        )}
                      >
                        <p className="font-medium text-white truncate">#{pr.number} {pr.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">by {pr.user.login}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 lg:ml-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={clsx('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center', currentMode?.gradient)}>
                {currentMode && <currentMode.icon className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{currentMode?.label}</h2>
                <p className="text-sm text-gray-500">
                  {mode === 'code-review' && 'Analyze code for issues and improvements'}
                  {mode === 'debug' && 'Identify and fix bugs in your code'}
                  {mode === 'generate-tests' && 'Generate comprehensive test cases'}
                  {mode === 'analyze-pr' && 'Review pull request changes'}
                  {mode === 'repo-review' && 'Full repository security and quality audit'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-dark-900/40 border border-dark-800 rounded-xl p-4">
            <p className="text-sm text-gray-300 font-medium">Quick start</p>
            <p className="text-xs text-gray-500 mt-1">
              Choose a mode, load code or PR diff, then run analysis. Use the left panel to pick repositories and pull requests faster.
            </p>
            {validationMessage && (
              <p className="text-xs text-amber-400 mt-2">{validationMessage}</p>
            )}
          </div>

          <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
            {mode === 'repo-review' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Select Repository</label>
                  <button
                    onClick={() => setShowRepoSelector(!showRepoSelector)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white hover:border-dark-600 transition"
                  >
                    <span className={selectedRepoForReview ? 'text-white' : 'text-gray-500'}>
                      {selectedRepoForReview ? `${selectedRepoForReview.owner.login}/${selectedRepoForReview.name}` : 'Choose a repository...'}
                    </span>
                    <ChevronRight className={clsx('w-5 h-5 text-gray-400 transition', showRepoSelector && 'rotate-90')} />
                  </button>

                  {showRepoSelector && (
                    <div className="mt-2 max-h-48 overflow-y-auto bg-dark-800 border border-dark-700 rounded-xl divide-y divide-dark-700">
                      {filteredRepos.slice(0, 20).map((repo) => (
                        <button
                          key={repo.id}
                          onClick={() => {
                            setSelectedRepoForReview(repo);
                            setShowRepoSelector(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-dark-700 transition"
                        >
                          <div className="text-sm font-medium text-white">{repo.owner.login}/{repo.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{repo.language || 'Unknown'} • ★ {repo.stars}</div>
                        </button>
                      ))}
                      {repos.length > 0 && filteredRepos.length === 0 && (
                        <p className="px-4 py-3 text-xs text-gray-500">No repositories match your search.</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Security Checks</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { id: 'security', label: 'Security Vulnerabilities', desc: 'SQL Injection, XSS, CSRF, RCE', icon: ShieldAlert, color: 'red', critical: true },
                      { id: 'code-quality', label: 'Code Quality', desc: 'Code smells, complexity, duplication', icon: Code, color: 'blue' },
                      { id: 'best-practices', label: 'Best Practices', desc: 'Standards, conventions, patterns', icon: Target, color: 'green' },
                      { id: 'performance', label: 'Performance', desc: 'Bottlenecks, memory leaks, optimization', icon: TrendingUp, color: 'yellow' },
                      { id: 'dependencies', label: 'Dependency Scan', desc: 'Outdated & vulnerable packages', icon: Package, color: 'purple' },
                      { id: 'secrets', label: 'Secret Detection', desc: 'API keys, tokens, credentials', icon: Lock, color: 'orange', critical: true }
                    ].map((type) => (
                      <label
                        key={type.id}
                        className={clsx(
                          'flex items-start gap-3 p-4 rounded-xl cursor-pointer transition border relative',
                          analysisTypes.includes(type.id)
                            ? 'bg-violet-500/10 border-violet-500/30'
                            : 'bg-dark-800/50 border-dark-700 hover:bg-dark-800'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={analysisTypes.includes(type.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAnalysisTypes([...analysisTypes, type.id]);
                            } else {
                              setAnalysisTypes(analysisTypes.filter(t => t !== type.id));
                            }
                          }}
                          className="sr-only"
                        />
                        <div className={clsx(
                          'w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                          analysisTypes.includes(type.id) ? 'bg-violet-500' : 'bg-dark-700'
                        )}>
                          {analysisTypes.includes(type.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-white">{type.label}</span>
                          <p className="text-xs text-gray-500 mt-0.5">{type.desc}</p>
                          {type.critical && (
                            <span className="inline-flex items-center mt-2 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                              Critical
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-300">Language:</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-dark-800 border border-dark-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {(mode === 'code-review' || mode === 'analyze-pr') && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => { setInputMode('paste'); setPrUrl(''); setCurrentPR(null); }}
                        className={clsx(
                          'px-4 py-2 rounded-lg text-sm font-medium transition',
                          inputMode === 'paste'
                            ? 'bg-violet-500 text-white'
                            : 'bg-dark-800 text-gray-400 hover:text-white'
                        )}
                      >
                        <FileCode className="w-4 h-4 inline mr-2" />
                        Paste Code
                      </button>
                      <button
                        onClick={() => { setInputMode('url'); setCode(''); setDiff(''); }}
                        className={clsx(
                          'px-4 py-2 rounded-lg text-sm font-medium transition',
                          inputMode === 'url'
                            ? 'bg-violet-500 text-white'
                            : 'bg-dark-800 text-gray-400 hover:text-white'
                        )}
                      >
                        <Link2 className="w-4 h-4 inline mr-2" />
                        GitHub PR URL
                      </button>
                    </div>

                    {inputMode === 'url' ? (
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={prUrl}
                              onChange={(e) => setPrUrl(e.target.value)}
                              placeholder="Paste GitHub PR URL... (e.g., https://github.com/owner/repo/pull/123)"
                              className="w-full px-4 py-3 bg-dark-950 border border-dark-700 rounded-xl text-gray-300 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                            />
                            <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                          </div>
                          <button
                            onClick={fetchPRByUrl}
                            disabled={loadingPR || !prUrl.trim()}
                            className="px-6 py-3 bg-violet-500 hover:bg-violet-600 disabled:bg-dark-700 disabled:text-gray-500 text-white rounded-xl font-medium transition flex items-center gap-2"
                          >
                            {loadingPR ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <ExternalLink className="w-5 h-5" />
                                Fetch PR
                              </>
                            )}
                          </button>
                        </div>

                        {currentPR && (
                          <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <GitPullRequest className="w-4 h-4 text-purple-400" />
                                  <span className="text-sm font-medium text-white">#{currentPR.number}</span>
                                  <span className={clsx('px-2 py-0.5 rounded text-xs', currentPR.state === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400')}>
                                    {currentPR.state}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{currentPR.title}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Plus className="w-3 h-3 text-green-400" />{currentPR.additions || 0}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Minus className="w-3 h-3 text-red-400" />{currentPR.deletions || 0}
                                  </span>
                                  <span>{currentPR.changedFiles || 0} files</span>
                                </div>
                              </div>
                              <a
                                href={currentPR.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}

                        {diff && (
                          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-sm text-green-400">✓ Diff loaded successfully ({diff.length} characters)</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {mode === 'code-review' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                              <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-dark-800 border border-dark-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500"
                              >
                                {LANGUAGES.map((lang) => (
                                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-end">
                              <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700 flex items-center gap-3 w-full">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <ShieldAlert className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-white">Full Security Scan</span>
                                  <p className="text-xs text-gray-500">Includes security & best practices</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {mode === 'analyze-pr' && (
                          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <GitPullRequest className="w-5 h-5 text-purple-400" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-white">PR Diff Review</span>
                                <p className="text-xs text-gray-500">Paste diff below or fetch from GitHub PR URL</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-300">
                              {mode === 'analyze-pr' ? 'Git Diff / Code' : 'Your Code'}
                            </label>
                            <span className="text-xs text-gray-500">{mode === 'analyze-pr' ? diff.length : code.length} characters</span>
                          </div>
                          <textarea
                            value={mode === 'analyze-pr' ? diff : code}
                            onChange={(e) => mode === 'analyze-pr' ? setDiff(e.target.value) : setCode(e.target.value)}
                            placeholder={mode === 'analyze-pr' ? 
                              `Paste git diff here or fetch from GitHub PR URL...

Example:
--- a/src/index.js
+++ b/src/index.js
@@ -1,5 +1,7 @@
 function hello() {
+  console.log('Hello World');
   return true;
 }` : 
                              `Paste your code here for review...

Example:
function processData(input) {
  return input.map(x => x * 2);
}`}
                            className="w-full h-64 bg-dark-950 border border-dark-700 rounded-xl p-4 text-gray-300 font-mono text-sm resize-none focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>

                        {mode === 'code-review' && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { icon: Bug, label: 'Bug Detection', color: 'red' },
                              { icon: ShieldAlert, label: 'Security', color: 'orange' },
                              { icon: Target, label: 'Best Practices', color: 'green' },
                              { icon: TrendingUp, label: 'Performance', color: 'yellow' }
                            ].map((item, idx) => (
                              <div key={idx} className="p-3 bg-dark-800/50 rounded-xl border border-dark-700 flex items-center gap-2">
                                <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                                <span className="text-xs text-gray-400">{item.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {mode === 'debug' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Debug Your Code</h3>
                      <span className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded-full">Debug Mode</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full bg-dark-800 border border-dark-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-red-500"
                        >
                          {LANGUAGES.map((lang) => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-xl border border-dark-700 cursor-pointer hover:border-dark-600 transition h-full">
                          <input
                            type="checkbox"
                            id="debugCodeReview"
                            defaultChecked={true}
                            className="w-5 h-5 accent-violet-500 rounded"
                          />
                          <div>
                            <span className="text-sm font-medium text-white flex items-center gap-2">
                              🔍 Full Code Analysis
                              <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded-full">Recommended</span>
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">Scan for bugs, security issues, and best practices</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => { setInputMode('paste'); setPrUrl(''); setCurrentPR(null); }}
                        className={clsx(
                          'px-4 py-2 rounded-lg text-sm font-medium transition',
                          inputMode === 'paste'
                            ? 'bg-red-500 text-white'
                            : 'bg-dark-800 text-gray-400 hover:text-white'
                        )}
                      >
                        <FileCode className="w-4 h-4 inline mr-2" />
                        Paste Code
                      </button>
                      <button
                        onClick={() => { setInputMode('url'); setCode(''); setError(''); }}
                        className={clsx(
                          'px-4 py-2 rounded-lg text-sm font-medium transition',
                          inputMode === 'url'
                            ? 'bg-red-500 text-white'
                            : 'bg-dark-800 text-gray-400 hover:text-white'
                        )}
                      >
                        <Link2 className="w-4 h-4 inline mr-2" />
                        GitHub PR URL
                      </button>
                    </div>

                    {inputMode === 'url' ? (
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={prUrl}
                              onChange={(e) => setPrUrl(e.target.value)}
                              placeholder="Paste GitHub PR URL... (e.g., https://github.com/owner/repo/pull/123)"
                              className="w-full px-4 py-3 bg-dark-950 border border-dark-700 rounded-xl text-gray-300 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                            />
                            <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                          </div>
                          <button
                            onClick={fetchPRByUrl}
                            disabled={loadingPR || !prUrl.trim()}
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-dark-700 disabled:text-gray-500 text-white rounded-xl font-medium transition flex items-center gap-2"
                          >
                            {loadingPR ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <ExternalLink className="w-5 h-5" />
                                Fetch PR
                              </>
                            )}
                          </button>
                        </div>

                        {currentPR && (
                          <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <GitPullRequest className="w-4 h-4 text-red-400" />
                                  <span className="text-sm font-medium text-white">#{currentPR.number}</span>
                                  <span className={clsx('px-2 py-0.5 rounded text-xs', currentPR.state === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400')}>
                                    {currentPR.state}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{currentPR.title}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Plus className="w-3 h-3 text-green-400" />{currentPR.additions || 0}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Minus className="w-3 h-3 text-red-400" />{currentPR.deletions || 0}
                                  </span>
                                  <span>{currentPR.changedFiles || 0} files</span>
                                </div>
                              </div>
                              <a
                                href={currentPR.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}

                        {diff && (
                          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-sm text-green-400">✓ PR diff loaded successfully ({diff.length} characters)</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-300">Your Code</label>
                            <span className="text-xs text-gray-500">{code.length} characters</span>
                          </div>
                          <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder={`Paste your code here...

Example:
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}`}
                            className="w-full h-48 bg-dark-950 border border-dark-700 rounded-xl p-4 text-gray-300 font-mono text-sm resize-none focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                          />
                        </div>

                        <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                          <label className="block">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Bug className="w-4 h-4 text-red-400" />
                                Error Message
                              </span>
                            </div>
                            <textarea
                              value={error}
                              onChange={(e) => setError(e.target.value)}
                              placeholder="Paste the error message here...

Example:
TypeError: Cannot read property 'price' of undefined
    at calculateTotal (index.js:5:20)"
                              className="w-full h-32 bg-dark-950 border border-dark-700 rounded-xl p-4 text-gray-300 font-mono text-sm resize-none focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-400">What You'll Get</p>
                        <p className="text-xs text-gray-400">Root cause analysis, fix suggestions, code review insights, and security checks</p>
                      </div>
                    </div>
                  </div>
                )}

                {mode === 'generate-tests' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Generate Tests</h3>
                      <span className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full">Test Generation</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full bg-dark-800 border border-dark-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
                        >
                          {LANGUAGES.map((lang) => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Testing Framework</label>
                        <select
                          value={framework}
                          onChange={(e) => setFramework(e.target.value)}
                          className="w-full bg-dark-800 border border-dark-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
                        >
                          {FRAMEWORKS.filter(fw => fw.language === language || language === 'javascript').map((fw) => (
                            <option key={fw.id} value={fw.id}>{fw.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Test Types to Generate</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { id: 'unit', label: 'Unit Tests', icon: '🔬', desc: 'Test individual functions' },
                          { id: 'integration', label: 'Integration', icon: '🔗', desc: 'Test component interactions' },
                          { id: 'e2e', label: 'E2E Tests', icon: '🌐', desc: 'Full flow testing' },
                          { id: 'edge', label: 'Edge Cases', icon: '⚡', desc: 'Boundary conditions' }
                        ].map((type) => (
                          <label
                            key={type.id}
                            className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg cursor-pointer hover:bg-dark-800 transition border border-transparent hover:border-dark-600"
                          >
                            <input
                              type="checkbox"
                              defaultChecked={true}
                              className="w-4 h-4 mt-1 accent-green-500"
                            />
                            <div>
                              <span className="text-sm font-medium text-white">{type.icon} {type.label}</span>
                              <p className="text-xs text-gray-500">{type.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/30">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          id="includeCodeReview"
                          defaultChecked={true}
                          className="w-5 h-5 mt-0.5 accent-violet-500 rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-white flex items-center gap-2">
                            🔍 Include Code Review
                            <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded-full">Recommended</span>
                          </span>
                          <p className="text-xs text-gray-400 mt-1">Analyze your code first to identify bugs, security issues, and generate targeted tests</p>
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => { setInputMode('paste'); setPrUrl(''); setCurrentPR(null); }}
                        className={clsx(
                          'px-4 py-2 rounded-lg text-sm font-medium transition',
                          inputMode === 'paste'
                            ? 'bg-green-500 text-white'
                            : 'bg-dark-800 text-gray-400 hover:text-white'
                        )}
                      >
                        <FileCode className="w-4 h-4 inline mr-2" />
                        Paste Code
                      </button>
                      <button
                        onClick={() => { setInputMode('url'); setCode(''); }}
                        className={clsx(
                          'px-4 py-2 rounded-lg text-sm font-medium transition',
                          inputMode === 'url'
                            ? 'bg-green-500 text-white'
                            : 'bg-dark-800 text-gray-400 hover:text-white'
                        )}
                      >
                        <Link2 className="w-4 h-4 inline mr-2" />
                        GitHub PR URL
                      </button>
                    </div>

                    {inputMode === 'url' ? (
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={prUrl}
                              onChange={(e) => setPrUrl(e.target.value)}
                              placeholder="Paste GitHub PR URL... (e.g., https://github.com/owner/repo/pull/123)"
                              className="w-full px-4 py-3 bg-dark-950 border border-dark-700 rounded-xl text-gray-300 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                            />
                            <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                          </div>
                          <button
                            onClick={fetchPRByUrl}
                            disabled={loadingPR || !prUrl.trim()}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-dark-700 disabled:text-gray-500 text-white rounded-xl font-medium transition flex items-center gap-2"
                          >
                            {loadingPR ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <ExternalLink className="w-5 h-5" />
                                Fetch PR
                              </>
                            )}
                          </button>
                        </div>

                        {currentPR && (
                          <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <GitPullRequest className="w-4 h-4 text-green-400" />
                                  <span className="text-sm font-medium text-white">#{currentPR.number}</span>
                                  <span className={clsx('px-2 py-0.5 rounded text-xs', currentPR.state === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400')}>
                                    {currentPR.state}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{currentPR.title}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Plus className="w-3 h-3 text-green-400" />{currentPR.additions || 0}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Minus className="w-3 h-3 text-red-400" />{currentPR.deletions || 0}
                                  </span>
                                  <span>{currentPR.changedFiles || 0} files</span>
                                </div>
                              </div>
                              <a
                                href={currentPR.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}

                        {diff && (
                          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-sm text-green-400">✓ PR diff loaded successfully ({diff.length} characters)</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-300">Your Code</label>
                          <span className="text-xs text-gray-500">{code.length} characters</span>
                        </div>
                        <textarea
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder={`Paste your ${language} code here to generate comprehensive tests...

Example:
function add(a, b) {
  return a + b;
}`}
                          className="w-full h-64 bg-dark-950 border border-dark-700 rounded-xl p-4 text-gray-300 font-mono text-sm resize-none focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-400">What You'll Get</p>
                        <p className="text-xs text-gray-400">Test cases with descriptions, edge cases, negative tests, and setup instructions</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={clsx(
                'flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all w-full sm:w-auto',
                !canSubmit
                  ? 'bg-dark-700 text-gray-500 cursor-not-allowed'
                  : `bg-gradient-to-r ${currentMode?.gradient} text-white hover:shadow-lg hover:shadow-violet-500/20`
              )}
              title={validationMessage || 'Run analysis'}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  {mode === 'repo-review' ? 'Start Review' : 'Analyze'}
                </>
              )}
            </button>
            <button
              onClick={clearAll}
              className="px-6 py-3 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-xl font-medium transition border border-dark-700 w-full sm:w-auto"
            >
              Clear
            </button>
          </div>

          {output && (
            <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6 space-y-6">
              <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
                  {currentPR && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      PR #{currentPR.number}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {((mode === 'analyze-pr') || (mode === 'code-review' && inputMode === 'url' && currentPR) || (mode === 'debug' && inputMode === 'url' && currentPR) || (mode === 'generate-tests' && inputMode === 'url' && currentPR)) && (
                    <button
                      onClick={handlePostComment}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition border border-green-500/30"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Post Comment
                    </button>
                  )}
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg text-sm transition border border-dark-700"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg text-sm transition border border-dark-700"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              {showCommentBox && (
                <div className="p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-400" />
                      Post to GitHub
                    </h4>
                    <button
                      onClick={() => setShowCommentBox(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Edit your comment..."
                    className="w-full h-64 bg-dark-950 border border-dark-700 rounded-xl p-4 text-gray-300 text-sm resize-none focus:outline-none focus:border-green-500/50"
                  />
                  <div className="flex justify-end gap-3 mt-3">
                    <button
                      onClick={() => setShowCommentBox(false)}
                      className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg text-sm transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={postPRComment}
                      disabled={postingComment}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-dark-700 text-white rounded-lg text-sm transition"
                    >
                      {postingComment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                      Post Comment
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {output.summary && typeof output.summary === 'string' && (
                  <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                    <h4 className="text-violet-400 font-semibold mb-2">Summary</h4>
                    <p className="text-gray-300">{output.summary}</p>
                  </div>
                )}

                {output.bugs && output.bugs.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      Bugs Found ({output.bugs.length})
                    </h4>
                    <div className="space-y-3">
                      {output.bugs.map((bug, idx) => (
                        <div key={idx} className={clsx('p-4 rounded-xl border', getSeverityColor(bug.severity))}>
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-semibold uppercase">{bug.severity}</span>
                            {bug.line && <span className="text-xs text-gray-500">Line {bug.line}</span>}
                          </div>
                          <p className="text-gray-300 mb-2">{bug.description}</p>
                          {bug.suggestion && (
                            <div className="mt-2 p-2 bg-dark-950 rounded-lg">
                              <span className="text-xs text-gray-500">Fix: </span>
                              <span className="text-sm text-gray-400">{bug.suggestion}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {output.riskAreas && output.riskAreas.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-yellow-400" />
                      Risk Areas ({output.riskAreas.length})
                    </h4>
                    <div className="space-y-3">
                      {output.riskAreas.map((risk, idx) => (
                        <div key={idx} className={clsx('p-4 rounded-xl border', getSeverityColor(risk.severity))}>
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-semibold uppercase">{risk.severity}</span>
                            {risk.file && <span className="text-xs text-gray-500">{risk.file}</span>}
                          </div>
                          <p className="text-gray-300">{risk.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {output.rootCause && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                      <Bug className="w-4 h-4" /> Root Cause
                    </h4>
                    <p className="text-gray-300">{output.rootCause}</p>
                    {output.confidence && (
                      <div className="mt-3">
                        <span className="text-sm text-gray-500">Confidence: </span>
                        <span className="text-lg font-bold text-green-400">{output.confidence}%</span>
                      </div>
                    )}
                  </div>
                )}

                {output.fix && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4" /> Suggested Fix
                    </h4>
                    <p className="text-gray-300 mb-3">{output.fix.description}</p>
                    {output.fix.code && (
                      <pre className="p-3 bg-dark-950 rounded-lg text-sm text-gray-400 overflow-x-auto border border-dark-800">
                        {output.fix.code}
                      </pre>
                    )}
                  </div>
                )}

                {output.tests && output.tests.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <TestTube className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                            Generated Tests ({output.tests.length})
                          </h4>
                          <p className="text-sm text-gray-500">Comprehensive test suite for your code</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const allTests = output.tests.map(t => `// ${t.name}\n${t.code}`).join('\n\n');
                          navigator.clipboard.writeText(allTests);
                          toast.success('All tests copied!');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition border border-green-500/30"
                      >
                        <Copy className="w-4 h-4" />
                        Copy All
                      </button>
                    </div>

                    {output.coverage && (
                      <div className="bg-dark-800/50 rounded-2xl border border-dark-700 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-white font-medium">Coverage Estimation</h5>
                          <span className="text-2xl font-bold text-green-400">{output.coverage.estimatedCoverage || 0}%</span>
                        </div>
                        <div className="w-full bg-dark-700 rounded-full h-3 mb-4">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                            style={{ width: `${output.coverage.estimatedCoverage || 0}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {[
                            { label: 'Unit Tests', value: output.coverage.unitTests, icon: '🔬', color: 'blue' },
                            { label: 'Integration', value: output.coverage.integrationTests, icon: '🔗', color: 'purple' },
                            { label: 'E2E Tests', value: output.coverage.e2eTests, icon: '🌐', color: 'green' },
                            { label: 'Edge Cases', value: output.coverage.edgeCaseTests, icon: '⚡', color: 'yellow' },
                            { label: 'Security', value: output.coverage.securityTests, icon: '🔒', color: 'red' }
                          ].map((item, idx) => (
                            <div key={idx} className="text-center p-3 bg-dark-900 rounded-xl border border-dark-600">
                              <div className="text-lg">{item.icon}</div>
                              <div className={clsx('text-lg font-bold', `text-${item.color}-400`)}>{item.value || 0}</div>
                              <div className="text-xs text-gray-500">{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {output.tests.map((test, idx) => (
                        <div key={idx} className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
                          <div className="p-4 flex items-start justify-between bg-dark-800/80">
                            <div className="flex items-center gap-3">
                              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-sm', {
                                'bg-blue-500/20 text-blue-400': test.type === 'unit',
                                'bg-purple-500/20 text-purple-400': test.type === 'integration',
                                'bg-green-500/20 text-green-400': test.type === 'e2e',
                                'bg-yellow-500/20 text-yellow-400': test.type === 'edge',
                                'bg-red-500/20 text-red-400': test.type === 'security',
                              })}>
                                {test.type === 'unit' ? '🔬' : test.type === 'integration' ? '🔗' : test.type === 'e2e' ? '🌐' : test.type === 'edge' ? '⚡' : test.type === 'security' ? '🔒' : '📝'}
                              </div>
                              <div>
                                <span className="font-semibold text-white">{test.name}</span>
                                <span className="ml-2 text-xs px-2 py-0.5 bg-dark-700 text-gray-400 rounded-full capitalize">{test.type}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(test.code);
                                toast.success('Test copied!');
                              }}
                              className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition"
                              title="Copy test"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          {test.description && (
                            <div className="px-4 pb-3">
                              <p className="text-sm text-gray-400">{test.description}</p>
                            </div>
                          )}
                          {test.scenario && (
                            <div className="px-4 pb-3">
                              <span className="text-xs text-gray-500 bg-dark-700 px-2 py-1 rounded">Scenario: {test.scenario}</span>
                            </div>
                          )}
                          <div className="px-4 pb-4">
                            <pre className="p-4 bg-dark-950 rounded-xl text-sm text-gray-300 overflow-x-auto font-mono border border-dark-700">
                              {test.code}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(output.setupInstructions || output.runInstructions) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {output.setupInstructions && (
                          <div className="p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <h5 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                                <Code className="w-4 h-4" />
                              </div>
                              Setup Instructions
                            </h5>
                            <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">{output.setupInstructions}</pre>
                          </div>
                        )}
                        {output.runInstructions && (
                          <div className="p-5 bg-green-500/10 rounded-2xl border border-green-500/20">
                            <h5 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                                <Terminal className="w-4 h-4" />
                              </div>
                              Run Tests
                            </h5>
                            <pre className="text-sm text-gray-300 overflow-x-auto">{output.runInstructions}</pre>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-400">Tests generated successfully! Copy the test code to your project and run them using your testing framework.</p>
                      </div>
                    </div>
                  </div>
                )}

                {output.complexity && (
                  <div className="p-4 bg-dark-800 rounded-xl border border-dark-700">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-400" /> Complexity Analysis
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Time Complexity</span>
                        <p className="text-xl font-mono text-violet-400">{output.complexity.time}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Space Complexity</span>
                        <p className="text-xl font-mono text-violet-400">{output.complexity.space}</p>
                      </div>
                    </div>
                  </div>
                )}

                {output.improvements && output.improvements.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" /> Suggestions
                    </h4>
                    <div className="space-y-3">
                      {output.improvements.map((imp, idx) => (
                        <div key={idx} className="p-4 bg-dark-800 rounded-xl border border-dark-700">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-violet-400">{imp.type}</span>
                            {imp.line && <span className="text-xs text-gray-500">Line {imp.line}</span>}
                          </div>
                          <p className="text-gray-300 mb-2">{imp.description}</p>
                          {imp.code && (
                            <pre className="p-2 bg-dark-950 rounded-lg text-sm text-gray-400 overflow-x-auto">
                              {imp.code}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mode === 'repo-review' && output.summary && typeof output.summary === 'object' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl p-4 text-center border border-violet-500/30">
                        <div className="text-3xl font-bold text-white">{output.summary.overallScore || 0}</div>
                        <div className="text-xs text-gray-400 mt-1">Overall Score</div>
                      </div>
                      <div className="bg-red-500/10 rounded-xl p-4 text-center border border-red-500/30">
                        <div className="text-3xl font-bold text-red-400">{output.summary.criticalIssues || 0}</div>
                        <div className="text-xs text-gray-400 mt-1">Critical</div>
                      </div>
                      <div className="bg-orange-500/10 rounded-xl p-4 text-center border border-orange-500/30">
                        <div className="text-3xl font-bold text-orange-400">{output.summary.highIssues || 0}</div>
                        <div className="text-xs text-gray-400 mt-1">High</div>
                      </div>
                      <div className="bg-yellow-500/10 rounded-xl p-4 text-center border border-yellow-500/30">
                        <div className="text-3xl font-bold text-yellow-400">{output.summary.mediumIssues || 0}</div>
                        <div className="text-xs text-gray-400 mt-1">Medium</div>
                      </div>
                      <div className="bg-blue-500/10 rounded-xl p-4 text-center border border-blue-500/30">
                        <div className="text-3xl font-bold text-blue-400">{output.summary.lowIssues || 0}</div>
                        <div className="text-xs text-gray-400 mt-1">Low</div>
                      </div>
                    </div>

                    {output.security && (
                      <div className="bg-dark-800/80 rounded-2xl border border-dark-700 overflow-hidden">
                        <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                              <Shield className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">Security Analysis</h4>
                              <p className="text-xs text-gray-500">OWASP Top 10, Injection, Auth & more</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold" style={{ color: output.security.score >= 80 ? '#34d399' : output.security.score >= 60 ? '#fbbf24' : '#f87171' }}>
                              {output.security.score || 0}%
                            </div>
                            <div className="text-xs text-gray-500">Security Score</div>
                          </div>
                        </div>
                        {output.security.vulnerabilities?.length > 0 ? (
                          <div className="divide-y divide-dark-700">
                            {output.security.vulnerabilities.map((vuln, idx) => (
                              <div key={idx} className={clsx('p-4', getSeverityColor(vuln.severity))}>
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm font-semibold uppercase">{vuln.type || vuln.category}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {vuln.cwe && <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">CWE-{vuln.cwe}</span>}
                                    {vuln.owasp && <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">OWASP A{vuln.owasp}</span>}
                                    <span className="text-xs px-2 py-1 rounded-full bg-dark-700 text-gray-400">{vuln.severity}</span>
                                  </div>
                                </div>
                                <p className="text-gray-300 text-sm mb-2">{vuln.description}</p>
                                {vuln.file && <p className="text-xs text-gray-500 mb-2">📁 {vuln.file}{vuln.line ? `:${vuln.line}` : ''}</p>}
                                {vuln.fix && (
                                  <div className="mt-2 p-3 bg-dark-950 rounded-lg">
                                    <div className="flex items-center gap-1 text-xs text-green-400 mb-1">💡 Fix</div>
                                    <span className="text-sm text-gray-400">{vuln.fix}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                            <p className="text-green-400 font-medium">No Security Vulnerabilities Detected</p>
                            <p className="text-gray-500 text-sm mt-1">Your code passed all security checks</p>
                          </div>
                        )}
                      </div>
                    )}

                    {output.secrets && output.secrets.length > 0 && (
                      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/30 overflow-hidden">
                        <div className="p-4 border-b border-orange-500/30 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                              <Lock className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">🔐 Secret Detection</h4>
                              <p className="text-xs text-gray-500">Exposed API keys, tokens, passwords, credentials</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-red-400">{output.secrets.length}</div>
                            <div className="text-xs text-gray-500">Secrets Found</div>
                          </div>
                        </div>
                        <div className="divide-y divide-orange-500/20">
                          {output.secrets.map((secret, idx) => (
                            <div key={idx} className="p-4 bg-orange-500/5">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                  </div>
                                  <div>
                                    <span className="text-sm font-semibold text-red-400">{secret.type}</span>
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">CRITICAL</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm mb-2">{secret.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {secret.file && <span>📁 {secret.file}{secret.line ? `:${secret.line}` : ''}</span>}
                                {secret.value && <span className="font-mono bg-dark-800 px-2 py-0.5 rounded">{secret.value}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 bg-red-500/10 border-t border-red-500/20">
                          <p className="text-xs text-red-400">⚠️ Immediately rotate these secrets and remove them from your codebase!</p>
                        </div>
                      </div>
                    )}

                    {output.dependencies && (
                      <div className="bg-purple-500/10 rounded-2xl border border-purple-500/30 overflow-hidden">
                        <div className="p-4 border-b border-purple-500/30 flex items-center gap-3">
                          <Package className="w-5 h-5 text-purple-400" />
                          <div>
                            <h4 className="text-white font-semibold">Dependency Analysis</h4>
                            <p className="text-xs text-gray-500">Outdated & vulnerable packages</p>
                          </div>
                        </div>
                        {output.dependencies.vulnerable?.length > 0 ? (
                          <div className="divide-y divide-purple-500/30">
                            {output.dependencies.vulnerable.map((dep, idx) => (
                              <div key={idx} className="p-4 flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-semibold text-white">{dep.name}</span>
                                  <p className="text-xs text-gray-500">v{dep.currentVersion}</p>
                                </div>
                                <div className="text-right">
                                  {dep.severity && <span className={clsx('text-xs px-2 py-1 rounded', dep.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400')}>{dep.severity}</span>}
                                  {dep.fixedVersion && <p className="text-xs text-gray-500 mt-1">Update to v{dep.fixedVersion}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <p className="text-green-400">All dependencies are secure</p>
                          </div>
                        )}
                      </div>
                    )}

                    {output.codeQuality && (
                      <div className="bg-dark-800/80 rounded-2xl border border-dark-700 p-4">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-400" /> Code Quality
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-dark-900 rounded-xl">
                            <div className="text-xl font-bold text-blue-400">{output.codeQuality.issues?.length || 0}</div>
                            <div className="text-xs text-gray-500">Issues Found</div>
                          </div>
                          <div className="text-center p-3 bg-dark-900 rounded-xl">
                            <div className="text-xl font-bold text-yellow-400">{output.codeQuality.complexity || 'N/A'}</div>
                            <div className="text-xs text-gray-500">Complexity</div>
                          </div>
                          <div className="text-center p-3 bg-dark-900 rounded-xl">
                            <div className="text-xl font-bold text-green-400">{output.codeQuality.maintainability || 'N/A'}</div>
                            <div className="text-xs text-gray-500">Maintainability</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {output.bestPractices && (
                      <div className="bg-green-500/10 rounded-2xl border border-green-500/30 p-4">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-400" /> Best Practices
                        </h4>
                        {output.bestPractices.violations?.length > 0 ? (
                          <div className="space-y-3">
                            {output.bestPractices.violations.slice(0, 5).map((violation, idx) => (
                              <div key={idx} className="p-3 bg-dark-900 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-white">{violation.practice}</span>
                                  <span className="text-xs text-gray-500">{violation.severity}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{violation.description}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-green-400 text-center py-2">✓ Following best practices</p>
                        )}
                      </div>
                    )}

                    {output.performance && (
                      <div className="bg-yellow-500/10 rounded-2xl border border-yellow-500/30 p-4">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-yellow-400" /> Performance Analysis
                        </h4>
                        {output.performance.bottlenecks?.length > 0 ? (
                          <div className="space-y-3">
                            {output.performance.bottlenecks.map((bottle, idx) => (
                              <div key={idx} className="p-3 bg-dark-900 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-white">{bottle.type}</span>
                                  <span className="text-xs text-gray-500">{bottle.severity}</span>
                                </div>
                                <p className="text-xs text-gray-400">{bottle.description}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-yellow-400 text-center py-2">✓ No performance issues detected</p>
                        )}
                      </div>
                    )}

                    {output.actionItems && output.actionItems.length > 0 && (
                      <div className="bg-dark-800/80 rounded-2xl border border-dark-700 p-4">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-400" /> Action Items
                        </h4>
                        <div className="space-y-2">
                          {output.actionItems.map((item, idx) => (
                            <div key={idx} className={clsx('p-3 rounded-lg border', {
                              'bg-red-500/10 border-red-500/30': item.priority === 'critical',
                              'bg-orange-500/10 border-orange-500/30': item.priority === 'high',
                              'bg-yellow-500/10 border-yellow-500/30': item.priority === 'medium',
                              'bg-blue-500/10 border-blue-500/30': item.priority === 'low',
                            })}>
                              <div className="flex items-start gap-3">
                                <span className={clsx('text-xs font-semibold px-2 py-1 rounded', {
                                  'bg-red-500/20 text-red-400': item.priority === 'critical',
                                  'bg-orange-500/20 text-orange-400': item.priority === 'high',
                                  'bg-yellow-500/20 text-yellow-400': item.priority === 'medium',
                                  'bg-blue-500/20 text-blue-400': item.priority === 'low',
                                })}>
                                  {item.priority}
                                </span>
                                <p className="text-sm text-gray-300 flex-1">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
