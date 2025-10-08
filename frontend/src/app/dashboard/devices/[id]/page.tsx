'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Tabs,
  Progress,
  Table,
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
  Timeline,
  Empty,
} from 'antd'
import {
  ArrowLeftOutlined,
  DesktopOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { TabPane } = Tabs

interface Metric {
  timestamp: string
  cpu: number
  memory: number
  disk: number
}

interface Alert {
  key: string
  time: string
  type: 'error' | 'warning' | 'info'
  message: string
}

// Mock data
const mockDevice = {
  id: 'dev-001',
  hostname: 'WEB-SERVER-01',
  ip: '192.168.1.10',
  os: 'Ubuntu 22.04 LTS',
  status: 'online',
  agent: '0.1.0',
  group: 'Web Servers',
  cpu: 45,
  memory: 68,
  disk: 72,
  uptime: '15 days, 3 hours',
  lastSeen: '2 minutes ago',
  specs: {
    cpu: 'Intel Xeon E5-2670 v3 @ 2.30GHz (8 cores)',
    memory: '16 GB DDR4',
    disk: '500 GB SSD',
    network: '1 Gbps',
  },
}

const mockMetrics: Metric[] = [
  { timestamp: '10:00', cpu: 42, memory: 65, disk: 72 },
  { timestamp: '10:05', cpu: 45, memory: 67, disk: 72 },
  { timestamp: '10:10', cpu: 48, memory: 68, disk: 72 },
  { timestamp: '10:15', cpu: 45, memory: 68, disk: 72 },
  { timestamp: '10:20', cpu: 43, memory: 66, disk: 72 },
]

const mockAlerts: Alert[] = [
  {
    key: '1',
    time: '5 minutes ago',
    type: 'warning',
    message: 'High memory usage detected (68%)',
  },
  {
    key: '2',
    time: '1 hour ago',
    type: 'info',
    message: 'System backup completed successfully',
  },
  {
    key: '3',
    time: '3 hours ago',
    type: 'warning',
    message: 'Disk usage above 70%',
  },
]

export default function DeviceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  const getStatusTag = (status: string) => {
    const config = {
      online: { color: 'success', icon: <CheckCircleOutlined />, text: 'ONLINE' },
      offline: { color: 'default', icon: <CloseCircleOutlined />, text: 'OFFLINE' },
      warning: { color: 'warning', icon: <WarningOutlined />, text: 'WARNING' },
    }
    const { color, icon, text } = config[status as keyof typeof config]
    return <Tag color={color} icon={icon}>{text}</Tag>
  }

  const alertColumns: ColumnsType<Alert> = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      width: 150,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => {
        const colors = { error: 'error', warning: 'warning', info: 'info' }
        return <Tag color={colors[type as keyof typeof colors]}>{type.toUpperCase()}</Tag>
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
  ]

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            style={{ marginBottom: 16 }}
          >
            Back to Devices
          </Button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                <DesktopOutlined /> {mockDevice.hostname}
              </Title>
              <Space>
                {getStatusTag(mockDevice.status)}
                <Text type="secondary">{mockDevice.ip}</Text>
              </Space>
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                Refresh
              </Button>
              <Button type="primary" icon={<PlayCircleOutlined />}>
                Run Script
              </Button>
            </Space>
          </div>
        </div>

        {/* Quick Stats */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="CPU Usage"
                value={mockDevice.cpu}
                suffix="%"
                valueStyle={{ color: mockDevice.cpu > 75 ? '#ff4d4f' : '#52c41a' }}
              />
              <Progress percent={mockDevice.cpu} showInfo={false} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Memory Usage"
                value={mockDevice.memory}
                suffix="%"
                valueStyle={{ color: mockDevice.memory > 75 ? '#ff4d4f' : '#faad14' }}
              />
              <Progress percent={mockDevice.memory} showInfo={false} status="normal" />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Disk Usage"
                value={mockDevice.disk}
                suffix="%"
                valueStyle={{ color: mockDevice.disk > 75 ? '#faad14' : '#52c41a' }}
              />
              <Progress percent={mockDevice.disk} showInfo={false} status="normal" />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Uptime"
                value={mockDevice.uptime}
                valueStyle={{ fontSize: 16 }}
              />
              <Text type="secondary">Last seen: {mockDevice.lastSeen}</Text>
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Card>
          <Tabs defaultActiveKey="overview">
            <TabPane tab="Overview" key="overview">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Hostname">{mockDevice.hostname}</Descriptions.Item>
                <Descriptions.Item label="IP Address">{mockDevice.ip}</Descriptions.Item>
                <Descriptions.Item label="Operating System">{mockDevice.os}</Descriptions.Item>
                <Descriptions.Item label="Status">{getStatusTag(mockDevice.status)}</Descriptions.Item>
                <Descriptions.Item label="Agent Version">{mockDevice.agent}</Descriptions.Item>
                <Descriptions.Item label="Device Group">{mockDevice.group}</Descriptions.Item>
                <Descriptions.Item label="Uptime">{mockDevice.uptime}</Descriptions.Item>
                <Descriptions.Item label="Last Seen">{mockDevice.lastSeen}</Descriptions.Item>
              </Descriptions>

              <Title level={4} style={{ marginTop: 24 }}>Hardware Specifications</Title>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="CPU">{mockDevice.specs.cpu}</Descriptions.Item>
                <Descriptions.Item label="Memory">{mockDevice.specs.memory}</Descriptions.Item>
                <Descriptions.Item label="Disk">{mockDevice.specs.disk}</Descriptions.Item>
                <Descriptions.Item label="Network">{mockDevice.specs.network}</Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="Metrics" key="metrics">
              <Empty description="Real-time metrics will be displayed here" />
              {/* TODO: Add charts with real-time metrics */}
            </TabPane>

            <TabPane tab="Alerts" key="alerts">
              <Table
                columns={alertColumns}
                dataSource={mockAlerts}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>

            <TabPane tab="History" key="history">
              <Timeline>
                <Timeline.Item color="green">
                  <Text type="secondary">2 minutes ago</Text>
                  <br />
                  <Text>Heartbeat received - System healthy</Text>
                </Timeline.Item>
                <Timeline.Item color="yellow">
                  <Text type="secondary">5 minutes ago</Text>
                  <br />
                  <Text>High memory usage detected (68%)</Text>
                </Timeline.Item>
                <Timeline.Item color="green">
                  <Text type="secondary">1 hour ago</Text>
                  <br />
                  <Text>Backup completed successfully</Text>
                </Timeline.Item>
                <Timeline.Item color="yellow">
                  <Text type="secondary">3 hours ago</Text>
                  <br />
                  <Text>Disk usage above 70%</Text>
                </Timeline.Item>
                <Timeline.Item>
                  <Text type="secondary">6 hours ago</Text>
                  <br />
                  <Text>Agent updated to v0.1.0</Text>
                </Timeline.Item>
              </Timeline>
            </TabPane>

            <TabPane tab="Scripts" key="scripts">
              <Empty description="Script execution history will be displayed here" />
            </TabPane>
          </Tabs>
        </Card>
      </Space>
    </div>
  )
}

