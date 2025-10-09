'use client'

import { Card, Typography, Button, Space, Empty } from 'antd'
import { AppstoreOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function AppCenterPage() {
  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <AppstoreOutlined /> App Center
            </Title>
            <Text type="secondary">Manage and deploy applications across your devices</Text>
          </div>
          <Space>
            <Button icon={<SearchOutlined />}>Browse Apps</Button>
            <Button type="primary" icon={<PlusOutlined />}>Add Application</Button>
          </Space>
        </div>

        {/* Content */}
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="small">
                <Text strong>App Center Coming Soon</Text>
                <Text type="secondary">
                  This page will display available applications and allow centralized app management.
                </Text>
              </Space>
            }
          >
            <Button type="primary" icon={<SearchOutlined />}>Browse Available Apps</Button>
          </Empty>
        </Card>
      </Space>
    </div>
  )
}

