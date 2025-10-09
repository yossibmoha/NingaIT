'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select, DatePicker, Table, message, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ApiOutlined, DashboardOutlined, LineChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface MetricData {
  time: string;
  value: number;
}

interface DeviceStats {
  cpu: { mean: number; max: number; min: number };
  memory: { mean: number; max: number; min: number };
  disk: { mean: number; max: number; min: number };
}

interface Device {
  id: string;
  name: string;
}

export default function MetricsPage() {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('cpu');
  const [timeRange, setTimeRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(1, 'hour'),
    dayjs(),
  ]);
  const [interval, setInterval] = useState<string>('1m');
  const [metricData, setMetricData] = useState<MetricData[]>([]);
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [latestMetrics, setLatestMetrics] = useState<Record<string, number>>({});

  // Load devices
  useEffect(() => {
    loadDevices();
  }, []);

  // Load metrics when device or filters change
  useEffect(() => {
    if (selectedDevice) {
      loadMetrics();
      loadStats();
      loadLatestMetrics();
    }
  }, [selectedDevice, selectedMetric, timeRange, interval]);

  const loadDevices = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/devices', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to load devices');
      
      const data = await response.json();
      setDevices(data.devices || []);
      
      if (data.devices.length > 0) {
        setSelectedDevice(data.devices[0].id);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load devices');
    }
  };

  const loadMetrics = async () => {
    if (!selectedDevice) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const start = timeRange[0].toISOString();
      const end = timeRange[1].toISOString();
      
      const url = new URL(`/api/v1/metrics/query`, window.location.origin);
      url.searchParams.set('deviceId', selectedDevice);
      url.searchParams.set('metric', selectedMetric);
      url.searchParams.set('start', start);
      url.searchParams.set('end', end);
      url.searchParams.set('interval', interval);
      url.searchParams.set('aggregation', 'mean');

      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to load metrics');
      
      const result = await response.json();
      
      // Transform data for chart
      const chartData = result.data.map((item: any) => ({
        time: dayjs(item._time).format('HH:mm:ss'),
        value: item._value,
      }));
      
      setMetricData(chartData);
    } catch (error: any) {
      message.error(error.message || 'Failed to load metrics');
      setMetricData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!selectedDevice) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const period = calculatePeriod();
      
      const response = await fetch(
        `/api/v1/metrics/device/${selectedDevice}/stats?period=${period}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to load stats');
      
      const result = await response.json();
      setStats(result.stats);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadLatestMetrics = async () => {
    if (!selectedDevice) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `/api/v1/metrics/device/${selectedDevice}/latest`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to load latest metrics');
      
      const result = await response.json();
      setLatestMetrics(result.metrics);
    } catch (error: any) {
      console.error('Failed to load latest metrics:', error);
    }
  };

  const calculatePeriod = () => {
    const diff = timeRange[1].diff(timeRange[0], 'hours');
    if (diff <= 1) return '1h';
    if (diff <= 6) return '6h';
    if (diff <= 24) return '24h';
    return '7d';
  };

  const getMetricUnit = (metric: string) => {
    switch (metric) {
      case 'cpu':
      case 'memory':
      case 'disk':
        return '%';
      case 'temperature':
        return '°C';
      case 'network_in':
      case 'network_out':
        return 'MB/s';
      case 'uptime':
        return 'hours';
      default:
        return '';
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>
        <LineChartOutlined /> Metrics Dashboard
      </h1>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <label style={{ display: 'block', marginBottom: 8 }}>Device</label>
            <Select
              style={{ width: '100%' }}
              value={selectedDevice}
              onChange={setSelectedDevice}
              placeholder="Select device"
            >
              {devices.map(device => (
                <Select.Option key={device.id} value={device.id}>
                  {device.name}
                </Select.Option>
              ))}
            </Select>
          </Col>

          <Col span={6}>
            <label style={{ display: 'block', marginBottom: 8 }}>Metric</label>
            <Select
              style={{ width: '100%' }}
              value={selectedMetric}
              onChange={setSelectedMetric}
            >
              <Select.Option value="cpu">CPU Usage</Select.Option>
              <Select.Option value="memory">Memory Usage</Select.Option>
              <Select.Option value="disk">Disk Usage</Select.Option>
              <Select.Option value="network_in">Network In</Select.Option>
              <Select.Option value="network_out">Network Out</Select.Option>
              <Select.Option value="temperature">Temperature</Select.Option>
            </Select>
          </Col>

          <Col span={6}>
            <label style={{ display: 'block', marginBottom: 8 }}>Time Range</label>
            <RangePicker
              style={{ width: '100%' }}
              showTime
              value={timeRange}
              onChange={(dates) => dates && setTimeRange(dates as [Dayjs, Dayjs])}
              presets={[
                { label: 'Last Hour', value: [dayjs().subtract(1, 'hour'), dayjs()] },
                { label: 'Last 6 Hours', value: [dayjs().subtract(6, 'hours'), dayjs()] },
                { label: 'Last 24 Hours', value: [dayjs().subtract(24, 'hours'), dayjs()] },
                { label: 'Last 7 Days', value: [dayjs().subtract(7, 'days'), dayjs()] },
              ]}
            />
          </Col>

          <Col span={6}>
            <label style={{ display: 'block', marginBottom: 8 }}>Interval</label>
            <Select
              style={{ width: '100%' }}
              value={interval}
              onChange={setInterval}
            >
              <Select.Option value="1m">1 minute</Select.Option>
              <Select.Option value="5m">5 minutes</Select.Option>
              <Select.Option value="15m">15 minutes</Select.Option>
              <Select.Option value="1h">1 hour</Select.Option>
              <Select.Option value="6h">6 hours</Select.Option>
              <Select.Option value="1d">1 day</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Latest Metrics */}
      {latestMetrics && Object.keys(latestMetrics).length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Current CPU"
                value={latestMetrics.cpu || 0}
                precision={1}
                suffix="%"
                valueStyle={{ color: latestMetrics.cpu > 80 ? '#cf1322' : '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Current Memory"
                value={latestMetrics.memory || 0}
                precision={1}
                suffix="%"
                valueStyle={{ color: latestMetrics.memory > 80 ? '#cf1322' : '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Current Disk"
                value={latestMetrics.disk || 0}
                precision={1}
                suffix="%"
                valueStyle={{ color: latestMetrics.disk > 90 ? '#cf1322' : '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Uptime"
                value={latestMetrics.uptime ? (latestMetrics.uptime / 3600).toFixed(1) : 0}
                suffix="hours"
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Statistics */}
      {stats && (
        <Card title="Statistics" style={{ marginBottom: 24 }}>
          <Table
            dataSource={[
              { metric: 'CPU', ...stats.cpu },
              { metric: 'Memory', ...stats.memory },
              { metric: 'Disk', ...stats.disk },
            ]}
            columns={[
              { title: 'Metric', dataIndex: 'metric', key: 'metric' },
              {
                title: 'Average',
                dataIndex: 'mean',
                key: 'mean',
                render: (val) => `${val.toFixed(2)}%`,
              },
              {
                title: 'Maximum',
                dataIndex: 'max',
                key: 'max',
                render: (val) => `${val.toFixed(2)}%`,
              },
              {
                title: 'Minimum',
                dataIndex: 'min',
                key: 'min',
                render: (val) => `${val.toFixed(2)}%`,
              },
            ]}
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* Chart */}
      <Card title={`${selectedMetric.toUpperCase()} - Time Series`} loading={loading}>
        {metricData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={metricData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis unit={getMetricUnit(selectedMetric)} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#1890ff"
                fillOpacity={1}
                fill="url(#colorValue)"
                name={`${selectedMetric} ${getMetricUnit(selectedMetric)}`}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            {loading ? <Spin /> : 'No data available for the selected time range'}
          </div>
        )}
      </Card>
    </div>
  );
}

