'use client'

import { Card, Typography, Button, Space, Empty } from 'antd'
import { DollarOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function BillingPage() {
  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <DollarOutlined /> Billing
            </Title>
            <Text type="secondary">Manage invoices, payments, and billing settings</Text>
          </div>
          <Space>
            <Button icon={<DownloadOutlined />}>Export</Button>
            <Button type="primary" icon={<FileTextOutlined />}>New Invoice</Button>
          </Space>
        </div>

        {/* Content */}
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="small">
                <Text strong>Billing Management Coming Soon</Text>
                <Text type="secondary">
                  This page will display invoices, payment history, and billing configuration.
                </Text>
              </Space>
            }
          >
            <Button type="primary" icon={<FileTextOutlined />}>Create First Invoice</Button>
          </Empty>
        </Card>
      </Space>
    </div>
  )
}

