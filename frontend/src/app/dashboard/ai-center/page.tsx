'use client'

import { Card, Typography, Button, Space, Empty, Badge } from 'antd'
import { RobotOutlined, ThunderboltOutlined, SettingOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function AICenterPage() {
  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <RobotOutlined /> AI Center{' '}
              <Badge 
                count="New" 
                style={{ 
                  backgroundColor: '#52c41a',
                  marginLeft: 8,
                }}
              />
            </Title>
            <Text type="secondary">AI-powered monitoring, automation, and insights</Text>
          </div>
          <Space>
            <Button icon={<SettingOutlined />}>Configure AI</Button>
            <Button type="primary" icon={<ThunderboltOutlined />}>Enable AI</Button>
          </Space>
        </div>

        {/* Content */}
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="small">
                <Text strong>AI Center Coming Soon</Text>
                <Text type="secondary">
                  This page will display AI-powered insights, anomaly detection, and automated recommendations.
                </Text>
              </Space>
            }
          >
            <Button type="primary" icon={<ThunderboltOutlined />}>Activate AI Features</Button>
          </Empty>
        </Card>
      </Space>
    </div>
  )
}

