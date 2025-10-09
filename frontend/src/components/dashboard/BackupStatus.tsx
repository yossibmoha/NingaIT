'use client';

import { Card, Progress, List, Tag, Badge } from 'antd';
import { 
  CloudUploadOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

interface BackupDevice {
  name: string;
  customer: string;
  status: 'success' | 'warning' | 'failed' | 'running';
  lastBackup: string;
  size: string;
}

export default function BackupStatus() {
  const backupDevices: BackupDevice[] = [
    {
      name: 'SQL-Server-01',
      customer: 'Acme Corp',
      status: 'success',
      lastBackup: '2 hours ago',
      size: '45.2 GB',
    },
    {
      name: 'File-Server-02',
      customer: 'TechStart Inc',
      status: 'running',
      lastBackup: 'In progress',
      size: '32.1 GB',
    },
    {
      name: 'Exchange-Server',
      customer: 'Global Systems',
      status: 'warning',
      lastBackup: '2 days ago',
      size: '78.5 GB',
    },
    {
      name: 'Web-Server-03',
      customer: 'DataFlow Ltd',
      status: 'failed',
      lastBackup: 'Failed',
      size: '12.3 GB',
    },
    {
      name: 'DC-Server-01',
      customer: 'Cloud Services',
      status: 'success',
      lastBackup: '4 hours ago',
      size: '28.9 GB',
    },
  ];

  const stats = {
    success: backupDevices.filter(d => d.status === 'success').length,
    warning: backupDevices.filter(d => d.status === 'warning').length,
    failed: backupDevices.filter(d => d.status === 'failed').length,
    running: backupDevices.filter(d => d.status === 'running').length,
    total: backupDevices.length,
  };

  const successRate = ((stats.success / stats.total) * 100).toFixed(1);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning': return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'failed': return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case 'running': return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      default: return null;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'success': return <Tag color="success">Success</Tag>;
      case 'warning': return <Tag color="warning">Warning</Tag>;
      case 'failed': return <Tag color="error">Failed</Tag>;
      case 'running': return <Tag color="processing">Running</Tag>;
      default: return null;
    }
  };

  return (
    <Card
      title={
        <span>
          <CloudUploadOutlined /> Backup Status
        </span>
      }
      extra={
        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
          Success Rate: <strong style={{ color: '#52c41a' }}>{successRate}%</strong>
        </span>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Progress
          percent={parseFloat(successRate)}
          success={{ percent: parseFloat(successRate) }}
          format={() => `${stats.success}/${stats.total}`}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <Badge count={stats.success} style={{ backgroundColor: '#52c41a' }} />
          <div style={{ fontSize: 12, marginTop: 4 }}>Success</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Badge count={stats.running} style={{ backgroundColor: '#1890ff' }} />
          <div style={{ fontSize: 12, marginTop: 4 }}>Running</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Badge count={stats.warning} style={{ backgroundColor: '#faad14' }} />
          <div style={{ fontSize: 12, marginTop: 4 }}>Warning</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Badge count={stats.failed} style={{ backgroundColor: '#f5222d' }} />
          <div style={{ fontSize: 12, marginTop: 4 }}>Failed</div>
        </div>
      </div>

      <List
        dataSource={backupDevices}
        renderItem={(device) => (
          <List.Item>
            <List.Item.Meta
              avatar={getStatusIcon(device.status)}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{device.name}</span>
                  {getStatusTag(device.status)}
                </div>
              }
              description={
                <div>
                  <div style={{ fontSize: 12 }}>
                    {device.customer} • Last: {device.lastBackup} • Size: {device.size}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
        style={{ maxHeight: 300, overflow: 'auto' }}
        size="small"
      />
    </Card>
  );
}

