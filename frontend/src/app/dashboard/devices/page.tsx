'use client'

import { useState } from 'react'
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Input, 
  Space, 
  Dropdown, 
  Typography,
  Badge,
  Tooltip,
  Modal,
  message
} from 'antd'
import {
  DesktopOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  GroupOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  WindowsOutlined,
  AppleOutlined,
  AndroidOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { Search } = Input

interface Device {
  key: string
  id: string
  hostname: string
  ip: string
  os: string
  status: 'online' | 'offline' | 'warning'
  cpu: number
  memory: number
  disk: number
  lastSeen: string
  agent: string
  group: string
}

// Mock data - will be replaced with API calls
const mockDevices: Device[] = [
  {
    key: '1',
    id: 'dev-001',
    hostname: 'WEB-SERVER-01',
    ip: '192.168.1.10',
    os: 'Ubuntu 22.04',
    status: 'online',
    cpu: 45,
    memory: 68,
    disk: 72,
    lastSeen: '2 minutes ago',
    agent: '0.1.0',
    group: 'Web Servers',
  },
  {
    key: '2',
    id: 'dev-002',
    hostname: 'DB-SERVER-01',
    ip: '192.168.1.11',
    os: 'Ubuntu 22.04',
    status: 'online',
    cpu: 32,
    memory: 82,
    disk: 65,
    lastSeen: '1 minute ago',
    agent: '0.1.0',
    group: 'Database Servers',
  },
  {
    key: '3',
    id: 'dev-003',
    hostname: 'APP-SERVER-01',
    ip: '192.168.1.12',
    os: 'Windows Server 2022',
    status: 'warning',
    cpu: 78,
    memory: 91,
    disk: 88,
    lastSeen: '5 minutes ago',
    agent: '0.1.0',
    group: 'Application Servers',
  },
  {
    key: '4',
    id: 'dev-004',
    hostname: 'BACKUP-SERVER',
    ip: '192.168.1.20',
    os: 'Ubuntu 22.04',
    status: 'online',
    cpu: 12,
    memory: 45,
    disk: 92,
    lastSeen: '3 minutes ago',
    agent: '0.1.0',
    group: 'Backup',
  },
  {
    key: '5',
    id: 'dev-005',
    hostname: 'WORKSTATION-05',
    ip: '192.168.2.15',
    os: 'macOS Sonoma',
    status: 'offline',
    cpu: 0,
    memory: 0,
    disk: 0,
    lastSeen: '2 hours ago',
    agent: '0.1.0',
    group: 'Workstations',
  },
]

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(mockDevices)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const handleRefresh = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      message.success('Devices refreshed')
      setLoading(false)
    }, 1000)
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    // Filter devices based on search
  }

  const getOSIcon = (os: string) => {
    if (os.includes('Windows')) return <WindowsOutlined style={{ color: '#00A4EF' }} />
    if (os.includes('macOS')) return <AppleOutlined style={{ color: '#000000' }} />
    if (os.includes('Ubuntu') || os.includes('Linux')) return <AndroidOutlined style={{ color: '#E95420' }} />
    return <DesktopOutlined />
  }

  const getStatusTag = (status: string) => {
    const colors = {
      online: 'success',
      offline: 'default',
      warning: 'warning',
    }
    const icons = {
      online: <CheckCircleOutlined />,
      offline: <CloseCircleOutlined />,
      warning: <ExclamationCircleOutlined />,
    }
    return (
      <Tag color={colors[status as keyof typeof colors]} icon={icons[status as keyof typeof icons]}>
        {status.toUpperCase()}
      </Tag>
    )
  }

  const getMetricColor = (value: number) => {
    if (value >= 90) return '#ff4d4f'
    if (value >= 75) return '#faad14'
    return '#52c41a'
  }

  const columns: ColumnsType<Device> = [
    {
      title: 'Device',
      dataIndex: 'hostname',
      key: 'hostname',
      sorter: (a, b) => a.hostname.localeCompare(b.hostname),
      render: (text, record) => (
        <Space>
          {getOSIcon(record.os)}
          <div>
            <div><Text strong>{text}</Text></div>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{record.ip}</Text></div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Online', value: 'online' },
        { text: 'Offline', value: 'offline' },
        { text: 'Warning', value: 'warning' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'CPU',
      dataIndex: 'cpu',
      key: 'cpu',
      sorter: (a, b) => a.cpu - b.cpu,
      render: (value) => (
        <Tooltip title={`${value}% CPU Usage`}>
          <Badge 
            color={getMetricColor(value)} 
            text={`${value}%`}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Memory',
      dataIndex: 'memory',
      key: 'memory',
      sorter: (a, b) => a.memory - b.memory,
      render: (value) => (
        <Tooltip title={`${value}% Memory Usage`}>
          <Badge 
            color={getMetricColor(value)} 
            text={`${value}%`}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Disk',
      dataIndex: 'disk',
      key: 'disk',
      sorter: (a, b) => a.disk - b.disk,
      render: (value) => (
        <Tooltip title={`${value}% Disk Usage`}>
          <Badge 
            color={getMetricColor(value)} 
            text={`${value}%`}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Group',
      dataIndex: 'group',
      key: 'group',
      filters: [
        { text: 'Web Servers', value: 'Web Servers' },
        { text: 'Database Servers', value: 'Database Servers' },
        { text: 'Application Servers', value: 'Application Servers' },
        { text: 'Workstations', value: 'Workstations' },
      ],
      onFilter: (value, record) => record.group === value,
      render: (group) => <Tag icon={<GroupOutlined />}>{group}</Tag>,
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <DesktopOutlined />,
                label: 'View Details',
                onClick: () => message.info(`View ${record.hostname}`),
              },
              {
                key: 'script',
                icon: <PlayCircleOutlined />,
                label: 'Run Script',
                onClick: () => message.info(`Run script on ${record.hostname}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => message.info(`Edit ${record.hostname}`),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => {
                  Modal.confirm({
                    title: 'Delete Device',
                    content: `Are you sure you want to delete ${record.hostname}?`,
                    okText: 'Delete',
                    okType: 'danger',
                    onOk: () => message.success('Device deleted'),
                  })
                },
              },
            ],
          }}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
  }

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>Devices</Title>
            <Text type="secondary">Manage and monitor all your devices</Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />}>
              Add Device
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        <Card>
          <Space size="large" style={{ width: '100%', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a' }}>
                {devices.filter(d => d.status === 'online').length}
              </div>
              <div style={{ color: '#8c8c8c' }}>Online</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#faad14' }}>
                {devices.filter(d => d.status === 'warning').length}
              </div>
              <div style={{ color: '#8c8c8c' }}>Warning</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#8c8c8c' }}>
                {devices.filter(d => d.status === 'offline').length}
              </div>
              <div style={{ color: '#8c8c8c' }}>Offline</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 'bold' }}>
                {devices.length}
              </div>
              <div style={{ color: '#8c8c8c' }}>Total</div>
            </div>
          </Space>
        </Card>

        {/* Search and Filters */}
        <Card>
          <Space size="middle" style={{ width: '100%' }}>
            <Search
              placeholder="Search devices..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              style={{ width: 400 }}
            />
            {selectedRowKeys.length > 0 && (
              <Text type="secondary">{selectedRowKeys.length} device(s) selected</Text>
            )}
          </Space>
        </Card>

        {/* Devices Table */}
        <Card>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={devices}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} devices`,
            }}
          />
        </Card>
      </Space>
    </div>
  )
}

