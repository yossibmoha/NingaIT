'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Space,
  Statistic,
  Table,
  Tag,
  Tabs,
  Button,
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs(),
  ]);
  const [selectedMetric, setSelectedMetric] = useState<'cpu' | 'memory' | 'disk' | 'network'>('cpu');

  // Mock data for charts
  const devicePerformanceData = [
    { device: 'Server-01', cpu: 45, memory: 68, disk: 72 },
    { device: 'Server-02', cpu: 62, memory: 75, disk: 45 },
    { device: 'Server-03', cpu: 38, memory: 52, disk: 88 },
    { device: 'WS-001', cpu: 55, memory: 65, disk: 55 },
    { device: 'WS-002', cpu: 72, memory: 80, disk: 65 },
  ];

  const alertTrendData = [
    { date: '2024-01-01', critical: 5, warning: 12, info: 8 },
    { date: '2024-01-02', critical: 3, warning: 15, info: 10 },
    { date: '2024-01-03', critical: 7, warning: 10, info: 6 },
    { date: '2024-01-04', critical: 2, warning: 8, info: 12 },
    { date: '2024-01-05', critical: 4, warning: 14, info: 9 },
    { date: '2024-01-06', critical: 6, warning: 11, info: 7 },
    { date: '2024-01-07', critical: 3, warning: 13, info: 11 },
  ];

  const scriptExecutionData = [
    { status: 'Completed', value: 156, percentage: 78 },
    { status: 'Failed', value: 24, percentage: 12 },
    { status: 'Running', value: 12, percentage: 6 },
    { status: 'Cancelled', value: 8, percentage: 4 },
  ];

  const deviceStatusData = [
    { status: 'Online', value: 45, percentage: 75 },
    { status: 'Offline', value: 10, percentage: 16.7 },
    { status: 'Warning', value: 5, percentage: 8.3 },
  ];

  const topDevicesColumns: ColumnsType<any> = [
    {
      title: 'Device',
      dataIndex: 'device',
      key: 'device',
    },
    {
      title: 'CPU Avg',
      dataIndex: 'cpu',
      key: 'cpu',
      render: (value: number) => `${value}%`,
      sorter: (a, b) => a.cpu - b.cpu,
    },
    {
      title: 'Memory Avg',
      dataIndex: 'memory',
      key: 'memory',
      render: (value: number) => `${value}%`,
      sorter: (a, b) => a.memory - b.memory,
    },
    {
      title: 'Disk Usage',
      dataIndex: 'disk',
      key: 'disk',
      render: (value: number) => `${value}%`,
      sorter: (a, b) => a.disk - b.disk,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const avgUsage = (record.cpu + record.memory + record.disk) / 3;
        if (avgUsage > 80) return <Tag color="red">Critical</Tag>;
        if (avgUsage > 60) return <Tag color="orange">Warning</Tag>;
        return <Tag color="green">Normal</Tag>;
      },
    },
  ];

  const devicePerformanceConfig = {
    data: devicePerformanceData,
    xField: 'device',
    yField: selectedMetric,
    label: {
      position: 'top' as const,
      style: {
        fill: '#000000',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      device: {
        alias: 'Device',
      },
      [selectedMetric]: {
        alias: selectedMetric.toUpperCase(),
      },
    },
  };

  const alertTrendConfig = {
    data: [alertTrendData, alertTrendData],
    xField: 'date',
    yField: ['critical', 'warning'],
    geometryOptions: [
      {
        geometry: 'column',
        isStack: true,
        seriesField: 'type',
      },
      {
        geometry: 'line',
        lineStyle: {
          lineWidth: 2,
        },
      },
    ],
  };

  const scriptExecutionPieConfig = {
    data: scriptExecutionData,
    angleField: 'value',
    colorField: 'status',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: {
        formatter: () => 'Total',
      },
      content: {
        formatter: () => '200',
      },
    },
  };

  const deviceStatusPieConfig = {
    data: deviceStatusData,
    angleField: 'value',
    colorField: 'status',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: {
        formatter: () => 'Total',
      },
      content: {
        formatter: () => '60',
      },
    },
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting analytics data...');
  };

  const handleRefresh = () => {
    setLoading(true);
    // TODO: Fetch fresh data
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>
          <BarChartOutlined /> Analytics & Insights
        </h1>
        <p>Comprehensive analytics and performance insights</p>
      </div>

      <Space style={{ marginBottom: '24px', width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            presets={[
              { label: 'Last 7 Days', value: [dayjs().subtract(7, 'days'), dayjs()] },
              { label: 'Last 30 Days', value: [dayjs().subtract(30, 'days'), dayjs()] },
              { label: 'Last 90 Days', value: [dayjs().subtract(90, 'days'), dayjs()] },
            ]}
          />
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            Refresh
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Export
          </Button>
        </Space>
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Devices"
              value={60}
              prefix={<LineChartOutlined />}
              suffix={
                <span style={{ fontSize: '14px', color: '#52c41a' }}>
                  +5 <ArrowUpOutlined style={{ fontSize: '12px' }} />
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Alerts"
              value={15}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix={
                <span style={{ fontSize: '14px', color: '#f5222d' }}>
                  +3 <ArrowUpOutlined style={{ fontSize: '12px' }} />
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Script Executions"
              value={200}
              prefix={<PieChartOutlined />}
              suffix={
                <span style={{ fontSize: '14px', color: '#52c41a' }}>
                  +12 <ArrowUpOutlined style={{ fontSize: '12px' }} />
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Response Time"
              value={125}
              suffix="ms"
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="performance">
        <TabPane tab="Device Performance" key="performance">
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <Card
                title="Average Resource Usage by Device"
                extra={
                  <Select
                    value={selectedMetric}
                    onChange={setSelectedMetric}
                    style={{ width: 120 }}
                  >
                    <Select.Option value="cpu">CPU</Select.Option>
                    <Select.Option value="memory">Memory</Select.Option>
                    <Select.Option value="disk">Disk</Select.Option>
                  </Select>
                }
              >
                <Column {...devicePerformanceConfig} height={350} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Device Status Distribution">
                <Pie {...deviceStatusPieConfig} height={350} />
              </Card>
            </Col>
            <Col span={24}>
              <Card title="Top Resource Consuming Devices">
                <Table
                  columns={topDevicesColumns}
                  dataSource={devicePerformanceData}
                  rowKey="device"
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Alert Trends" key="alerts">
          <Card title="Alert Trends Over Time">
            <Column
              data={alertTrendData.flatMap((item) => [
                { ...item, type: 'critical' },
                { ...item, type: 'warning' },
                { ...item, type: 'info' },
              ])}
              xField="date"
              yField="value"
              seriesField="type"
              isStack
              height={400}
            />
          </Card>
        </TabPane>

        <TabPane tab="Script Executions" key="scripts">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Execution Status Distribution">
                <Pie {...scriptExecutionPieConfig} height={400} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Execution Statistics">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Statistic title="Total Executions" value={200} />
                  <Statistic title="Success Rate" value={78} suffix="%" valueStyle={{ color: '#52c41a' }} />
                  <Statistic title="Avg Duration" value={5.2} suffix="sec" />
                  <Statistic title="Failed Executions" value={24} valueStyle={{ color: '#f5222d' }} />
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
}

