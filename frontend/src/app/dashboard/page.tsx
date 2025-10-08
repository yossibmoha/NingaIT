'use client'

import { Row, Col, Card, Statistic, Typography, Space, Progress, Tag } from 'antd'
import {
  DesktopOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/auth'

const { Title, Text } = Typography

export default function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2}>
            Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
          </Title>
          <Text type="secondary">
            Here's what's happening with your infrastructure today
          </Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Devices"
                value={156}
                prefix={<DesktopOutlined />}
                suffix={
                  <span style={{ fontSize: 14 }}>
                    <ArrowUpOutlined style={{ color: '#52c41a' }} /> 12%
                  </span>
                }
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Online"
                value={142}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
                suffix={<Text type="secondary">/ 156</Text>}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Warnings"
                value={8}
                valueStyle={{ color: '#faad14' }}
                prefix={<WarningOutlined />}
                suffix={
                  <span style={{ fontSize: 14 }}>
                    <ArrowDownOutlined style={{ color: '#52c41a' }} /> 25%
                  </span>
                }
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Critical Alerts"
                value={3}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* System Health */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title="System Health Overview">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>CPU Usage</Text>
                    <Text strong>45%</Text>
                  </div>
                  <Progress percent={45} status="normal" strokeColor="#52c41a" />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>Memory Usage</Text>
                    <Text strong>68%</Text>
                  </div>
                  <Progress percent={68} status="normal" strokeColor="#1890ff" />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>Disk Usage</Text>
                    <Text strong>82%</Text>
                  </div>
                  <Progress percent={82} status="normal" strokeColor="#faad14" />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>Network Bandwidth</Text>
                    <Text strong>34%</Text>
                  </div>
                  <Progress percent={34} status="normal" strokeColor="#52c41a" />
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Recent Alerts">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Tag color="error">CRITICAL</Tag>
                  <Text>Server DB-01 offline</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>2 minutes ago</Text>
                </div>

                <div>
                  <Tag color="warning">WARNING</Tag>
                  <Text>High memory on WEB-03</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>15 minutes ago</Text>
                </div>

                <div>
                  <Tag color="warning">WARNING</Tag>
                  <Text>Disk space low on APP-02</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>1 hour ago</Text>
                </div>

                <div>
                  <Tag color="success">INFO</Tag>
                  <Text>Backup completed</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>2 hours ago</Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card hoverable style={{ textAlign: 'center' }}>
                <DesktopOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                <div style={{ marginTop: 8 }}>
                  <Text strong>Add Device</Text>
                </div>
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card hoverable style={{ textAlign: 'center' }}>
                <AlertOutlined style={{ fontSize: 32, color: '#faad14' }} />
                <div style={{ marginTop: 8 }}>
                  <Text strong>View Alerts</Text>
                </div>
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card hoverable style={{ textAlign: 'center' }}>
                <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                <div style={{ marginTop: 8 }}>
                  <Text strong>Run Script</Text>
                </div>
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card hoverable style={{ textAlign: 'center' }}>
                <WarningOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
                <div style={{ marginTop: 8 }}>
                  <Text strong>Reports</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  )
}

