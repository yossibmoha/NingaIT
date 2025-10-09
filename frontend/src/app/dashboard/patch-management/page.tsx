'use client'

import { Card, Typography, Button, Space, Empty } from 'antd'
import { ToolOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function PatchManagementPage() {
  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <ToolOutlined /> Patch Management
            </Title>
            <Text type="secondary">Manage software updates and patches across all devices</Text>
          </div>
          <Space>
            <Button icon={<SyncOutlined />}>Scan for Updates</Button>
            <Button type="primary" icon={<PlusOutlined />}>Create Policy</Button>
          </Space>
        </div>

        {/* Content */}
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="small">
                <Text strong>Patch Management Coming Soon</Text>
                <Text type="secondary">
                  This page will display available patches, patch status, and automation policies.
                </Text>
              </Space>
            }
          >
            <Button type="primary" icon={<SyncOutlined />}>Scan for Updates</Button>
          </Empty>
        </Card>
      </Space>
    </div>
  )
}

