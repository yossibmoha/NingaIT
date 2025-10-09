'use client';

import { Card, Table, Tooltip, Space } from 'antd';
import { 
  CloudServerOutlined, 
  DesktopOutlined, 
  AppleOutlined, 
  CodeOutlined,
  ApiOutlined,
  AppstoreOutlined,
  CloudOutlined,
  GlobalOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';

interface DeviceTypeStatus {
  type: string;
  icon: React.ReactNode;
  online: number;
  offline: number;
  total: number;
}

export default function AvailabilityMonitoring() {
  const deviceTypes: DeviceTypeStatus[] = [
    {
      type: 'Server',
      icon: <CloudServerOutlined style={{ fontSize: 20, color: '#1890ff' }} />,
      online: 45,
      offline: 3,
      total: 48,
    },
    {
      type: 'PC',
      icon: <DesktopOutlined style={{ fontSize: 20, color: '#52c41a' }} />,
      online: 120,
      offline: 8,
      total: 128,
    },
    {
      type: 'Mac',
      icon: <AppleOutlined style={{ fontSize: 20, color: '#8c8c8c' }} />,
      online: 35,
      offline: 2,
      total: 37,
    },
    {
      type: 'Linux',
      icon: <CodeOutlined style={{ fontSize: 20, color: '#faad14' }} />,
      online: 15,
      offline: 1,
      total: 16,
    },
    {
      type: 'SNMP',
      icon: <ApiOutlined style={{ fontSize: 20, color: '#722ed1' }} />,
      online: 12,
      offline: 0,
      total: 12,
    },
    {
      type: 'Generic',
      icon: <AppstoreOutlined style={{ fontSize: 20, color: '#13c2c2' }} />,
      online: 8,
      offline: 0,
      total: 8,
    },
    {
      type: 'TCP',
      icon: <CloudOutlined style={{ fontSize: 20, color: '#eb2f96' }} />,
      online: 6,
      offline: 0,
      total: 6,
    },
    {
      type: 'HTTP',
      icon: <GlobalOutlined style={{ fontSize: 20, color: '#fa8c16' }} />,
      online: 10,
      offline: 1,
      total: 11,
    },
  ];

  const columns = [
    {
      title: 'Device Type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string, record: DeviceTypeStatus) => (
        <Space>
          {record.icon}
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Online',
      dataIndex: 'online',
      key: 'online',
      align: 'center' as const,
      render: (value: number) => (
        <span style={{ color: '#52c41a', fontWeight: 600 }}>{value}</span>
      ),
    },
    {
      title: 'Offline',
      dataIndex: 'offline',
      key: 'offline',
      align: 'center' as const,
      render: (value: number) => (
        <span style={{ color: value > 0 ? '#f5222d' : '#8c8c8c', fontWeight: 600 }}>
          {value}
        </span>
      ),
    },
    {
      title: 'Availability',
      key: 'availability',
      align: 'center' as const,
      render: (_: any, record: DeviceTypeStatus) => {
        const percentage = ((record.online / record.total) * 100).toFixed(1);
        const color = parseFloat(percentage) >= 95 ? '#52c41a' : parseFloat(percentage) >= 90 ? '#faad14' : '#f5222d';
        return (
          <Tooltip title={`${record.online} of ${record.total} devices online`}>
            <span style={{ color, fontWeight: 600 }}>{percentage}%</span>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Card 
      title={
        <Space>
          <CloudServerOutlined />
          <span>Availability Monitoring</span>
          <Tooltip title="Real-time device availability status by type">
            <QuestionCircleOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
          </Tooltip>
        </Space>
      }
      extra={
        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
          {deviceTypes.reduce((sum, d) => sum + d.online, 0)} / {deviceTypes.reduce((sum, d) => sum + d.total, 0)} Online
        </span>
      }
    >
      <Table
        dataSource={deviceTypes}
        columns={columns}
        pagination={false}
        size="small"
        rowKey="type"
      />
    </Card>
  );
}

