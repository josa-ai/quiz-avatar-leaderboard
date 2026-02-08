import React, { useState } from 'react';
import { User } from '@/types/game';
import { loginUser } from '@/lib/gameService';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(email, password);
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        onLogin(result.data);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login for testing
  const handleDemoLogin = async () => {
    setEmail('demo@finalexam.com');
    setPassword('demo123');
    setIsLoading(true);
    setError('');

    try {
      // Try to login with demo account
      let result = await loginUser('demo@finalexam.com', 'demo123');
      
      if (result.error && result.error.includes('Invalid')) {
        // Demo account doesn't exist, create a mock user for demo
        const mockUser: User = {
          id: 'demo-' + Date.now(),
          username: 'DemoPlayer',
          email: 'demo@finalexam.com',
          avatar: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321802628_7025bef0.jpg',
          points: 1500,
          rank: 42,
          gamesPlayed: 15,
          wins: 8
        };
        onLogin(mockUser);
        return;
      }
      
      if (result.data) {
        onLogin(result.data);
      }
    } catch (err) {
      // Fallback to mock user for demo
      const mockUser: User = {
        id: 'demo-' + Date.now(),
        username: 'DemoPlayer',
        email: 'demo@finalexam.com',
        avatar: 'https://d64gsuwffb70l.cloudfront.net/6966729c3239b00ed852b93c_1768321802628_7025bef0.jpg',
        points: 1500,
        rank: 42,
        gamesPlayed: 15,
        wins: 8
      };
      onLogin(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
            FINAL EXAM
          </h1>
          <p className="text-slate-400">Sign in to continue your journey</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
          {/* Principal greeting */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-slate-700/50 rounded-xl">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400 flex-shrink-0">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/6829088702a251ce52390b4c_1768321680007_eefa5b93.jpg"
                alt="Principal"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-cyan-400 font-semibold text-sm">Principal Powers</p>
              <p className="text-white text-sm">"Ready to prove yourself? Let's see those credentials!"</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  placeholder="student@school.edu"
                />
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  placeholder="••••••••"
                />
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-600"></div>
            <span className="text-slate-400 text-sm">or</span>
            <div className="flex-1 h-px bg-slate-600"></div>
          </div>

          {/* Demo & Register buttons */}
          <div className="space-y-3">
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 disabled:opacity-50"
            >
              TRY DEMO MODE
            </button>
            
            <button
              onClick={onRegister}
              className="w-full py-4 bg-slate-700/50 border border-slate-600 rounded-xl font-bold text-white hover:bg-slate-700 hover:border-cyan-400/50 transition-all duration-300"
            >
              CREATE NEW ACCOUNT
            </button>
          </div>

          {/* Forgot password */}
          <p className="text-center mt-4">
            <button className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
              Forgot your password?
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
