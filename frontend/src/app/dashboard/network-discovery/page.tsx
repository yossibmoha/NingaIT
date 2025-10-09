'use client'

import { Card, Typography, Button, Space, Empty } from 'antd'
import { ApiOutlined, ScanOutlined, SettingOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function NetworkDiscoveryPage() {
  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <ApiOutlined /> Network Discovery
            </Title>
            <Text type="secondary">Discover and monitor devices on your network</Text>
          </div>
          <Space>
            <Button icon={<SettingOutlined />}>Configure</Button>
            <Button type="primary" icon={<ScanOutlined />}>Start Scan</Button>
          </Space>
        </div>

        {/* Content */}
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="small">
                <Text strong>Network Discovery Coming Soon</Text>
                <Text type="secondary">
                  This page will display discovered devices, scan results, and network topology.
                </Text>
              </Space>
            }
          >
            <Button type="primary" icon={<ScanOutlined />}>Run Network Scan</Button>
          </Empty>
        </Card>
      </Space>
    </div>
  )
}

