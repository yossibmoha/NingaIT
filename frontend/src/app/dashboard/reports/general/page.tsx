'use client'

import { Card, Typography, Button, Space, Empty } from 'antd'
import { BarChartOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function GeneralReportsPage() {
  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <BarChartOutlined /> General Reports
            </Title>
            <Text type="secondary">General system and performance reports</Text>
          </div>
          <Space>
            <Button icon={<DownloadOutlined />}>Export</Button>
            <Button type="primary" icon={<PlusOutlined />}>New Report</Button>
          </Space>
        </div>
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="General Reports Coming Soon"
          >
            <Button type="primary">Create Report</Button>
          </Empty>
        </Card>
      </Space>
    </div>
  )
}

