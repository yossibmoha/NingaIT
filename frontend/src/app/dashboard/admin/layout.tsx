'use client';

import { Layout, Menu } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import {
  UserOutlined,
  SettingOutlined,
  IdcardOutlined,
  CreditCardOutlined,
  TeamOutlined,
  SafetyOutlined,
  AuditOutlined,
  ApiOutlined,
  BellOutlined,
  ToolOutlined,
  CodeOutlined,
  DashboardOutlined,
  MailOutlined,
  MessageOutlined,
  FormOutlined,
  QuestionCircleOutlined,
  CustomerServiceOutlined,
  TagOutlined,
  BookOutlined,
  FolderOutlined,
  DatabaseOutlined,
  CloudOutlined,
  FileTextOutlined,
  ShopOutlined,
  ClockOutlined,
  DollarOutlined,
  FileProtectOutlined,
  MonitorOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: 'my-account',
      label: 'My account',
      icon: <UserOutlined />,
      children: [
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
      ],
    },
    {
      key: 'users-security',
      label: 'Users and security',
      icon: <TeamOutlined />,
      children: [
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
      ],
    },
    {
      key: 'monitoring-alerting',
      label: 'Monitoring and alerting',
      icon: <MonitorOutlined />,
      children: [
        {
          key: '/dashboard/admin/patch-management',
          label: 'Patch management and IT automation',
          onClick: () => router.push('/dashboard/admin/patch-management'),
        },
        {
          key: '/dashboard/admin/configuration-policies',
          label: 'Configuration policies',
          onClick: () => router.push('/dashboard/admin/configuration-policies'),
        },
        {
          key: '/dashboard/admin/scripts',
          label: 'Scripts',
          onClick: () => router.push('/dashboard/admin/scripts'),
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
          key: '/dashboard/admin/snmp-templates',
          label: 'SNMP templates',
          onClick: () => router.push('/dashboard/admin/snmp-templates'),
        },
        {
          key: '/dashboard/admin/software-management',
          label: 'Software management',
          onClick: () => router.push('/dashboard/admin/software-management'),
        },
        {
          key: '/dashboard/admin/network-discovery',
          label: 'Network Discovery alerts',
          onClick: () => router.push('/dashboard/admin/network-discovery'),
        },
        {
          key: '/dashboard/admin/remote-access',
          label: 'Remote access settings',
          onClick: () => router.push('/dashboard/admin/remote-access'),
        },
      ],
    },
    {
      key: 'support-ticketing',
      label: 'Support and ticketing',
      icon: <CustomerServiceOutlined />,
      children: [
        {
          key: '/dashboard/admin/email-settings',
          label: 'Email settings',
          onClick: () => router.push('/dashboard/admin/email-settings'),
        },
        {
          key: '/dashboard/admin/ticket-automation',
          label: 'Ticket automation rules',
          onClick: () => router.push('/dashboard/admin/ticket-automation'),
        },
        {
          key: '/dashboard/admin/ticket-settings',
          label: 'Ticket settings',
          onClick: () => router.push('/dashboard/admin/ticket-settings'),
        },
        {
          key: '/dashboard/admin/ticket-forms',
          label: 'Ticket forms',
          onClick: () => router.push('/dashboard/admin/ticket-forms'),
        },
        {
          key: '/dashboard/admin/email-templates',
          label: 'Email templates',
          onClick: () => router.push('/dashboard/admin/email-templates'),
        },
        {
          key: '/dashboard/admin/quick-reply',
          label: 'Quick Reply templates',
          onClick: () => router.push('/dashboard/admin/quick-reply'),
        },
        {
          key: '/dashboard/admin/calendar-integration',
          label: 'Calendar integration',
          onClick: () => router.push('/dashboard/admin/calendar-integration'),
        },
      ],
    },
    {
      key: 'customer-service',
      label: 'Customer service',
      icon: <CustomerServiceOutlined />,
      children: [
        {
          key: '/dashboard/admin/customer-portal',
          label: 'Customer Portal',
          onClick: () => router.push('/dashboard/admin/customer-portal'),
        },
        {
          key: '/dashboard/admin/white-label',
          label: 'White label',
          onClick: () => router.push('/dashboard/admin/white-label'),
        },
        {
          key: '/dashboard/admin/knowledge-base',
          label: 'Knowledge base',
          onClick: () => router.push('/dashboard/admin/knowledge-base'),
        },
      ],
    },
    {
      key: 'data-management',
      label: 'Data management',
      icon: <DatabaseOutlined />,
      children: [
        {
          key: '/dashboard/admin/custom-fields',
          label: 'Custom fields',
          onClick: () => router.push('/dashboard/admin/custom-fields'),
        },
        {
          key: '/dashboard/admin/custom-assets',
          label: 'Custom assets',
          onClick: () => router.push('/dashboard/admin/custom-assets'),
        },
        {
          key: '/dashboard/admin/api',
          label: 'API',
          onClick: () => router.push('/dashboard/admin/api'),
        },
        {
          key: '/dashboard/admin/import-data',
          label: 'Import data',
          onClick: () => router.push('/dashboard/admin/import-data'),
        },
        {
          key: '/dashboard/admin/integrations',
          label: 'Integrations',
          onClick: () => router.push('/dashboard/admin/integrations'),
        },
      ],
    },
    {
      key: 'business-admin',
      label: 'Business administration',
      icon: <ShopOutlined />,
      children: [
        {
          key: '/dashboard/admin/contracts',
          label: 'Contracts',
          onClick: () => router.push('/dashboard/admin/contracts'),
        },
        {
          key: '/dashboard/admin/sla',
          label: 'Service Level Agreements (SLAs)',
          onClick: () => router.push('/dashboard/admin/sla'),
        },
        {
          key: '/dashboard/admin/business-hours',
          label: 'Business hours',
          onClick: () => router.push('/dashboard/admin/business-hours'),
        },
        {
          key: '/dashboard/admin/accounting',
          label: 'Accounting',
          onClick: () => router.push('/dashboard/admin/accounting'),
        },
        {
          key: '/dashboard/admin/products-expenses',
          label: 'Products and expenses',
          onClick: () => router.push('/dashboard/admin/products-expenses'),
        },
        {
          key: '/dashboard/admin/contract-rates',
          label: 'Contract rates',
          onClick: () => router.push('/dashboard/admin/contract-rates'),
        },
        {
          key: '/dashboard/admin/contract-expiration',
          label: 'Contract expiration',
          onClick: () => router.push('/dashboard/admin/contract-expiration'),
        },
        {
          key: '/dashboard/admin/taxes',
          label: 'Taxes',
          onClick: () => router.push('/dashboard/admin/taxes'),
        },
      ],
    },
    {
      key: 'app-center',
      label: 'App Center settings',
      icon: <AppstoreOutlined />,
      onClick: () => router.push('/dashboard/admin/app-center-settings'),
    },
  ];

  return (
    <Layout style={{ minHeight: 'calc(100vh - 112px)' }}>
      <Sider
        width={280}
        style={{
          overflow: 'auto',
          height: 'calc(100vh - 112px)',
          position: 'sticky',
          top: 88,
          left: 0,
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={pathname ? [pathname] : []}
          defaultOpenKeys={['my-account', 'users-security', 'monitoring-alerting']}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      <Content style={{ padding: '24px', minHeight: 280 }}>
        {children}
      </Content>
    </Layout>
  );
}

