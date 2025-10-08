/**
 * Ant Design Theme Configuration
 * Modern, clean theme for NinjaIT
 */

import type { ThemeConfig } from 'antd'

export const theme: ThemeConfig = {
  token: {
    // Primary colors - Professional blue
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    
    // Typography
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Layout
    borderRadius: 6,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    
    // Spacing
    marginXS: 8,
    marginSM: 12,
    margin: 16,
    marginMD: 20,
    marginLG: 24,
    marginXL: 32,
    
    // Component specific
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      headerPadding: '0 24px',
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
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    },
    Button: {
      borderRadius: 6,
      controlHeight: 32,
      controlHeightLG: 40,
    },
    Input: {
      borderRadius: 6,
      controlHeight: 32,
      controlHeightLG: 40,
    },
    Table: {
      borderRadius: 8,
      headerBg: '#fafafa',
    },
  },
}

