'use client';

import { useState } from 'react';
import { Avatar, Badge, Dropdown, Switch, Space, Typography, Divider } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  MobileOutlined,
  KeyOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

const { Text } = Typography;

interface UserProfileDropdownProps {
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export default function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const router = useRouter();
  const { themeMode, toggleTheme } = useTheme();
  const [isAvailable, setIsAvailable] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const dropdownContent = (
    <div style={{ 
      width: 320, 
      background: themeMode === 'dark' ? '#1f1f1f' : '#fff',
      borderRadius: 8,
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
    }}>
      {/* User Info Header */}
      <div style={{ padding: '16px 16px 12px' }}>
        <Space align="start" size={12}>
          <Badge dot status={isAvailable ? 'success' : 'default'} offset={[-5, 35]}>
            <Avatar 
              size={48} 
              style={{ 
                backgroundColor: '#1890ff',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'YY'}
            </Avatar>
          </Badge>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>
              {user?.name || 'yossefb yossefb'}
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {user?.role || 'Administrator'}
            </Text>
          </div>
        </Space>
      </div>

      {/* Availability Status */}
      <div style={{ 
        padding: '12px 16px',
        background: themeMode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
        }}>
          <Space>
            <BulbOutlined style={{ color: isAvailable ? '#52c41a' : '#8c8c8c' }} />
            <Text style={{ fontWeight: 500 }}>Available</Text>
          </Space>
          <Switch 
            checked={isAvailable} 
            onChange={setIsAvailable}
            size="small"
          />
        </div>
      </div>

      <Divider style={{ margin: 0 }} />

      {/* Menu Items */}
      <div style={{ padding: '8px 0' }}>
        <div 
          onClick={() => router.push('/dashboard/profile')}
          style={{ 
            padding: '10px 16px', 
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Space>
            <UserOutlined />
            <span>My profile</span>
          </Space>
        </div>

        <div 
          onClick={() => router.push('/dashboard/settings')}
          style={{ 
            padding: '10px 16px', 
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Space>
            <SettingOutlined />
            <span>General settings</span>
          </Space>
        </div>

        <div 
          style={{ 
            padding: '10px 16px', 
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Space>
            <KeyOutlined />
            <span>Grant access</span>
          </Space>
        </div>
      </div>

      <Divider style={{ margin: 0 }} />

      {/* Additional Options */}
      <div style={{ padding: '8px 0' }}>
        <div 
          style={{ 
            padding: '10px 16px', 
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Space>
            <MobileOutlined />
            <span>Download Mobile app</span>
          </Space>
        </div>

        <div 
          style={{ 
            padding: '10px 16px', 
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Space>
            <QuestionCircleOutlined />
            <span>Help and resources</span>
          </Space>
        </div>
      </div>

      <Divider style={{ margin: 0 }} />

      {/* Logout */}
      <div style={{ padding: '8px 0' }}>
        <div 
          onClick={handleLogout}
          style={{ 
            padding: '10px 16px', 
            cursor: 'pointer',
            color: '#ff4d4f',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Space>
            <LogoutOutlined />
            <span>Log out</span>
          </Space>
        </div>
      </div>
    </div>
  );

  return (
    <Dropdown 
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
    >
      <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <Badge dot status={isAvailable ? 'success' : 'default'} offset={[-5, 32]}>
          <Avatar 
            size={40}
            style={{ 
              backgroundColor: '#1890ff',
              fontSize: 16,
              fontWeight: 600,
              border: '2px solid rgba(24, 144, 255, 0.2)',
            }}
          >
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'YY'}
          </Avatar>
        </Badge>
      </div>
    </Dropdown>
  );
}

