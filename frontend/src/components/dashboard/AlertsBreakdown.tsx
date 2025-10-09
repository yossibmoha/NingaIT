'use client';

import { Card, Row, Col, Statistic, Progress, Tag, List, Badge } from 'antd';
import { 
  WarningOutlined, 
  TeamOutlined, 
  CloudServerOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

interface Alert {
  id: string;
  customer: string;
  device: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  time: string;
}

export default function AlertsBreakdown() {
  const customerAlerts: Alert[] = [
    {
      id: '1',
      customer: 'Acme Corp',
      device: 'Server-01',
      message: 'High CPU usage detected',
      severity: 'critical',
      time: '5m ago',
    },
    {
      id: '2',
      customer: 'TechStart Inc',
      device: 'DB-Server',
      message: 'Low disk space warning',
      severity: 'high',
      time: '12m ago',
    },
    {
      id: '3',
      customer: 'Global Systems',
      device: 'Web-Server',
      message: 'Memory usage above threshold',
      severity: 'medium',
      time: '25m ago',
    },
    {
      id: '4',
      customer: 'DataFlow Ltd',
      device: 'Mail-Server',
      message: 'Service restart required',
      severity: 'high',
      time: '45m ago',
    },
    {
      id: '5',
      customer: 'Cloud Services',
      device: 'API-Server',
      message: 'Network latency increase',
      severity: 'medium',
      time: '1h ago',
    },
  ];

  const serverAlerts = [
    { type: 'Windows Servers', count: 8, total: 25, color: '#f5222d' },
    { type: 'Linux Servers', count: 3, total: 15, color: '#faad14' },
    { type: 'Database Servers', count: 2, total: 8, color: '#1890ff' },
    { type: 'Web Servers', count: 1, total: 10, color: '#52c41a' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'processing';
      default: return 'default';
    }
  };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card
          title={
            <span>
              <TeamOutlined /> Customer Alerts
            </span>
          }
          extra={<Badge count={customerAlerts.length} style={{ backgroundColor: '#f5222d' }} />}
          style={{ height: '100%' }}
        >
          <List
            dataSource={customerAlerts}
            renderItem={(alert) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<ExclamationCircleOutlined style={{ fontSize: 20, color: alert.severity === 'critical' ? '#f5222d' : '#faad14' }} />}
                  title={
                    <div>
                      <strong>{alert.customer}</strong>
                      <Tag color={getSeverityColor(alert.severity)} style={{ marginLeft: 8 }}>
                        {alert.severity.toUpperCase()}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <div>{alert.device}: {alert.message}</div>
                      <span style={{ fontSize: 12, color: '#8c8c8c' }}>{alert.time}</span>
                    </div>
                  }
                />
              </List.Item>
            )}
            style={{ maxHeight: 400, overflow: 'auto' }}
          />
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card
          title={
            <span>
              <CloudServerOutlined /> Server Alerts
            </span>
          }
          extra={
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
              {serverAlerts.reduce((sum, s) => sum + s.count, 0)} Active Issues
            </span>
          }
          style={{ height: '100%' }}
        >
          {serverAlerts.map((server, index) => (
            <div key={index} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>
                  <Badge color={server.color} />
                  {server.type}
                </span>
                <span>
                  <strong style={{ color: server.color }}>{server.count}</strong> / {server.total}
                </span>
              </div>
              <Progress 
                percent={(server.count / server.total) * 100} 
                showInfo={false}
                strokeColor={server.color}
                size="small"
              />
            </div>
          ))}
          
          <Card size="small" style={{ marginTop: 16, backgroundColor: '#f6f8fa' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Critical"
                  value={5}
                  valueStyle={{ color: '#f5222d', fontSize: 20 }}
                  prefix={<WarningOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Warning"
                  value={9}
                  valueStyle={{ color: '#faad14', fontSize: 20 }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Info"
                  value={12}
                  valueStyle={{ color: '#1890ff', fontSize: 20 }}
                  prefix={<InfoCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Card>
      </Col>
    </Row>
  );
}

