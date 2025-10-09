'use client';

import { Card, Table, Progress, Tag, Tabs } from 'antd';
import { 
  ThunderboltOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ApiOutlined
} from '@ant-design/icons';

interface DeviceResource {
  key: string;
  device: string;
  customer: string;
  value: number;
  status: 'critical' | 'warning' | 'normal';
}

export default function TopDevicesByResource() {
  const cpuData: DeviceResource[] = [
    { key: '1', device: 'SQL-Server-01', customer: 'Acme Corp', value: 95, status: 'critical' },
    { key: '2', device: 'Web-Server-02', customer: 'TechStart Inc', value: 87, status: 'warning' },
    { key: '3', device: 'App-Server-01', customer: 'Global Systems', value: 82, status: 'warning' },
    { key: '4', device: 'DB-Server-03', customer: 'DataFlow Ltd', value: 78, status: 'warning' },
    { key: '5', device: 'Mail-Server', customer: 'Cloud Services', value: 72, status: 'normal' },
  ];

  const memoryData: DeviceResource[] = [
    { key: '1', device: 'Exchange-Server', customer: 'Global Systems', value: 92, status: 'critical' },
    { key: '2', device: 'SQL-Server-02', customer: 'Acme Corp', value: 88, status: 'warning' },
    { key: '3', device: 'VM-Host-01', customer: 'TechStart Inc', value: 85, status: 'warning' },
    { key: '4', device: 'Cache-Server', customer: 'DataFlow Ltd', value: 79, status: 'warning' },
    { key: '5', device: 'Analytics-Server', customer: 'Cloud Services', value: 74, status: 'normal' },
  ];

  const diskData: DeviceResource[] = [
    { key: '1', device: 'File-Server-01', customer: 'TechStart Inc', value: 96, status: 'critical' },
    { key: '2', device: 'Backup-Server', customer: 'Acme Corp', value: 91, status: 'critical' },
    { key: '3', device: 'Log-Server', customer: 'Global Systems', value: 86, status: 'warning' },
    { key: '4', device: 'Archive-Server', customer: 'DataFlow Ltd', value: 81, status: 'warning' },
    { key: '5', device: 'Media-Server', customer: 'Cloud Services', value: 75, status: 'normal' },
  ];

  const networkData: DeviceResource[] = [
    { key: '1', device: 'Firewall-01', customer: 'Acme Corp', value: 89, status: 'warning' },
    { key: '2', device: 'Router-Main', customer: 'Global Systems', value: 84, status: 'warning' },
    { key: '3', device: 'Switch-Core', customer: 'TechStart Inc', value: 76, status: 'normal' },
    { key: '4', device: 'VPN-Gateway', customer: 'DataFlow Ltd', value: 71, status: 'normal' },
    { key: '5', device: 'Load-Balancer', customer: 'Cloud Services', value: 68, status: 'normal' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return '#f5222d';
      case 'warning': return '#faad14';
      default: return '#52c41a';
    }
  };

  const columns = [
    {
      title: 'Device',
      dataIndex: 'device',
      key: 'device',
      render: (text: string, record: DeviceResource) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.customer}</div>
        </div>
      ),
    },
    {
      title: 'Usage',
      dataIndex: 'value',
      key: 'value',
      render: (value: number, record: DeviceResource) => (
        <div>
          <Progress 
            percent={value} 
            strokeColor={getStatusColor(record.status)}
            size="small"
            format={(percent) => `${percent}%`}
          />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'critical' ? 'error' : status === 'warning' ? 'warning' : 'success'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  const items = [
    {
      key: 'cpu',
      label: (
        <span>
          <ThunderboltOutlined /> CPU
        </span>
      ),
      children: <Table dataSource={cpuData} columns={columns} pagination={false} size="small" />,
    },
    {
      key: 'memory',
      label: (
        <span>
          <DashboardOutlined /> Memory
        </span>
      ),
      children: <Table dataSource={memoryData} columns={columns} pagination={false} size="small" />,
    },
    {
      key: 'disk',
      label: (
        <span>
          <DatabaseOutlined /> Disk
        </span>
      ),
      children: <Table dataSource={diskData} columns={columns} pagination={false} size="small" />,
    },
    {
      key: 'network',
      label: (
        <span>
          <ApiOutlined /> Network
        </span>
      ),
      children: <Table dataSource={networkData} columns={columns} pagination={false} size="small" />,
    },
  ];

  return (
    <Card
      title={
        <span>
          <ThunderboltOutlined /> Top Devices by Resource Usage
        </span>
      }
    >
      <Tabs defaultActiveKey="cpu" items={items} />
    </Card>
  );
}

