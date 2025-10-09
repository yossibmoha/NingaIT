'use client'

import { Card, Typography, Button, Space, Empty } from 'antd'
import { BookOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function KnowledgeBasePage() {
  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <BookOutlined /> Knowledge Base
            </Title>
            <Text type="secondary">Documentation, guides, and troubleshooting articles</Text>
          </div>
          <Space>
            <Button icon={<SearchOutlined />}>Search Articles</Button>
            <Button type="primary" icon={<PlusOutlined />}>New Article</Button>
          </Space>
        </div>

        {/* Content */}
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="small">
                <Text strong>Knowledge Base Coming Soon</Text>
                <Text type="secondary">
                  This page will display documentation articles, guides, and FAQs.
                </Text>
              </Space>
            }
          >
            <Button type="primary" icon={<PlusOutlined />}>Create First Article</Button>
          </Empty>
        </Card>
      </Space>
    </div>
  )
}

