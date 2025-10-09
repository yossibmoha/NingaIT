'use client'

import { Card, Typography, Button, Space, Empty, Row, Col, Statistic } from 'antd'
import { FileTextOutlined, PlusOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function ReportsPage() {
  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <FileTextOutlined /> All Reports
            </Title>
            <Text type="secondary">Access all reporting tools and analytics</Text>
          </div>
          <Space>
            <Button icon={<FilterOutlined />}>Filter</Button>
            <Button icon={<DownloadOutlined />}>Export</Button>
            <Button type="primary" icon={<PlusOutlined />}>New Report</Button>
          </Space>
        </div>

        {/* Stats */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic title="Total Reports" value={42} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Favorites" value={8} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Shared" value={5} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Scheduled" value={3} />
            </Card>
          </Col>
        </Row>

        {/* Content */}
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="small">
                <Text strong>Reports Coming Soon</Text>
                <Text type="secondary">
                  This page will display all available reports with filtering, export, and scheduling options.
                </Text>
              </Space>
            }
          >
            <Button type="primary" icon={<PlusOutlined />}>Create First Report</Button>
          </Empty>
        </Card>
      </Space>
    </div>
  )
}
