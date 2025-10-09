'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Tag, 
  Table, 
  Timeline, 
  Badge,
  Button,
  Space,
  Tooltip,
  Avatar,
  Select,
  DatePicker,
  Divider,
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
  ReloadOutlined,
  SettingOutlined,
  BellOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  CloudServerOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

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
  network: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      // Simulate API calls - replace with actual API endpoints
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock device status
      setDeviceStatus({
        total: 247,
        online: 215,
        offline: 12,
        warning: 15,
        critical: 5,
      });

      // Mock system health
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

      // Mock alerts
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
        {
          id: '4',
          type: 'warning',
          device: 'Web-Server-05',
          message: 'High network latency detected',
          time: '45 minutes ago',
        },
        {
          id: '5',
          type: 'info',
          device: 'Backup-Server',
          message: 'Scheduled backup completed successfully',
          time: '1 hour ago',
        },
      ]);

      // Mock activities
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
        {
          id: '3',
          user: 'System',
          action: 'Automatic patch installation failed',
          device: 'Database-Server-02',
          time: '28 minutes ago',
          status: 'error',
        },
        {
          id: '4',
          user: 'Mike Wilson',
          action: 'Added new device',
          time: '1 hour ago',
          status: 'success',
        },
        {
          id: '5',
          user: 'System',
          action: 'Security scan completed',
          time: '2 hours ago',
          status: 'success',
        },
      ]);

      // Mock metrics trend
      const now = Date.now();
      const trendData: MetricTrend[] = [];
      for (let i = 23; i >= 0; i--) {
        trendData.push({
          time: dayjs(now - i * 3600000).format('HH:mm'),
          cpu: Math.random() * 40 + 30,
          memory: Math.random() * 30 + 50,
          disk: Math.random() * 15 + 60,
          network: Math.random() * 50 + 20,
        });
      }
      setMetricsTrend(trendData);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  return (
    <div style={{ padding: '0 24px 24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>
            <DashboardOutlined style={{ marginRight: 12 }} />
            Dashboard
          </h1>
          <p style={{ margin: '8px 0 0', color: '#8c8c8c' }}>
            Last updated: {dayjs().format('MMM D, YYYY HH:mm:ss')}
          </p>
        </Col>
        <Col>
          <Space>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
              options={[
                { label: 'Last 1 Hour', value: '1h' },
                { label: 'Last 6 Hours', value: '6h' },
                { label: 'Last 24 Hours', value: '24h' },
                { label: 'Last 7 Days', value: '7d' },
                { label: 'Last 30 Days', value: '30d' },
              ]}
            />
            <Button 
              icon={<ReloadOutlined spin={refreshing} />}
              onClick={() => loadDashboardData()}
              loading={refreshing}
            >
              Refresh
            </Button>
            <Button icon={<SettingOutlined />}>
              Customize
            </Button>
          </Space>
        </Col>
      </Row>

      {/* System Health Score - Prominent Display */}
      <Card 
        style={{ 
          marginBottom: 24, 
          background: `linear-gradient(135deg, ${getHealthColor(systemHealth.score)}15 0%, ${getHealthColor(systemHealth.score)}05 100%)`,
          border: `1px solid ${getHealthColor(systemHealth.score)}30`
        }}
      >
        <Row gutter={24} align="middle">
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={systemHealth.score}
                size={180}
                strokeColor={getHealthColor(systemHealth.score)}
                format={(percent) => (
                  <div>
                    <div style={{ fontSize: 48, fontWeight: 700, color: getHealthColor(systemHealth.score) }}>
                      {percent}
                    </div>
                    <div style={{ fontSize: 14, color: '#8c8c8c', marginTop: 8 }}>
                      Health Score
                    </div>
                  </div>
                )}
              />
              <div style={{ marginTop: 16 }}>
                <Badge 
                  status={getHealthStatus(systemHealth.score).color as any} 
                  text={getHealthStatus(systemHealth.score).text}
                  style={{ fontSize: 16 }}
                />
                {systemHealth.trend === 'up' && (
                  <Tag color="success" style={{ marginLeft: 8 }}>
                    <RiseOutlined /> Improving
                  </Tag>
                )}
                {systemHealth.trend === 'down' && (
                  <Tag color="error" style={{ marginLeft: 8 }}>
                    <FallOutlined /> Declining
                  </Tag>
                )}
              </div>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" style={{ background: 'rgba(255,255,255,0.6)' }}>
                  <Statistic
                    title="Availability"
                    value={systemHealth.factors.availability}
                    suffix="%"
                    prefix={<SafetyOutlined />}
                    valueStyle={{ color: getHealthColor(systemHealth.factors.availability) }}
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
                    valueStyle={{ color: getHealthColor(systemHealth.factors.performance) }}
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
                    valueStyle={{ color: getHealthColor(systemHealth.factors.security) }}
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
                    valueStyle={{ color: getHealthColor(systemHealth.factors.compliance) }}
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

      {/* Key Metrics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
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

      <Row gutter={[16, 16]}>
        {/* Device Status Distribution */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <CloudServerOutlined />
                <span>Device Status</span>
              </Space>
            }
            extra={<Button type="link" size="small">View All</Button>}
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
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
        </Col>

        {/* Recent Alerts */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <BellOutlined />
                <span>Recent Alerts</span>
              </Space>
            }
            extra={<Button type="link" size="small">View All</Button>}
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
        </Col>
      </Row>

      {/* Performance Metrics Chart */}
      <Card 
        title={
          <Space>
            <ApiOutlined />
            <span>System Performance Trends</span>
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        <ResponsiveContainer width="100%" height={300}>
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
            <Legend />
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

      {/* Recent Activity */}
      <Card 
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Recent Activity</span>
          </Space>
        }
        extra={<Button type="link" size="small">View All</Button>}
        style={{ marginTop: 16 }}
      >
        <Timeline
          items={activities.map((activity) => ({
            dot: activity.status === 'success' ? (
              <CheckCircleOutlined style={{ fontSize: 16, color: '#52c41a' }} />
            ) : activity.status === 'error' ? (
              <WarningOutlined style={{ fontSize: 16, color: '#f5222d' }} />
            ) : (
              <ClockCircleOutlined style={{ fontSize: 16, color: '#faad14' }} />
            ),
            children: (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Avatar size="small" style={{ marginRight: 8, backgroundColor: '#1890ff' }}>
                      {activity.user.charAt(0)}
                    </Avatar>
                    <strong>{activity.user}</strong>
                    <span style={{ marginLeft: 8, color: '#595959' }}>{activity.action}</span>
                    {activity.device && (
                      <Tag style={{ marginLeft: 8 }}>{activity.device}</Tag>
                    )}
                  </div>
                  <span style={{ color: '#8c8c8c', fontSize: 12 }}>{activity.time}</span>
                </div>
              </div>
            ),
          }))}
        />
      </Card>
    </div>
  );
}
