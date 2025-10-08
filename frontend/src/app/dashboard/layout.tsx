'use client'

import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Badge } from 'antd'
import {
  DashboardOutlined,
  DesktopOutlined,
  AlertOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import ProtectedRoute from '@/components/ProtectedRoute'

const { Header, Sider, Content } = Layout
const { Text } = Typography

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => router.push('/dashboard'),
    },
    {
      key: '/dashboard/devices',
      icon: <DesktopOutlined />,
      label: 'Devices',
      onClick: () => router.push('/dashboard/devices'),
    },
    {
      key: '/dashboard/alerts',
      icon: <AlertOutlined />,
      label: 'Alerts',
      onClick: () => router.push('/dashboard/alerts'),
    },
    {
      key: '/dashboard/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
      onClick: () => router.push('/dashboard/reports'),
    },
    {
      key: '/dashboard/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => router.push('/dashboard/settings'),
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => router.push('/dashboard/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => router.push('/dashboard/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
      danger: true,
    },
  ]

  return (
    <ProtectedRoute>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={setCollapsed}
          theme="dark"
          width={250}
        >
          <div style={{ 
            height: 64, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <ThunderboltOutlined style={{ fontSize: 28, color: '#1890ff', marginRight: collapsed ? 0 : 8 }} />
            {!collapsed && (
              <Text strong style={{ color: '#fff', fontSize: 18 }}>
                NinjaIT
              </Text>
            )}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            style={{ borderRight: 0 }}
          />
        </Sider>

        <Layout>
          <Header style={{ 
            background: '#fff', 
            padding: '0 24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {collapsed ? <MenuUnfoldOutlined 
                onClick={() => setCollapsed(false)}
                style={{ fontSize: 18, cursor: 'pointer' }}
              /> : <MenuFoldOutlined 
                onClick={() => setCollapsed(true)}
                style={{ fontSize: 18, cursor: 'pointer' }}
              />}
            </div>

            <Space size="large">
              <Badge count={5} size="small">
                <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
              </Badge>

              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                  <div style={{ display: collapsed ? 'none' : 'block' }}>
                    <div><Text strong>{user?.fullName}</Text></div>
                    <div><Text type="secondary" style={{ fontSize: 12 }}>{user?.role}</Text></div>
                  </div>
                </Space>
              </Dropdown>
            </Space>
          </Header>

          <Content style={{ 
            margin: '24px', 
            padding: 24, 
            background: '#fff', 
            borderRadius: 8,
            minHeight: 280,
          }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </ProtectedRoute>
  )
}

