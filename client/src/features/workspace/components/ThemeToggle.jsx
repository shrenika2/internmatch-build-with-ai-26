import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Check localStorage or system preference
    const stored = localStorage.getItem('theme') || 'dark';
    setTheme(stored);
    document.documentElement.classList.add(stored);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(next);
  };

  return (
    <button onClick={toggle} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Toggle Theme">
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;
