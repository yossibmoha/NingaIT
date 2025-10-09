'use client'

import { useState } from 'react'
import { Layout, Menu, Typography, Space, Badge, Button, Tooltip } from 'antd'
import {
  DashboardOutlined,
  DesktopOutlined,
  AlertOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  BulbFilled,
  TeamOutlined,
  ToolOutlined,
  AppstoreOutlined,
  ApiOutlined,
  BookOutlined,
  FileTextOutlined,
  DollarOutlined,
  GiftOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import ProtectedRoute from '@/components/ProtectedRoute'
import UserProfileDropdown from '@/components/layout/UserProfileDropdown'
import { useTheme } from '@/context/ThemeContext'

const { Header, Sider, Content } = Layout
const { Text } = Typography

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuthStore()
  const { themeMode, toggleTheme } = useTheme()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => router.push('/dashboard'),
    },
    {
      key: '/dashboard/tickets',
      icon: <BarChartOutlined />,
      label: 'Tickets',
      onClick: () => router.push('/dashboard/tickets'),
    },
    {
      key: '/dashboard/customers',
      icon: <TeamOutlined />,
      label: 'Customers',
      onClick: () => router.push('/dashboard/customers'),
    },
    {
      key: '/dashboard/devices',
      icon: <DesktopOutlined />,
      label: (
        <span>
          Devices
          <span style={{ 
            float: 'right', 
            marginLeft: 8, 
            color: '#8c8c8c', 
            fontSize: 12 
          }}>
            1/300
          </span>
        </span>
      ),
      onClick: () => router.push('/dashboard/devices'),
    },
    {
      key: '/dashboard/alerts',
      icon: <AlertOutlined />,
      label: 'Alerts',
      onClick: () => router.push('/dashboard/alerts'),
    },
    {
      key: '/dashboard/patch-management',
      icon: <ToolOutlined />,
      label: 'Patch Management',
      onClick: () => router.push('/dashboard/patch-management'),
    },
    {
      key: '/dashboard/app-center',
      icon: <AppstoreOutlined />,
      label: 'App Center',
      onClick: () => router.push('/dashboard/app-center'),
    },
    {
      key: '/dashboard/network-discovery',
      icon: <ApiOutlined />,
      label: 'Network Discovery',
      onClick: () => router.push('/dashboard/network-discovery'),
    },
    {
      key: '/dashboard/knowledge-base',
      icon: <BookOutlined />,
      label: 'Knowledge Base',
      onClick: () => router.push('/dashboard/knowledge-base'),
    },
    {
      key: 'reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
      children: [
        {
          key: 'operational-reports',
          label: 'Operational reports',
          type: 'group',
        },
        {
          key: '/dashboard/reports/general',
          label: 'General',
          onClick: () => router.push('/dashboard/reports/general'),
        },
        {
          key: '/dashboard/reports/monitoring',
          label: 'Monitoring',
          onClick: () => router.push('/dashboard/reports/monitoring'),
        },
        {
          key: '/dashboard/reports/technicians',
          label: 'Technicians',
          onClick: () => router.push('/dashboard/reports/technicians'),
        },
        {
          key: '/dashboard/reports/profitability',
          label: 'Profitability',
          onClick: () => router.push('/dashboard/reports/profitability'),
        },
        {
          key: '/dashboard/reports/satisfaction',
          label: 'Satisfaction',
          onClick: () => router.push('/dashboard/reports/satisfaction'),
        },
        {
          key: 'analytical-reports',
          label: 'Analytical reports',
          type: 'group',
        },
        {
          key: '/dashboard/reports/presets',
          label: 'Presets',
          onClick: () => router.push('/dashboard/reports/presets'),
        },
        {
          key: '/dashboard/reports/my-reports',
          label: 'My reports',
          onClick: () => router.push('/dashboard/reports/my-reports'),
        },
        {
          key: '/dashboard/reports/shared',
          label: 'Shared reports',
          onClick: () => router.push('/dashboard/reports/shared'),
        },
        {
          key: '/dashboard/reports/favorites',
          label: 'Favorites',
          onClick: () => router.push('/dashboard/reports/favorites'),
        },
      ],
    },
    {
      key: '/dashboard/billing',
      icon: <DollarOutlined />,
      label: 'Billing',
      onClick: () => router.push('/dashboard/billing'),
    },
    {
      key: '/dashboard/refer',
      icon: <GiftOutlined />,
      label: 'Refer a Friend',
      onClick: () => router.push('/dashboard/refer'),
    },
    {
      key: '/dashboard/ai-center',
      icon: <RobotOutlined />,
      label: (
        <span>
          AI Center
          <Badge 
            count="New" 
            style={{ 
              backgroundColor: '#52c41a', 
              marginLeft: 8,
              fontSize: 10,
              height: 18,
              lineHeight: '18px',
            }} 
          />
        </span>
      ),
      onClick: () => router.push('/dashboard/ai-center'),
    },
    {
      key: 'admin',
      icon: <SettingOutlined />,
      label: 'Admin',
      children: [
        {
          key: 'my-account-group',
          label: 'My account',
          type: 'group',
        },
        {
          key: '/dashboard/admin/account-settings',
          label: 'Account settings',
          onClick: () => router.push('/dashboard/admin/account-settings'),
        },
        {
          key: '/dashboard/admin/profile',
          label: 'My profile',
          onClick: () => router.push('/dashboard/admin/profile'),
        },
        {
          key: '/dashboard/admin/subscription',
          label: 'Subscription',
          onClick: () => router.push('/dashboard/admin/subscription'),
        },
        {
          key: 'users-security-group',
          label: 'Users and security',
          type: 'group',
        },
        {
          key: '/dashboard/admin/technicians',
          label: 'Technicians',
          onClick: () => router.push('/dashboard/admin/technicians'),
        },
        {
          key: '/dashboard/admin/technician-groups',
          label: 'Technician groups',
          onClick: () => router.push('/dashboard/admin/technician-groups'),
        },
        {
          key: '/dashboard/admin/access-roles',
          label: 'Access roles',
          onClick: () => router.push('/dashboard/admin/access-roles'),
        },
        {
          key: '/dashboard/admin/security',
          label: 'Security and authentication',
          onClick: () => router.push('/dashboard/admin/security'),
        },
        {
          key: '/dashboard/admin/audit-log',
          label: 'Audit log',
          onClick: () => router.push('/dashboard/admin/audit-log'),
        },
        {
          key: 'monitoring-group',
          label: 'Monitoring and alerting',
          type: 'group',
        },
        {
          key: '/dashboard/admin/patch-management',
          label: 'Patch management',
          onClick: () => router.push('/dashboard/admin/patch-management'),
        },
        {
          key: '/dashboard/admin/thresholds',
          label: 'Thresholds',
          onClick: () => router.push('/dashboard/admin/thresholds'),
        },
        {
          key: '/dashboard/admin/alert-settings',
          label: 'Alert settings',
          onClick: () => router.push('/dashboard/admin/alert-settings'),
        },
        {
          key: 'support-group',
          label: 'Support and ticketing',
          type: 'group',
        },
        {
          key: '/dashboard/admin/email-settings',
          label: 'Email settings',
          onClick: () => router.push('/dashboard/admin/email-settings'),
        },
        {
          key: '/dashboard/admin/ticket-settings',
          label: 'Ticket settings',
          onClick: () => router.push('/dashboard/admin/ticket-settings'),
        },
        {
          key: '/dashboard/admin',
          label: 'All Settings →',
          onClick: () => router.push('/dashboard/admin'),
        },
      ],
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
            selectedKeys={pathname ? [pathname] : []}
            items={menuItems}
            style={{ borderRight: 0 }}
          />
        </Sider>

        <Layout>
          <Header style={{ 
            padding: '0 24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            boxShadow: themeMode === 'dark' 
              ? '0 2px 8px rgba(255,255,255,0.06)' 
              : '0 2px 8px rgba(0,0,0,0.06)'
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
              <Tooltip title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                <Button 
                  type="text" 
                  icon={themeMode === 'dark' ? <BulbFilled style={{ color: '#faad14' }} /> : <BulbOutlined />} 
                  onClick={toggleTheme}
                  size="large"
                />
              </Tooltip>

              <Badge count={5} size="small">
                <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
              </Badge>

              <UserProfileDropdown 
                user={{
                  name: user?.fullName || 'yossefb yossefb',
                  email: user?.email || 'admin@ninjait.com',
                  role: user?.role || 'Administrator',
                }}
              />
            </Space>
          </Header>

          <Content style={{ 
            margin: '24px', 
            padding: 24, 
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

