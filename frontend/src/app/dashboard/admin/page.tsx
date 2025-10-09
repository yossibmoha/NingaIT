'use client';

import { Card, Row, Col, Typography, Space, Badge } from 'antd';
import { useRouter } from 'next/navigation';
import {
  UserOutlined,
  TeamOutlined,
  MonitorOutlined,
  CustomerServiceOutlined,
  DatabaseOutlined,
  ShopOutlined,
  AppstoreOutlined,
  SafetyOutlined,
  AuditOutlined,
  ApiOutlined,
  BellOutlined,
  ToolOutlined,
  MailOutlined,
  QuestionCircleOutlined,
  TagOutlined,
  BookOutlined,
  FileTextOutlined,
  ClockOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  RightOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface SettingCard {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

export default function AdminPage() {
  const router = useRouter();

  const settingsSections: { title: string; cards: SettingCard[] }[] = [
    {
      title: 'My Account',
      cards: [
        {
          key: 'account-settings',
          title: 'Account Settings',
          description: 'Manage your account preferences and general settings',
          icon: <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
          path: '/dashboard/admin/account-settings',
        },
        {
          key: 'my-profile',
          title: 'My Profile',
          description: 'Update your personal information and profile picture',
          icon: <UserOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
          path: '/dashboard/admin/profile',
        },
        {
          key: 'subscription',
          title: 'Subscription',
          description: 'View and manage your subscription plan',
          icon: <FileTextOutlined style={{ fontSize: 24, color: '#faad14' }} />,
          path: '/dashboard/admin/subscription',
        },
      ],
    },
    {
      title: 'Users and Security',
      cards: [
        {
          key: 'technicians',
          title: 'Technicians',
          description: 'Manage technician accounts and permissions',
          icon: <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
          path: '/dashboard/admin/technicians',
          badge: '8',
        },
        {
          key: 'groups',
          title: 'Technician Groups',
          description: 'Organize technicians into groups',
          icon: <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
          path: '/dashboard/admin/technician-groups',
        },
        {
          key: 'roles',
          title: 'Access Roles',
          description: 'Define and manage access roles',
          icon: <SafetyOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
          path: '/dashboard/admin/access-roles',
        },
        {
          key: 'security',
          title: 'Security and Authentication',
          description: 'Configure security settings and 2FA',
          icon: <SafetyOutlined style={{ fontSize: 24, color: '#f5222d' }} />,
          path: '/dashboard/admin/security',
        },
        {
          key: 'audit',
          title: 'Audit Log',
          description: 'View system activity and changes',
          icon: <AuditOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />,
          path: '/dashboard/admin/audit-log',
        },
      ],
    },
    {
      title: 'Monitoring and Alerting',
      cards: [
        {
          key: 'patch-mgmt',
          title: 'Patch Management',
          description: 'Configure patch and IT automation policies',
          icon: <ToolOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
          path: '/dashboard/admin/patch-management',
        },
        {
          key: 'config-policies',
          title: 'Configuration Policies',
          description: 'Define system configuration policies',
          icon: <ToolOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
          path: '/dashboard/admin/configuration-policies',
        },
        {
          key: 'scripts',
          title: 'Scripts',
          description: 'Manage automation scripts',
          icon: <ApiOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
          path: '/dashboard/admin/scripts',
        },
        {
          key: 'thresholds',
          title: 'Thresholds',
          description: 'Set monitoring thresholds and limits',
          icon: <MonitorOutlined style={{ fontSize: 24, color: '#faad14' }} />,
          path: '/dashboard/admin/thresholds',
        },
        {
          key: 'alert-settings',
          title: 'Alert Settings',
          description: 'Configure alert rules and notifications',
          icon: <BellOutlined style={{ fontSize: 24, color: '#f5222d' }} />,
          path: '/dashboard/admin/alert-settings',
        },
      ],
    },
    {
      title: 'Support and Ticketing',
      cards: [
        {
          key: 'email-settings',
          title: 'Email Settings',
          description: 'Configure email server and settings',
          icon: <MailOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
          path: '/dashboard/admin/email-settings',
        },
        {
          key: 'ticket-automation',
          title: 'Ticket Automation',
          description: 'Set up ticket automation rules',
          icon: <ApiOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
          path: '/dashboard/admin/ticket-automation',
        },
        {
          key: 'ticket-settings',
          title: 'Ticket Settings',
          description: 'Configure ticket categories and priorities',
          icon: <TagOutlined style={{ fontSize: 24, color: '#faad14' }} />,
          path: '/dashboard/admin/ticket-settings',
        },
        {
          key: 'email-templates',
          title: 'Email Templates',
          description: 'Manage email templates',
          icon: <MailOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
          path: '/dashboard/admin/email-templates',
        },
      ],
    },
    {
      title: 'Customer Service',
      cards: [
        {
          key: 'customer-portal',
          title: 'Customer Portal',
          description: 'Configure customer portal settings',
          icon: <CustomerServiceOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
          path: '/dashboard/admin/customer-portal',
        },
        {
          key: 'white-label',
          title: 'White Label',
          description: 'Customize branding and appearance',
          icon: <TagOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
          path: '/dashboard/admin/white-label',
        },
        {
          key: 'knowledge-base',
          title: 'Knowledge Base',
          description: 'Manage knowledge base articles',
          icon: <BookOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
          path: '/dashboard/admin/knowledge-base',
        },
      ],
    },
    {
      title: 'Data Management',
      cards: [
        {
          key: 'custom-fields',
          title: 'Custom Fields',
          description: 'Create and manage custom fields',
          icon: <DatabaseOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
          path: '/dashboard/admin/custom-fields',
        },
        {
          key: 'api',
          title: 'API',
          description: 'API keys and documentation',
          icon: <ApiOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
          path: '/dashboard/admin/api',
        },
        {
          key: 'integrations',
          title: 'Integrations',
          description: 'Connect with third-party services',
          icon: <AppstoreOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
          path: '/dashboard/admin/integrations',
          badge: 'NEW',
        },
      ],
    },
    {
      title: 'Business Administration',
      cards: [
        {
          key: 'contracts',
          title: 'Contracts',
          description: 'Manage customer contracts',
          icon: <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
          path: '/dashboard/admin/contracts',
        },
        {
          key: 'sla',
          title: 'Service Level Agreements',
          description: 'Define SLA policies',
          icon: <ClockOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
          path: '/dashboard/admin/sla',
        },
        {
          key: 'business-hours',
          title: 'Business Hours',
          description: 'Set business hours and holidays',
          icon: <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />,
          path: '/dashboard/admin/business-hours',
        },
        {
          key: 'accounting',
          title: 'Accounting',
          description: 'Accounting and billing settings',
          icon: <DollarOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
          path: '/dashboard/admin/accounting',
        },
      ],
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>
          <SettingOutlined /> Admin Settings
        </Title>
        <Paragraph type="secondary">
          Manage all system settings, users, and configurations from here.
        </Paragraph>
      </div>

      {settingsSections.map((section, sectionIndex) => (
        <div key={sectionIndex} style={{ marginBottom: 48 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            {section.title}
          </Title>
          <Row gutter={[16, 16]}>
            {section.cards.map((card) => (
              <Col xs={24} sm={12} md={8} lg={6} key={card.key}>
                <Card
                  hoverable
                  onClick={() => router.push(card.path)}
                  style={{ height: '100%' }}
                  bodyStyle={{ padding: 16 }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {card.icon}
                      {card.badge && (
                        <Badge count={card.badge} style={{ backgroundColor: '#52c41a' }} />
                      )}
                      {!card.badge && <RightOutlined style={{ color: '#8c8c8c' }} />}
                    </div>
                    <Title level={5} style={{ margin: '8px 0 4px', fontSize: 14 }}>
                      {card.title}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {card.description}
                    </Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
}

