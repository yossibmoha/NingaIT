'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Tag, 
  Timeline, 
  Badge,
  Space,
  Spin
} from 'antd';
import {
  DashboardOutlined,
  LaptopOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SafetyOutlined,
  CloudServerOutlined,
  ThunderboltOutlined,
  BellOutlined,
  ApiOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { 
  AreaChart, 
  Area, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import dayjs from 'dayjs';
import CustomizableDashboard, { DashboardCard } from '@/components/dashboard/CustomizableDashboard';
import AvailabilityMonitoring from '@/components/dashboard/AvailabilityMonitoring';
import ServersByType from '@/components/dashboard/ServersByType';
import AlertsBreakdown from '@/components/dashboard/AlertsBreakdown';
import PatchStatus from '@/components/dashboard/PatchStatus';
import BackupStatus from '@/components/dashboard/BackupStatus';
import TopDevicesByResource from '@/components/dashboard/TopDevicesByResource';

// Types
interface DeviceStatus {
  total: number;
  online: number;
  offline: number;
  warning: number;
  critical: number;
}

interface SystemHealth {
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  factors: {
    availability: number;
    performance: number;
    security: number;
    compliance: number;
  };
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  device: string;
  message: string;
  time: string;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  device?: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

interface MetricTrend {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
}

export default function CustomizableDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    total: 0,
    online: 0,
    offline: 0,
    warning: 0,
    critical: 0,
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    score: 0,
    status: 'good',
    trend: 'stable',
    factors: {
      availability: 0,
      performance: 0,
      security: 0,
      compliance: 0,
    },
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [metricsTrend, setMetricsTrend] = useState<MetricTrend[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDeviceStatus({
        total: 247,
        online: 215,
        offline: 12,
        warning: 15,
        critical: 5,
      });

      setSystemHealth({
        score: 87,
        status: 'good',
        trend: 'up',
        factors: {
          availability: 92,
          performance: 85,
          security: 88,
          compliance: 84,
        },
      });

      setAlerts([
        {
          id: '1',
          type: 'critical',
          device: 'Server-Prod-001',
          message: 'CPU usage above 95% for 10 minutes',
          time: '2 minutes ago',
        },
        {
          id: '2',
          type: 'warning',
          device: 'Workstation-042',
          message: 'Low disk space (< 10% free)',
          time: '15 minutes ago',
        },
        {
          id: '3',
          type: 'critical',
          device: 'Database-Server-02',
          message: 'Memory usage critically high',
          time: '23 minutes ago',
        },
      ]);

      setActivities([
        {
          id: '1',
          user: 'John Smith',
          action: 'Deployed script',
          device: 'Server-Prod-001',
          time: '5 minutes ago',
          status: 'success',
        },
        {
          id: '2',
          user: 'Sarah Johnson',
          action: 'Updated configuration',
          device: 'Workstation-042',
          time: '12 minutes ago',
          status: 'success',
        },
      ]);

      const now = Date.now();
      const trendData: MetricTrend[] = [];
      for (let i = 23; i >= 0; i--) {
        trendData.push({
          time: dayjs(now - i * 3600000).format('HH:mm'),
          cpu: Math.random() * 40 + 30,
          memory: Math.random() * 30 + 50,
          disk: Math.random() * 15 + 60,
        });
      }
      setMetricsTrend(trendData);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 75) return '#1890ff';
    if (score >= 60) return '#faad14';
    return '#f5222d';
  };

  const getHealthStatus = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: 'success' };
    if (score >= 75) return { text: 'Good', color: 'processing' };
    if (score >= 60) return { text: 'Warning', color: 'warning' };
    return { text: 'Critical', color: 'error' };
  };

  const deviceStatusData = [
    { name: 'Online', value: deviceStatus.online, color: '#52c41a' },
    { name: 'Offline', value: deviceStatus.offline, color: '#d9d9d9' },
    { name: 'Warning', value: deviceStatus.warning, color: '#faad14' },
    { name: 'Critical', value: deviceStatus.critical, color: '#f5222d' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  // Define all dashboard cards
  const dashboardCards: DashboardCard[] = [
    {
      id: 'system-health',
      title: 'System Health Score',
      defaultSize: { w: 12, h: 3 },
      minSize: { w: 6, h: 2 },
      component: (
        <Card 
          style={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${getHealthColor(systemHealth.score)}15 0%, ${getHealthColor(systemHealth.score)}05 100%)`,
            border: `1px solid ${getHealthColor(systemHealth.score)}30`
          }}
          bordered={false}
        >
          <Row gutter={24} align="middle">
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  percent={systemHealth.score}
                  size={140}
                  strokeColor={getHealthColor(systemHealth.score)}
                  format={(percent) => (
                    <div>
                      <div style={{ fontSize: 36, fontWeight: 700, color: getHealthColor(systemHealth.score) }}>
                        {percent}
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        Health Score
                      </div>
                    </div>
                  )}
                />
                <div style={{ marginTop: 12 }}>
                  <Badge 
                    status={getHealthStatus(systemHealth.score).color as any} 
                    text={getHealthStatus(systemHealth.score).text}
                    style={{ fontSize: 14 }}
                  />
                  {systemHealth.trend === 'up' && (
                    <Tag color="success" style={{ marginLeft: 8 }}>
                      <RiseOutlined /> Improving
                    </Tag>
                  )}
                </div>
              </div>
            </Col>
            <Col xs={24} md={16}>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <Card size="small" style={{ background: 'rgba(255,255,255,0.6)' }}>
                    <Statistic
                      title="Availability"
                      value={systemHealth.factors.availability}
                      suffix="%"
                      prefix={<SafetyOutlined />}
                      valueStyle={{ color: getHealthColor(systemHealth.factors.availability), fontSize: 20 }}
                    />
                    <Progress 
                      percent={systemHealth.factors.availability} 
                      showInfo={false}
                      strokeColor={getHealthColor(systemHealth.factors.availability)}
                      size="small"
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" style={{ background: 'rgba(255,255,255,0.6)' }}>
                    <Statistic
                      title="Performance"
                      value={systemHealth.factors.performance}
                      suffix="%"
                      prefix={<ThunderboltOutlined />}
                      valueStyle={{ color: getHealthColor(systemHealth.factors.performance), fontSize: 20 }}
                    />
                    <Progress 
                      percent={systemHealth.factors.performance} 
                      showInfo={false}
                      strokeColor={getHealthColor(systemHealth.factors.performance)}
                      size="small"
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" style={{ background: 'rgba(255,255,255,0.6)' }}>
                    <Statistic
                      title="Security"
                      value={systemHealth.factors.security}
                      suffix="%"
                      prefix={<SafetyOutlined />}
                      valueStyle={{ color: getHealthColor(systemHealth.factors.security), fontSize: 20 }}
                    />
                    <Progress 
                      percent={systemHealth.factors.security} 
                      showInfo={false}
                      strokeColor={getHealthColor(systemHealth.factors.security)}
                      size="small"
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" style={{ background: 'rgba(255,255,255,0.6)' }}>
                    <Statistic
                      title="Compliance"
                      value={systemHealth.factors.compliance}
                      suffix="%"
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: getHealthColor(systemHealth.factors.compliance), fontSize: 20 }}
                    />
                    <Progress 
                      percent={systemHealth.factors.compliance} 
                      showInfo={false}
                      strokeColor={getHealthColor(systemHealth.factors.compliance)}
                      size="small"
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      id: 'key-metrics',
      title: 'Key Metrics',
      defaultSize: { w: 12, h: 2 },
      minSize: { w: 6, h: 2 },
      component: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Devices"
                value={deviceStatus.total}
                prefix={<LaptopOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 12 }}>
                <Tag color="success">{deviceStatus.online} Online</Tag>
                <Tag color="default">{deviceStatus.offline} Offline</Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Alerts"
                value={deviceStatus.warning + deviceStatus.critical}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
              <div style={{ marginTop: 12 }}>
                <Tag color="error">{deviceStatus.critical} Critical</Tag>
                <Tag color="warning">{deviceStatus.warning} Warning</Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Uptime"
                value={99.7}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
                precision={2}
              />
              <div style={{ marginTop: 12 }}>
                <span style={{ color: '#52c41a', fontSize: 12 }}>
                  <ArrowUpOutlined /> +0.3% vs last week
                </span>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Response Time"
                value={142}
                suffix="ms"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div style={{ marginTop: 12 }}>
                <span style={{ color: '#52c41a', fontSize: 12 }}>
                  <ArrowDownOutlined /> -18ms vs yesterday
                </span>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      id: 'device-status',
      title: 'Device Status',
      defaultSize: { w: 6, h: 3 },
      minSize: { w: 4, h: 2 },
      component: (
        <Card 
          title={
            <Space>
              <CloudServerOutlined />
              <span>Device Status</span>
            </Space>
          }
          style={{ height: '100%' }}
        >
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={deviceStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={5}
                dataKey="value"
                label
              >
                {deviceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 16 }}>
            {deviceStatusData.map((item) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>
                  <Badge color={item.color} />
                  {item.name}
                </span>
                <span style={{ fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      ),
    },
    {
      id: 'recent-alerts',
      title: 'Recent Alerts',
      defaultSize: { w: 6, h: 3 },
      minSize: { w: 4, h: 2 },
      component: (
        <Card 
          title={
            <Space>
              <BellOutlined />
              <span>Recent Alerts</span>
            </Space>
          }
          style={{ height: '100%' }}
        >
          <Timeline
            items={alerts.map((alert) => ({
              dot: alert.type === 'critical' ? (
                <WarningOutlined style={{ fontSize: 16, color: '#f5222d' }} />
              ) : alert.type === 'warning' ? (
                <WarningOutlined style={{ fontSize: 16, color: '#faad14' }} />
              ) : (
                <CheckCircleOutlined style={{ fontSize: 16, color: '#52c41a' }} />
              ),
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Tag color={alert.type === 'critical' ? 'error' : alert.type === 'warning' ? 'warning' : 'success'}>
                        {alert.type.toUpperCase()}
                      </Tag>
                      <strong>{alert.device}</strong>
                    </div>
                    <span style={{ color: '#8c8c8c', fontSize: 12 }}>{alert.time}</span>
                  </div>
                  <div style={{ marginTop: 4, color: '#595959' }}>{alert.message}</div>
                </div>
              ),
            }))}
          />
        </Card>
      ),
    },
    {
      id: 'performance-trends',
      title: 'Performance Trends',
      defaultSize: { w: 12, h: 3 },
      minSize: { w: 6, h: 2 },
      component: (
        <Card 
          title={
            <Space>
              <ApiOutlined />
              <span>System Performance Trends</span>
            </Space>
          }
          style={{ height: '100%' }}
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={metricsTrend}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#52c41a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#faad14" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#faad14" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#8c8c8c" />
              <YAxis stroke="#8c8c8c" />
              <RechartsTooltip />
              <Area 
                type="monotone" 
                dataKey="cpu" 
                stroke="#1890ff" 
                fill="url(#colorCpu)" 
                name="CPU %"
              />
              <Area 
                type="monotone" 
                dataKey="memory" 
                stroke="#52c41a" 
                fill="url(#colorMemory)" 
                name="Memory %"
              />
              <Area 
                type="monotone" 
                dataKey="disk" 
                stroke="#faad14" 
                fill="url(#colorDisk)" 
                name="Disk %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      ),
    },
    {
      id: 'availability-monitoring',
      title: 'Availability Monitoring',
      defaultSize: { w: 12, h: 3 },
      minSize: { w: 6, h: 2 },
      component: <AvailabilityMonitoring />,
    },
    {
      id: 'alerts-breakdown',
      title: 'Alerts Breakdown',
      defaultSize: { w: 12, h: 3 },
      minSize: { w: 6, h: 2 },
      component: <AlertsBreakdown />,
    },
    {
      id: 'servers-by-type',
      title: 'Servers by Type',
      defaultSize: { w: 6, h: 3 },
      minSize: { w: 4, h: 2 },
      component: <ServersByType />,
    },
    {
      id: 'patch-status',
      title: 'Patch Status',
      defaultSize: { w: 6, h: 3 },
      minSize: { w: 4, h: 2 },
      component: <PatchStatus />,
    },
    {
      id: 'backup-status',
      title: 'Backup Status',
      defaultSize: { w: 6, h: 3 },
      minSize: { w: 4, h: 2 },
      component: <BackupStatus />,
    },
    {
      id: 'top-devices',
      title: 'Top Devices by Resource',
      defaultSize: { w: 6, h: 3 },
      minSize: { w: 4, h: 2 },
      component: <TopDevicesByResource />,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '24px 24px 0' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>
          <DashboardOutlined style={{ marginRight: 12 }} />
          Dashboard
        </h1>
        <p style={{ margin: '8px 0 0', color: '#8c8c8c' }}>
          Last updated: {dayjs().format('MMM D, YYYY HH:mm:ss')}
        </p>
      </div>

      {/* Customizable Dashboard */}
      <CustomizableDashboard cards={dashboardCards} />
    </div>
  );
}

