import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Volume2, VolumeX, LogOut, CheckSquare } from 'lucide-react';

export const TopBar = ({ user, onLogout, theme, toggleTheme, isMuted, toggleMute }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
    }
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
            <img src="/logo.png" alt="Choice Grid Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold tracking-tight text-lg text-zinc-900 dark:text-zinc-100">
            CHOICE GRID
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Auth Info */}
          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleLogoutClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800"
                title="Sign out of your account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout {user.name || user.email?.split('@')[0]}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
