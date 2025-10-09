'use client'

import { Card, Typography, Button, Space, Empty } from 'antd'
import { TeamOutlined, PlusOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function CustomersPage() {
  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <TeamOutlined /> Customers
            </Title>
            <Text type="secondary">Manage customer organizations and contacts</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />}>
            New Customer
          </Button>
        </div>

        {/* Content */}
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="small">
                <Text strong>Customer Management Coming Soon</Text>
                <Text type="secondary">
                  This page will display all customers, their contacts, and allow customer management.
                </Text>
              </Space>
            }
          >
            <Button type="primary" icon={<PlusOutlined />}>Add First Customer</Button>
          </Empty>
        </Card>
      </Space>
    </div>
  )
}

