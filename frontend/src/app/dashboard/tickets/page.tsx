'use client'

import { Card, Typography, Button, Space, Empty } from 'antd'
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function TicketsPage() {
  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <FileTextOutlined /> Tickets
            </Title>
            <Text type="secondary">Manage support tickets and requests</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />}>
            New Ticket
          </Button>
        </div>

        {/* Content */}
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="small">
                <Text strong>Tickets Management Coming Soon</Text>
                <Text type="secondary">
                  This page will display all support tickets, their status, and allow ticket management.
                </Text>
              </Space>
            }
          >
            <Button type="primary" icon={<PlusOutlined />}>Create First Ticket</Button>
          </Empty>
        </Card>
      </Space>
    </div>
  )
}

