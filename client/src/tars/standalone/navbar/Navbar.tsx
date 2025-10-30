import React, { useCallback, useEffect } from 'react';
import { ShareButton } from '../../standalone/share';
import { motion } from 'framer-motion';
import { FiMoon, FiSun } from 'react-icons/fi';
import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import { useLayout } from '../../common/hooks/useLayout';
import { useSession } from '../../common/hooks/useSession';
import { useReplayMode } from '../../common/hooks/useReplayMode';

import './Navbar.css';

export const Navbar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useLayout();
  const { activeSessionId, isProcessing, modelInfo } = useSession();
  const isReplayMode = useReplayMode();
  const [isDarkMode, setIsDarkMode] = React.useState(true); // Default to true, will update on mount

  // Initialize theme based on localStorage or document class
  useEffect(() => {
    // Get saved preference from localStorage
    const savedTheme = localStorage.getItem('agent-tars-theme');

    // Determine initial theme state (preference or document class)
    const initialIsDark =
      savedTheme === 'light'
        ? false
        : savedTheme === 'dark'
          ? true
          : document.documentElement.classList.contains('dark');

    // Update state with initial value
    setIsDarkMode(initialIsDark);

    // Ensure the document class matches the state
    document.documentElement.classList.toggle('dark', initialIsDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);

    // Save preference to localStorage
    localStorage.setItem('agent-tars-theme', newMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className="h-12 backdrop-blur-sm flex items-center px-3">
      {/* Left section with macOS-style traffic lights */}
      <div className="flex items-center">
        {/* macOS-style traffic lights */}
        <div className="flex space-x-1.5 mr-3">
          <div className="traffic-light traffic-light-red" />
          <div className="traffic-light traffic-light-yellow" />
          <div className="traffic-light traffic-light-green" />
        </div>
      </div>

      {/* Sidebar toggle button - positioned at the right edge aligned with Chat area */}
      {!isReplayMode && (
        <div className="ml-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1.5 hover:bg-gray-100/40 dark:hover:bg-gray-800/40 rounded-full transition-colors"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <GoSidebarCollapse size={20} /> : <GoSidebarExpand size={20} />}
          </motion.button>
        </div>
      )}

      {/* Center section - Model info */}
      <div className="flex-1 flex items-center justify-center">
        {modelInfo.model && (
          <div className="flex items-center gap-3">
            {/* Main model bubble */}
            <div className="px-2 py-1 rounded-full bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-400 dark:bg-purple-500 mr-2 flex-shrink-0"></div>
              <span className="font-mono">{modelInfo.model}</span>
            </div>

            {/* Provider bubble - connected to main bubble */}
            {modelInfo.provider && (
              <div className="px-2 py-1 -ml-1 rounded-full bg-white dark:bg-gray-800 text-xs font-[500]">
                <span className="provider-gradient-text">{modelInfo.provider}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right section - with share button and dark mode toggle */}
      <div className="flex items-center space-x-2">
        {activeSessionId && !isProcessing && !isReplayMode && <ShareButton variant="navbar" />}

        {/* Dark mode toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/40 dark:hover:bg-gray-800/40 transition-colors"
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {isDarkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
        </motion.button>
      </div>
    </div>
  );
};
