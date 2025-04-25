// components/ThemeToggle.jsx
import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a theme preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      // If no saved preference, check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Update theme in localStorage and on document
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      <div className="relative w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors">
        <div
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white dark:bg-gray-300 transform transition-transform ${
            isDarkMode ? 'translate-x-6' : 'translate-x-0'
          }`}
        >
          {isDarkMode ? (
            <FiMoon className="w-4 h-4 text-gray-800" />
          ) : (
            <FiSun className="w-4 h-4 text-yellow-500" />
          )}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
