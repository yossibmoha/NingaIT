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
  message,
  Switch,
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
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  WindowsOutlined,
  AppleOutlined,
  AndroidOutlined,
  StarOutlined,
  StarFilled,
  RobotOutlined,
  WarningOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  FilterOutlined,
  CustomerServiceOutlined,
  FolderOutlined,
  BellOutlined,
  CloudDownloadOutlined,
  PoweroffOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import type { ColumnsType, TableProps } from 'antd/es/table'

const { Title, Text } = Typography
const { Search } = Input

interface Device {
  key: string
  id: string
  hostname: string
  ip: string
  os: string
  deviceType: 'Mac' | 'PC' | 'Server' | 'Linux' | 'Mobile'
  status: 'online' | 'offline' | 'warning'
  lastLogin: string
  customer: string
  folder: string
  alerts: {
    critical: number
    warning: number
    info: number
  }
  availablePatches: number
  pendingReboot: boolean
  remoteAccess: boolean
  hasAI: boolean
  isFavorite: boolean
  agent: string
}

// Mock data - will be replaced with API calls
const mockDevices: Device[] = [
  {
    key: '1',
    id: 'dev-001',
    hostname: 'MacBook-Pro-al-Yossef',
    ip: '192.168.1.10',
    os: 'macOS Sonoma 14.2',
    deviceType: 'Mac',
    status: 'offline',
    lastLogin: 'yossefbar',
    customer: 'Unassigned',
    folder: 'Default',
    alerts: { critical: 0, warning: 1, info: 0 },
    availablePatches: 3,
    pendingReboot: false,
    remoteAccess: true,
    hasAI: true,
    isFavorite: true,
    agent: '0.1.0',
  },
  {
    key: '2',
    id: 'dev-002',
    hostname: 'WEB-SERVER-01',
    ip: '192.168.1.11',
    os: 'Ubuntu 22.04 LTS',
    deviceType: 'Server',
    status: 'online',
    lastLogin: 'admin',
    customer: 'Acme Corp',
    folder: 'Production',
    alerts: { critical: 0, warning: 0, info: 2 },
    availablePatches: 5,
    pendingReboot: true,
    remoteAccess: true,
    hasAI: false,
    isFavorite: false,
    agent: '0.1.0',
  },
  {
    key: '3',
    id: 'dev-003',
    hostname: 'WORKSTATION-05',
    ip: '192.168.2.15',
    os: 'Windows 11 Pro',
    deviceType: 'PC',
    status: 'online',
    lastLogin: 'john.doe',
    customer: 'TechStart Inc',
    folder: 'Workstations',
    alerts: { critical: 1, warning: 2, info: 1 },
    availablePatches: 8,
    pendingReboot: false,
    remoteAccess: false,
    hasAI: true,
    isFavorite: true,
    agent: '0.1.0',
  },
  {
    key: '4',
    id: 'dev-004',
    hostname: 'DB-SERVER-PRIMARY',
    ip: '192.168.1.20',
    os: 'Ubuntu 22.04 LTS',
    deviceType: 'Server',
    status: 'online',
    lastLogin: 'dbadmin',
    customer: 'Acme Corp',
    folder: 'Production',
    alerts: { critical: 0, warning: 1, info: 0 },
    availablePatches: 2,
    pendingReboot: false,
    remoteAccess: true,
    hasAI: false,
    isFavorite: false,
    agent: '0.1.0',
  },
  {
    key: '5',
    id: 'dev-005',
    hostname: 'LAPTOP-SALES-03',
    ip: '192.168.3.45',
    os: 'Windows 11 Pro',
    deviceType: 'PC',
    status: 'warning',
    lastLogin: 'jane.smith',
    customer: 'TechStart Inc',
    folder: 'Sales',
    alerts: { critical: 2, warning: 3, info: 0 },
    availablePatches: 12,
    pendingReboot: true,
    remoteAccess: true,
    hasAI: true,
    isFavorite: false,
    agent: '0.1.0',
  },
]

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(mockDevices)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [filteredInfo, setFilteredInfo] = useState<Record<string, any>>({})
  const [sortedInfo, setSortedInfo] = useState<Record<string, any>>({})

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

  const handleTableChange: TableProps<Device>['onChange'] = (pagination, filters, sorter) => {
    setFilteredInfo(filters)
    setSortedInfo(sorter as any)
  }

  const toggleFavorite = (key: string) => {
    setDevices(devices.map(d => 
      d.key === key ? { ...d, isFavorite: !d.isFavorite } : d
    ))
  }

  const getOSIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'Mac':
        return <AppleOutlined style={{ fontSize: 16, color: '#000000' }} />
      case 'PC':
        return <WindowsOutlined style={{ fontSize: 16, color: '#00A4EF' }} />
      case 'Server':
        return <DesktopOutlined style={{ fontSize: 16, color: '#52c41a' }} />
      case 'Linux':
        return <AndroidOutlined style={{ fontSize: 16, color: '#E95420' }} />
      default:
        return <DesktopOutlined style={{ fontSize: 16 }} />
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      online: { color: 'success', text: 'Online', icon: <CheckCircleOutlined /> },
      offline: { color: 'error', text: 'Offline', icon: <CloseCircleOutlined /> },
      warning: { color: 'warning', text: 'Warning', icon: <ExclamationCircleOutlined /> },
    }
    const { color, text } = config[status as keyof typeof config]
    return <Badge status={color as any} text={text} />
  }

  const columns: ColumnsType<Device> = [
    {
      title: 'Device',
      dataIndex: 'hostname',
      key: 'hostname',
      sorter: (a, b) => a.hostname.localeCompare(b.hostname),
      sortOrder: sortedInfo.columnKey === 'hostname' ? sortedInfo.order : null,
      render: (text, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={record.isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={() => toggleFavorite(record.key)}
          />
          {getOSIcon(record.deviceType)}
          {record.hasAI && (
            <Tooltip title="AI-Powered Monitoring">
              <RobotOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
          <div>
            <div>
              <Text strong>{text}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{record.ip}</Text>
            </div>
          </div>
        </Space>
      ),
      width: 300,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      sorter: (a, b) => a.lastLogin.localeCompare(b.lastLogin),
      sortOrder: sortedInfo.columnKey === 'lastLogin' ? sortedInfo.order : null,
      width: 120,
    },
    {
      title: 'Availability',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Online', value: 'online' },
        { text: 'Offline', value: 'offline' },
        { text: 'Warning', value: 'warning' },
      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
      render: (status) => getStatusBadge(status),
      width: 120,
    },
    {
      title: 'Device Type',
      dataIndex: 'deviceType',
      key: 'deviceType',
      filters: [
        { text: 'Mac', value: 'Mac' },
        { text: 'PC', value: 'PC' },
        { text: 'Server', value: 'Server' },
        { text: 'Linux', value: 'Linux' },
      ],
      filteredValue: filteredInfo.deviceType || null,
      onFilter: (value, record) => record.deviceType === value,
      render: (type) => <Tag>{type}</Tag>,
      width: 100,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      sorter: (a, b) => a.customer.localeCompare(b.customer),
      sortOrder: sortedInfo.columnKey === 'customer' ? sortedInfo.order : null,
      filters: Array.from(new Set(mockDevices.map(d => d.customer))).map(c => ({ text: c, value: c })),
      filteredValue: filteredInfo.customer || null,
      onFilter: (value, record) => record.customer === value,
      render: (customer) => (
        <Text style={{ color: customer === 'Unassigned' ? '#1890ff' : undefined }}>
          {customer}
        </Text>
      ),
      width: 150,
    },
    {
      title: 'Folder',
      dataIndex: 'folder',
      key: 'folder',
      filters: Array.from(new Set(mockDevices.map(d => d.folder))).map(f => ({ text: f, value: f })),
      filteredValue: filteredInfo.folder || null,
      onFilter: (value, record) => record.folder === value,
      render: (folder) => (
        <Space size="small">
          <FolderOutlined style={{ color: '#8c8c8c' }} />
          <Text>{folder}</Text>
        </Space>
      ),
      width: 120,
    },
    {
      title: 'Alerts',
      key: 'alerts',
      render: (_, record) => {
        const { critical, warning, info } = record.alerts
        const total = critical + warning + info
        return (
          <Space size="small">
            {critical > 0 && (
              <Tooltip title={`${critical} Critical Alert${critical > 1 ? 's' : ''}`}>
                <Badge count={critical} style={{ backgroundColor: '#ff4d4f' }} />
              </Tooltip>
            )}
            {warning > 0 && (
              <Tooltip title={`${warning} Warning${warning > 1 ? 's' : ''}`}>
                <Badge count={warning} style={{ backgroundColor: '#faad14' }} />
              </Tooltip>
            )}
            {info > 0 && (
              <Tooltip title={`${info} Info Alert${info > 1 ? 's' : ''}`}>
                <Badge count={info} style={{ backgroundColor: '#1890ff' }} />
              </Tooltip>
            )}
            {total === 0 && <Text type="secondary">0</Text>}
          </Space>
        )
      },
      sorter: (a, b) => {
        const totalA = a.alerts.critical + a.alerts.warning + a.alerts.info
        const totalB = b.alerts.critical + b.alerts.warning + b.alerts.info
        return totalA - totalB
      },
      sortOrder: sortedInfo.columnKey === 'alerts' ? sortedInfo.order : null,
      width: 100,
    },
    {
      title: 'Available Patches',
      dataIndex: 'availablePatches',
      key: 'availablePatches',
      sorter: (a, b) => a.availablePatches - b.availablePatches,
      sortOrder: sortedInfo.columnKey === 'availablePatches' ? sortedInfo.order : null,
      render: (patches) => (
        patches > 0 ? (
          <Tooltip title={`${patches} patch${patches > 1 ? 'es' : ''} available`}>
            <Badge 
              count={patches} 
              style={{ backgroundColor: patches > 5 ? '#faad14' : '#52c41a' }}
              showZero
            />
          </Tooltip>
        ) : (
          <Text type="secondary">0</Text>
        )
      ),
      width: 130,
    },
    {
      title: 'Pending Reboot',
      dataIndex: 'pendingReboot',
      key: 'pendingReboot',
      filters: [
        { text: 'Yes', value: true },
        { text: 'No', value: false },
      ],
      filteredValue: filteredInfo.pendingReboot || null,
      onFilter: (value, record) => record.pendingReboot === value,
      render: (pending) => (
        pending ? (
          <Tooltip title="Reboot required">
            <PoweroffOutlined style={{ color: '#faad14' }} />
          </Tooltip>
        ) : null
      ),
      width: 120,
      align: 'center',
    },
    {
      title: 'Remote Access',
      dataIndex: 'remoteAccess',
      key: 'remoteAccess',
      filters: [
        { text: 'Enabled', value: true },
        { text: 'Disabled', value: false },
      ],
      filteredValue: filteredInfo.remoteAccess || null,
      onFilter: (value, record) => record.remoteAccess === value,
      render: (enabled) => (
        enabled ? (
          <Tooltip title="Remote access enabled">
            <LinkOutlined style={{ color: '#52c41a' }} />
          </Tooltip>
        ) : null
      ),
      width: 120,
      align: 'center',
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 50,
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
                key: 'connect',
                icon: <LinkOutlined />,
                label: 'Remote Connect',
                disabled: !record.remoteAccess,
                onClick: () => message.info(`Connecting to ${record.hostname}`),
              },
              {
                key: 'script',
                icon: <PlayCircleOutlined />,
                label: 'Run Script',
                onClick: () => message.info(`Run script on ${record.hostname}`),
              },
              {
                key: 'patches',
                icon: <CloudDownloadOutlined />,
                label: 'Install Patches',
                disabled: record.availablePatches === 0,
                onClick: () => message.info(`Installing patches on ${record.hostname}`),
              },
              {
                key: 'reboot',
                icon: <PoweroffOutlined />,
                label: 'Reboot Device',
                onClick: () => message.info(`Rebooting ${record.hostname}`),
              },
              {
                type: 'divider',
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => message.info(`Edit ${record.hostname}`),
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
          <Button type="text" icon={<MoreOutlined />} />
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

  const clearFilters = () => {
    setFilteredInfo({})
  }

  const clearSort = () => {
    setSortedInfo({})
  }

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <DesktopOutlined /> Devices
            </Title>
            <Text type="secondary">
              Displaying {devices.length} of {devices.length} devices | {selectedRowKeys.length} selected
            </Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              Refresh
            </Button>
            <Button icon={<FilterOutlined />} onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button type="primary" icon={<PlusOutlined />}>
              New Device
            </Button>
          </Space>
        </div>

        {/* Toolbar */}
        <Card size="small">
          <Space size="middle" style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Search
              placeholder="Describe what you want to filter"
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onSearch={handleSearch}
              style={{ width: 400 }}
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            />
            <Space>
              <Button icon={<ThunderboltOutlined />}>Ask</Button>
              <Button icon={<CustomerServiceOutlined />}>Customers</Button>
              <Button icon={<StarOutlined />}>Favorite</Button>
              <Button icon={<FilterOutlined />}>Filters</Button>
            </Space>
          </Space>
        </Card>

        {/* Bulk Actions */}
        {selectedRowKeys.length > 0 && (
          <Card size="small">
            <Space>
              <Text strong>{selectedRowKeys.length} device(s) selected</Text>
              <Button size="small" icon={<PlayCircleOutlined />}>
                Run Script
              </Button>
              <Button size="small" icon={<CloudDownloadOutlined />}>
                Install Patches
              </Button>
              <Button size="small" icon={<PoweroffOutlined />}>
                Reboot
              </Button>
              <Button size="small" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Space>
          </Card>
        )}

        {/* Devices Table */}
        <Card>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={devices}
            loading={loading}
            onChange={handleTableChange}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} devices`,
            }}
            scroll={{ x: 1500 }}
            size="middle"
          />
        </Card>
      </Space>
    </div>
  )
}
