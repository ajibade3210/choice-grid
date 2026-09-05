import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import api from './api/axios';
import TopBar from './components/TopBar';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './components/Auth';
import ChoiceGridPage from './pages/ChoiceGridPage';
import {
  TOKEN_KEY,
  THEME_KEY,
  SOUND_KEY,
  getStoredTheme,
  setStoredTheme,
  getStoredMute,
  setStoredMute,
} from './utils/storage';
import { preloadWinSound } from './utils/soundHelper';

import ErrorBoundary from './components/ErrorBoundary';

export const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY));
  const [theme, setTheme] = useState(getStoredTheme);
  const [isMuted, setIsMuted] = useState(getStoredMute);

  // Preload win chime on app mount
  useEffect(() => {
    preloadWinSound();
  }, []);

  // Sync theme class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setStoredTheme(theme);
  }, [theme]);

  // Check auth session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setUser(null);
      setIsAuthLoading(false);
      return;
    }

    let isMounted = true;
    api
      .get('/api/auth/me')
      .then((res) => {
        if (isMounted) {
          setUser(res.data);
          setIsAuthLoading(false);
        }
      })
      .catch((err) => {
        console.error('[Auth] Token validation failed:', err.response?.data?.error || err.message);
        if (isMounted) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
          setIsAuthLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      setStoredMute(next);
      return next;
    });
  };

  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    setIsAuthLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
          <TopBar
            user={user}
            onLogout={handleLogout}
            theme={theme}
            toggleTheme={toggleTheme}
            isMuted={isMuted}
            toggleMute={toggleMute}
          />

          <main>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute isAuthLoading={isAuthLoading} user={user}>
                    <ChoiceGridPage user={user} theme={theme} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login"
                element={
                  user ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Auth mode="login" onAuthSuccess={handleAuthSuccess} />
                  )
                }
              />
              <Route
                path="/register"
                element={
                  user ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Auth mode="register" onAuthSuccess={handleAuthSuccess} />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: theme === 'dark' ? '#18181b' : '#ffffff',
                color: theme === 'dark' ? '#f4f4f5' : '#09090b',
                border: `1px solid ${theme === 'dark' ? '#27272a' : '#e4e4e7'}`,
                borderRadius: '12px',
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
