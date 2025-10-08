'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Card,
  Drawer,
  Descriptions,
  Modal,
  Form,
  InputNumber,
  Switch,
  notification,
  Tabs,
  Badge,
  Statistic,
  Row,
  Col,
  Empty,
  Tooltip,
} from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface Alert {
  id: string;
  ruleId: string;
  ruleName?: string;
  deviceId: string;
  deviceName?: string;
  metric: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  currentValue: number;
  threshold: number;
  condition: string;
  triggeredAt: string;
  resolvedAt?: string;
  isResolved: boolean;
  resolvedBy?: string;
  notes?: string;
}

interface AlertRule {
  id: string;
  name: string;
  deviceId?: string;
  deviceName?: string;
  metric: 'cpu' | 'memory' | 'disk' | 'network' | 'uptime';
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration?: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  notificationChannels: string[];
  cooldown?: number;
}

interface NotificationChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'push';
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}

export default function AlertsPage() {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [channelModalVisible, setChannelModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [editingChannel, setEditingChannel | null>(null);
  const [form] = Form.useForm();
  const [channelForm] = Form.useForm();

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<'resolved' | 'active'>('active');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  useEffect(() => {
    fetchAlerts();
    fetchRules();
    fetchChannels();
  }, [severityFilter, statusFilter, searchText, dateRange]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockAlerts: Alert[] = [
        {
          id: 'alert-1',
          ruleId: 'rule-1',
          ruleName: 'High CPU Usage',
          deviceId: 'dev-001',
          deviceName: 'Server-Prod-001',
          metric: 'cpu',
          severity: 'critical',
          message: 'CPU usage above 90% for 5 minutes',
          currentValue: 92.5,
          threshold: 90,
          condition: 'greater than',
          triggeredAt: new Date(Date.now() - 300000).toISOString(),
          isResolved: false,
        },
        {
          id: 'alert-2',
          ruleId: 'rule-2',
          ruleName: 'High Memory Usage',
          deviceId: 'dev-002',
          deviceName: 'Workstation-002',
          metric: 'memory',
          severity: 'warning',
          message: 'Memory usage above 80%',
          currentValue: 85.2,
          threshold: 80,
          condition: 'greater than',
          triggeredAt: new Date(Date.now() - 3600000).toISOString(),
          resolvedAt: new Date(Date.now() - 1800000).toISOString(),
          isResolved: true,
          resolvedBy: 'admin@example.com',
        },
        {
          id: 'alert-3',
          ruleId: 'rule-3',
          ruleName: 'Low Disk Space',
          deviceId: 'dev-003',
          deviceName: 'Database-Server',
          metric: 'disk',
          severity: 'error',
          message: 'Disk usage above 90%',
          currentValue: 92.1,
          threshold: 90,
          condition: 'greater than',
          triggeredAt: new Date(Date.now() - 7200000).toISOString(),
          isResolved: false,
        },
      ];

      setAlerts(mockAlerts);
    } catch (error) {
      notification.error({
        message: 'Failed to fetch alerts',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      // TODO: Replace with actual API call
      const mockRules: AlertRule[] = [
        {
          id: 'rule-1',
          name: 'High CPU Usage',
          metric: 'cpu',
          condition: 'gt',
          threshold: 90,
          duration: 300,
          severity: 'critical',
          enabled: true,
          notificationChannels: ['channel-1'],
          cooldown: 600,
        },
        {
          id: 'rule-2',
          name: 'High Memory Usage',
          deviceId: 'dev-002',
          deviceName: 'Workstation-002',
          metric: 'memory',
          condition: 'gt',
          threshold: 80,
          severity: 'warning',
          enabled: true,
          notificationChannels: ['channel-1', 'channel-2'],
        },
      ];

      setRules(mockRules);
    } catch (error) {
      notification.error({
        message: 'Failed to fetch rules',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const fetchChannels = async () => {
    try {
      // TODO: Replace with actual API call
      const mockChannels: NotificationChannel[] = [
        {
          id: 'channel-1',
          type: 'email',
          name: 'Admin Email',
          enabled: true,
          config: { recipients: ['admin@example.com'] },
        },
        {
          id: 'channel-2',
          type: 'slack',
          name: 'DevOps Slack',
          enabled: true,
          config: { webhook: 'https://hooks.slack.com/...' },
        },
      ];

      setChannels(mockChannels);
    } catch (error) {
      notification.error({
        message: 'Failed to fetch notification channels',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    Modal.confirm({
      title: 'Resolve Alert',
      content: 'Are you sure you want to resolve this alert?',
      onOk: async () => {
        try {
          // TODO: Replace with actual API call
          notification.success({ message: 'Alert resolved successfully' });
          fetchAlerts();
        } catch (error) {
          notification.error({
            message: 'Failed to resolve alert',
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
    });
  };

  const handleDeleteAlert = async (alertId: string) => {
    Modal.confirm({
      title: 'Delete Alert',
      content: 'Are you sure you want to delete this alert?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          // TODO: Replace with actual API call
          notification.success({ message: 'Alert deleted successfully' });
          fetchAlerts();
        } catch (error) {
          notification.error({
            message: 'Failed to delete alert',
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
    });
  };

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setDrawerVisible(true);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      info: 'blue',
      warning: 'orange',
      error: 'red',
      critical: 'red',
    };
    return colors[severity as keyof typeof colors] || 'default';
  };

  const getSeverityIcon = (severity: string) => {
    const icons = {
      info: <BellOutlined />,
      warning: <WarningOutlined />,
      error: <CloseCircleOutlined />,
      critical: <CloseCircleOutlined />,
    };
    return icons[severity as keyof typeof icons] || <BellOutlined />;
  };

  const alertColumns: ColumnsType<Alert> = [
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 120,
      render: (severity: string) => (
        <Tag icon={getSeverityIcon(severity)} color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Critical', value: 'critical' },
        { text: 'Error', value: 'error' },
        { text: 'Warning', value: 'warning' },
        { text: 'Info', value: 'info' },
      ],
      onFilter: (value, record) => record.severity === value,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Device',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 180,
    },
    {
      title: 'Metric',
      dataIndex: 'metric',
      key: 'metric',
      width: 100,
      render: (metric: string) => <Tag>{metric.toUpperCase()}</Tag>,
    },
    {
      title: 'Value / Threshold',
      key: 'values',
      width: 150,
      render: (_, record) => `${record.currentValue} / ${record.threshold}`,
    },
    {
      title: 'Triggered',
      dataIndex: 'triggeredAt',
      key: 'triggeredAt',
      width: 150,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          {dayjs(date).fromNow()}
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.triggeredAt).getTime() - new Date(b.triggeredAt).getTime(),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, record) =>
        record.isResolved ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Resolved
          </Tag>
        ) : (
          <Tag icon={<WarningOutlined />} color="error">
            Active
          </Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewAlert(record)}
          >
            View
          </Button>
          {!record.isResolved && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleResolveAlert(record.id)}
            >
              Resolve
            </Button>
          )}
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAlert(record.id)}
          />
        </Space>
      ),
    },
  ];

  const ruleColumns: ColumnsType<AlertRule> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Device',
      dataIndex: 'deviceName',
      key: 'deviceName',
      render: (name) => name || <Tag>All Devices</Tag>,
    },
    {
      title: 'Metric',
      dataIndex: 'metric',
      key: 'metric',
      render: (metric) => <Tag>{metric.toUpperCase()}</Tag>,
    },
    {
      title: 'Condition',
      key: 'condition',
      render: (_, record) => `${record.condition} ${record.threshold}`,
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>{severity.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled) =>
        enabled ? (
          <Tag color="success">Enabled</Tag>
        ) : (
          <Tag color="default">Disabled</Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => {
              setEditingRule(record);
              form.setFieldsValue(record);
              setRuleModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Delete Rule',
                content: 'Are you sure you want to delete this rule?',
                okText: 'Delete',
                okType: 'danger',
                onOk: () => {
                  notification.success({ message: 'Rule deleted successfully' });
                  fetchRules();
                },
              });
            }}
          />
        </Space>
      ),
    },
  ];

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter && alert.severity !== severityFilter) return false;
    if (statusFilter === 'active' && alert.isResolved) return false;
    if (statusFilter === 'resolved' && !alert.isResolved) return false;
    if (searchText && !alert.message.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    return true;
  });

  const stats = {
    total: alerts.length,
    active: alerts.filter((a) => !a.isResolved).length,
    critical: alerts.filter((a) => a.severity === 'critical' && !a.isResolved).length,
    warning: alerts.filter((a) => a.severity === 'warning' && !a.isResolved).length,
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>
          <BellOutlined /> Alerts & Notifications
        </h1>
        <p>Monitor and manage system alerts and notification rules</p>
      </div>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Alerts"
              value={stats.total}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Alerts"
              value={stats.active}
              valueStyle={{ color: '#cf1322' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Critical"
              value={stats.critical}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Warnings"
              value={stats.warning}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="alerts">
          <TabPane
            tab={
              <span>
                <Badge count={stats.active} offset={[10, 0]}>
                  <BellOutlined /> Alerts
                </Badge>
              </span>
            }
            key="alerts"
          >
            <Space style={{ marginBottom: '16px', width: '100%' }} direction="vertical">
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <Input
                    placeholder="Search alerts..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                  />
                  <Select
                    placeholder="Severity"
                    value={severityFilter}
                    onChange={setSeverityFilter}
                    allowClear
                    style={{ width: 150 }}
                  >
                    <Select.Option value="critical">Critical</Select.Option>
                    <Select.Option value="error">Error</Select.Option>
                    <Select.Option value="warning">Warning</Select.Option>
                    <Select.Option value="info">Info</Select.Option>
                  </Select>
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 150 }}
                  >
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="resolved">Resolved</Select.Option>
                  </Select>
                </Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchAlerts}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Space>
            </Space>

            <Table
              columns={alertColumns}
              dataSource={filteredAlerts}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined /> Rules ({rules.length})
              </span>
            }
            key="rules"
          >
            <Space style={{ marginBottom: '16px' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingRule(null);
                  form.resetFields();
                  setRuleModalVisible(true);
                }}
              >
                Create Rule
              </Button>
            </Space>

            <Table
              columns={ruleColumns}
              dataSource={rules}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <BellOutlined /> Channels ({channels.length})
              </span>
            }
            key="channels"
          >
            <Space style={{ marginBottom: '16px' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingChannel(null);
                  channelForm.resetFields();
                  setChannelModalVisible(true);
                }}
              >
                Add Channel
              </Button>
            </Space>

            {channels.length === 0 ? (
              <Empty description="No notification channels configured" />
            ) : (
              <Row gutter={[16, 16]}>
                {channels.map((channel) => (
                  <Col span={8} key={channel.id}>
                    <Card
                      title={channel.name}
                      extra={
                        <Tag color={channel.enabled ? 'success' : 'default'}>
                          {channel.enabled ? 'Enabled' : 'Disabled'}
                        </Tag>
                      }
                      actions={[
                        <Button key="test" type="link">
                          Test
                        </Button>,
                        <Button key="edit" type="link">
                          Edit
                        </Button>,
                        <Button key="delete" type="link" danger>
                          Delete
                        </Button>,
                      ]}
                    >
                      <p>
                        <strong>Type:</strong> {channel.type}
                      </p>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* Alert Details Drawer */}
      <Drawer
        title="Alert Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        {selectedAlert && (
          <>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Severity">
                <Tag icon={getSeverityIcon(selectedAlert.severity)} color={getSeverityColor(selectedAlert.severity)}>
                  {selectedAlert.severity.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Message">
                {selectedAlert.message}
              </Descriptions.Item>
              <Descriptions.Item label="Device">
                {selectedAlert.deviceName || selectedAlert.deviceId}
              </Descriptions.Item>
              <Descriptions.Item label="Metric">
                <Tag>{selectedAlert.metric.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Current Value">
                {selectedAlert.currentValue}
              </Descriptions.Item>
              <Descriptions.Item label="Threshold">
                {selectedAlert.threshold} ({selectedAlert.condition})
              </Descriptions.Item>
              <Descriptions.Item label="Triggered At">
                {dayjs(selectedAlert.triggeredAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              {selectedAlert.isResolved && (
                <>
                  <Descriptions.Item label="Resolved At">
                    {dayjs(selectedAlert.resolvedAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Resolved By">
                    {selectedAlert.resolvedBy}
                  </Descriptions.Item>
                  {selectedAlert.notes && (
                    <Descriptions.Item label="Notes">
                      {selectedAlert.notes}
                    </Descriptions.Item>
                  )}
                </>
              )}
            </Descriptions>

            {!selectedAlert.isResolved && (
              <div style={{ marginTop: '24px' }}>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    handleResolveAlert(selectedAlert.id);
                    setDrawerVisible(false);
                  }}
                  block
                >
                  Resolve Alert
                </Button>
              </div>
            )}
          </>
        )}
      </Drawer>

      {/* Rule Modal - Placeholder */}
      <Modal
        title={editingRule ? 'Edit Rule' : 'Create Rule'}
        open={ruleModalVisible}
        onCancel={() => setRuleModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Rule Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="e.g., High CPU Usage" />
          </Form.Item>
          <Form.Item label="Metric" name="metric" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="cpu">CPU</Select.Option>
              <Select.Option value="memory">Memory</Select.Option>
              <Select.Option value="disk">Disk</Select.Option>
              <Select.Option value="network">Network</Select.Option>
              <Select.Option value="uptime">Uptime</Select.Option>
            </Select>
          </Form.Item>
          <Space>
            <Form.Item label="Condition" name="condition" rules={[{ required: true }]}>
              <Select style={{ width: 150 }}>
                <Select.Option value="gt">Greater Than</Select.Option>
                <Select.Option value="gte">Greater or Equal</Select.Option>
                <Select.Option value="lt">Less Than</Select.Option>
                <Select.Option value="lte">Less or Equal</Select.Option>
                <Select.Option value="eq">Equal</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Threshold" name="threshold" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} />
            </Form.Item>
          </Space>
          <Form.Item label="Severity" name="severity" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="info">Info</Select.Option>
              <Select.Option value="warning">Warning</Select.Option>
              <Select.Option value="error">Error</Select.Option>
              <Select.Option value="critical">Critical</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Enabled" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRule ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setRuleModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

