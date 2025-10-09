'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) {
      setThemeMode(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeMode(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const lightTheme = {
    token: {
      colorPrimary: '#1890ff',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#1890ff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: 14,
      borderRadius: 6,
      colorBgContainer: '#ffffff',
      colorBgLayout: '#f0f2f5',
      colorText: 'rgba(0, 0, 0, 0.88)',
      colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    },
    components: {
      Layout: {
        headerBg: '#ffffff',
        headerHeight: 64,
        siderBg: '#001529',
        bodyBg: '#f0f2f5',
      },
      Menu: {
        darkItemBg: '#001529',
        darkItemSelectedBg: '#1890ff',
        darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
      },
      Card: {
        borderRadiusLG: 8,
      },
    },
  };

  const darkTheme = {
    token: {
      colorPrimary: '#1890ff',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#1890ff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: 14,
      borderRadius: 6,
      colorBgContainer: '#1f1f1f',
      colorBgLayout: '#141414',
      colorBgElevated: '#262626',
      colorText: 'rgba(255, 255, 255, 0.85)',
      colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
      colorBorder: '#434343',
      colorBorderSecondary: '#303030',
    },
    components: {
      Layout: {
        headerBg: '#1f1f1f',
        headerHeight: 64,
        siderBg: '#000000',
        bodyBg: '#141414',
      },
      Menu: {
        darkItemBg: '#000000',
        darkItemSelectedBg: '#1890ff',
        darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
      },
      Card: {
        borderRadiusLG: 8,
        colorBgContainer: '#1f1f1f',
        colorBorderSecondary: '#303030',
      },
      Table: {
        colorBgContainer: '#1f1f1f',
        headerBg: '#262626',
      },
      Select: {
        colorBgContainer: '#1f1f1f',
      },
      Input: {
        colorBgContainer: '#1f1f1f',
      },
    },
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <ConfigProvider
        theme={{
          ...(themeMode === 'dark' ? darkTheme : lightTheme),
          algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

