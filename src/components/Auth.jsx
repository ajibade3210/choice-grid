import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { TOKEN_KEY } from '../utils/storage';

export const Auth = ({ mode = 'login', onAuthSuccess }) => {
  const navigate = useNavigate();
  const isLogin = mode === 'login';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login validation
        if (!formData.email.trim()) {
          toast.error('Email is required.');
          setIsLoading(false);
          return;
        }
        if (!validateEmail(formData.email.trim())) {
          toast.error('Please enter a valid email address.');
          setIsLoading(false);
          return;
        }
        if (!formData.password) {
          toast.error('Password is required.');
          setIsLoading(false);
          return;
        }

        const res = await api.post('/api/auth/login', {
          email: formData.email.trim(),
          password: formData.password,
        });

        const { token, user } = res.data;
        localStorage.setItem(TOKEN_KEY, token);
        if (onAuthSuccess) onAuthSuccess(token, user);
        toast.success(`Welcome back, ${user.name}!`);
        navigate('/');
      } else {
        // Register validation
        if (!formData.name.trim()) {
          toast.error('Name is required.');
          setIsLoading(false);
          return;
        }
        if (!formData.email.trim()) {
          toast.error('Email is required.');
          setIsLoading(false);
          return;
        }
        if (!validateEmail(formData.email.trim())) {
          toast.error('Please enter a valid email address.');
          setIsLoading(false);
          return;
        }
        if (!formData.password) {
          toast.error('Password is required.');
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match.');
          setIsLoading(false);
          return;
        }

        const res = await api.post('/api/auth/register', {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });

        const { token, user } = res.data;
        localStorage.setItem(TOKEN_KEY, token);
        if (onAuthSuccess) onAuthSuccess(token, user);
        toast.success(`Account created! Welcome, ${user.name}!`);
        navigate('/');
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Authentication failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-provision demo account if not exists
  const handleFillDemo = async () => {
    setIsLoading(true);
    const demoPayload = {
      name: 'Builder Demo',
      email: 'demo@choicegrid.app',
      password: 'password123',
    };

    setFormData({
      name: demoPayload.name,
      email: demoPayload.email,
      password: demoPayload.password,
      confirmPassword: demoPayload.password,
    });

    try {
      // 1. Try login first
      let res;
      try {
        res = await api.post('/api/auth/login', {
          email: demoPayload.email,
          password: demoPayload.password,
        });
      } catch (loginErr) {
        // 2. If 401 or user not found, automatically register
        if (loginErr.response?.status === 401) {
          res = await api.post('/api/auth/register', demoPayload);
        } else {
          throw loginErr;
        }
      }

      const { token, user } = res.data;
      localStorage.setItem(TOKEN_KEY, token);
      if (onAuthSuccess) onAuthSuccess(token, user);
      toast.success(`Logged in as Demo User (${user.name})`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Demo login failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-white dark:bg-zinc-950 transition-colors">
      <div className="w-full max-w-md space-y-8 p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-800 mb-2">
            <img src="/logo.png" alt="Choice Grid Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {isLogin ? 'Sign in to Choice Grid' : 'Create your account'}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {isLogin
              ? 'Enter your credentials to access your habit tracking grid'
              : 'Start tracking your daily non-negotiable choices'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Helper */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleFillDemo}
            disabled={isLoading}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-4 disabled:opacity-50"
          >
            Fill demo credentials
          </button>

          {isLogin ? (
            <Link
              to="/register"
              className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline"
            >
              Need an account? Register
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline"
            >
              Already have an account? Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
