'use client'

import { Card, Typography, Button, Space, Empty } from 'antd'
import { GiftOutlined, ShareAltOutlined, LinkOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function ReferPage() {
  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <GiftOutlined /> Refer a Friend
            </Title>
            <Text type="secondary">Earn rewards by referring new customers</Text>
          </div>
          <Space>
            <Button icon={<LinkOutlined />}>Copy Link</Button>
            <Button type="primary" icon={<ShareAltOutlined />}>Share</Button>
          </Space>
        </div>

        {/* Content */}
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="small">
                <Text strong>Referral Program Coming Soon</Text>
                <Text type="secondary">
                  This page will display your referral link, rewards, and referral statistics.
                </Text>
              </Space>
            }
          >
            <Button type="primary" icon={<ShareAltOutlined />}>Start Referring</Button>
          </Empty>
        </Card>
      </Space>
    </div>
  )
}

