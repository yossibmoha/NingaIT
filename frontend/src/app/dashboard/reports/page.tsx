'use client';

import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Row,
  Col,
  Tabs,
  notification,
  Divider,
  TimePicker,
  Radio,
  Upload,
  Progress,
} from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  DownloadOutlined,
  ScheduleOutlined,
  BarChartOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface Report {
  id: string;
  name: string;
  type: string;
  description?: string;
  schedule?: string;
  lastRun?: string;
  nextRun?: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'active' | 'paused';
  recipients?: string[];
  createdBy: string;
  createdAt: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  dataPoints: string[];
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'device-inventory',
    name: 'Device Inventory Report',
    description: 'Comprehensive list of all devices with specifications',
    category: 'Devices',
    icon: <FileTextOutlined />,
    dataPoints: ['Device Name', 'Type', 'OS', 'CPU', 'Memory', 'Disk', 'Status', 'Last Seen'],
  },
  {
    id: 'alert-summary',
    name: 'Alert Summary Report',
    description: 'Summary of alerts by severity and status',
    category: 'Alerts',
    icon: <BarChartOutlined />,
    dataPoints: ['Alert Type', 'Severity', 'Count', 'Resolution Time', 'Affected Devices'],
  },
  {
    id: 'script-execution',
    name: 'Script Execution Report',
    description: 'History of script executions and results',
    category: 'Scripts',
    icon: <FileTextOutlined />,
    dataPoints: ['Script Name', 'Device', 'Status', 'Duration', 'Output', 'Executed By'],
  },
  {
    id: 'performance-metrics',
    name: 'Performance Metrics Report',
    description: 'Device performance metrics over time',
    category: 'Performance',
    icon: <BarChartOutlined />,
    dataPoints: ['Device', 'Avg CPU', 'Avg Memory', 'Avg Disk', 'Peak Usage', 'Uptime'],
  },
  {
    id: 'user-activity',
    name: 'User Activity Report',
    description: 'User login and activity tracking',
    category: 'Users',
    icon: <FileTextOutlined />,
    dataPoints: ['User', 'Role', 'Last Login', 'Actions Performed', 'Devices Accessed'],
  },
  {
    id: 'compliance',
    name: 'Compliance Report',
    description: 'Security and compliance status',
    category: 'Security',
    icon: <FileTextOutlined />,
    dataPoints: ['Device', 'Patch Status', 'Antivirus', 'Firewall', 'Last Scan', 'Issues'],
  },
];

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([
    {
      id: 'report-1',
      name: 'Daily Device Status',
      type: 'device-inventory',
      description: 'Daily report of all device statuses',
      schedule: 'daily',
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      nextRun: new Date(Date.now() + 82800000).toISOString(),
      format: 'pdf',
      status: 'active',
      recipients: ['admin@example.com'],
      createdBy: 'admin@example.com',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: 'report-2',
      name: 'Weekly Alert Summary',
      type: 'alert-summary',
      schedule: 'weekly',
      lastRun: new Date(Date.now() - 604800000).toISOString(),
      nextRun: new Date(Date.now() + 86400000).toISOString(),
      format: 'excel',
      status: 'active',
      recipients: ['team@example.com'],
      createdBy: 'admin@example.com',
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [builderVisible, setBuilderVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [form] = Form.useForm();
  const [builderForm] = Form.useForm();

  const handleCreateFromTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    form.setFieldsValue({
      name: template.name,
      type: template.id,
      format: 'pdf',
      status: 'active',
    });
    setModalVisible(true);
  };

  const handleCustomReport = () => {
    setSelectedTemplate(null);
    builderForm.resetFields();
    setBuilderVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      // TODO: Call API to create report
      notification.success({ message: 'Report created successfully' });
      setModalVisible(false);
      // Fetch reports
    } catch (error) {
      notification.error({
        message: 'Failed to create report',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleBuilderSubmit = async (values: any) => {
    try {
      // TODO: Call API to create custom report
      notification.success({ message: 'Custom report created successfully' });
      setBuilderVisible(false);
      // Fetch reports
    } catch (error) {
      notification.error({
        message: 'Failed to create custom report',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleRunReport = async (reportId: string) => {
    try {
      setLoading(true);
      // TODO: Call API to run report
      notification.success({ message: 'Report generated successfully' });
    } catch (error) {
      notification.error({
        message: 'Failed to generate report',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (reportId: string, format: string) => {
    // TODO: Implement export
    notification.info({ message: `Exporting report as ${format.toUpperCase()}...` });
  };

  const handleDeleteReport = (reportId: string) => {
    Modal.confirm({
      title: 'Delete Report',
      content: 'Are you sure you want to delete this report?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          // TODO: Call API to delete report
          notification.success({ message: 'Report deleted successfully' });
        } catch (error) {
          notification.error({
            message: 'Failed to delete report',
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    return status === 'active' ? (
      <Tag color="success">Active</Tag>
    ) : (
      <Tag color="default">Paused</Tag>
    );
  };

  const getFormatIcon = (format: string) => {
    const icons = {
      pdf: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
      excel: <FileExcelOutlined style={{ color: '#52c41a' }} />,
      csv: <FileTextOutlined style={{ color: '#1890ff' }} />,
      json: <FileTextOutlined style={{ color: '#722ed1' }} />,
    };
    return icons[format as keyof typeof icons] || <FileTextOutlined />;
  };

  const reportColumns: ColumnsType<Report> = [
    {
      title: 'Report Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space>
          {getFormatIcon(record.format)}
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            {record.description && (
              <div style={{ fontSize: '12px', color: '#999' }}>{record.description}</div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const template = REPORT_TEMPLATES.find((t) => t.id === type);
        return <Tag>{template?.category || 'Custom'}</Tag>;
      },
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule?: string) => (
        schedule ? (
          <Tag icon={<ClockCircleOutlined />}>{schedule}</Tag>
        ) : (
          <Tag>Manual</Tag>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRun',
      key: 'lastRun',
      render: (date?: string) => (date ? dayjs(date).fromNow() : 'Never'),
    },
    {
      title: 'Next Run',
      dataIndex: 'nextRun',
      key: 'nextRun',
      render: (date?: string) => (date ? dayjs(date).fromNow() : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleRunReport(record.id)}
            loading={loading}
          >
            Run
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleExport(record.id, record.format)}
          >
            Export
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteReport(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>
          <FileTextOutlined /> Reports & Analytics
        </h1>
        <p>Generate, schedule, and export comprehensive reports</p>
      </div>

      <Card>
        <Tabs defaultActiveKey="templates">
          <TabPane
            tab={
              <span>
                <FileTextOutlined /> Report Templates
              </span>
            }
            key="templates"
          >
            <Row gutter={[16, 16]}>
              {REPORT_TEMPLATES.map((template) => (
                <Col key={template.id} xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    actions={[
                      <Button
                        key="create"
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => handleCreateFromTemplate(template)}
                      >
                        Create Report
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      avatar={<div style={{ fontSize: '32px' }}>{template.icon}</div>}
                      title={template.name}
                      description={
                        <>
                          <p>{template.description}</p>
                          <Tag color="blue">{template.category}</Tag>
                          <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                            {template.dataPoints.length} data points
                          </div>
                        </>
                      }
                    />
                  </Card>
                </Col>
              ))}
              <Col xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  style={{
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={handleCustomReport}
                >
                  <div style={{ padding: '40px 0' }}>
                    <PlusOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    <h3 style={{ marginTop: '16px' }}>Custom Report</h3>
                    <p style={{ color: '#999' }}>Build your own custom report</p>
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <ScheduleOutlined /> My Reports ({reports.length})
              </span>
            }
            key="reports"
          >
            <Space style={{ marginBottom: '16px' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCustomReport}>
                Create Custom Report
              </Button>
            </Space>

            <Table
              columns={reportColumns}
              dataSource={reports}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Report Creation Modal */}
      <Modal
        title={`Create ${selectedTemplate?.name || 'Report'}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Report Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="e.g., Daily Device Status Report" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <TextArea rows={2} placeholder="Brief description of this report" />
          </Form.Item>

          <Divider>Data Range</Divider>

          <Form.Item label="Date Range" name="dateRange">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Filters" name="filters">
            <Select mode="multiple" placeholder="Select filters">
              <Select.Option value="status-online">Status: Online</Select.Option>
              <Select.Option value="status-offline">Status: Offline</Select.Option>
              <Select.Option value="type-server">Type: Server</Select.Option>
              <Select.Option value="type-workstation">Type: Workstation</Select.Option>
            </Select>
          </Form.Item>

          <Divider>Schedule & Delivery</Divider>

          <Form.Item label="Schedule" name="schedule">
            <Select placeholder="Select schedule">
              <Select.Option value="manual">Manual</Select.Option>
              <Select.Option value="daily">Daily</Select.Option>
              <Select.Option value="weekly">Weekly</Select.Option>
              <Select.Option value="monthly">Monthly</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Time" name="time">
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>

          <Form.Item label="Recipients" name="recipients">
            <Select mode="tags" placeholder="Enter email addresses">
              <Select.Option value="admin@example.com">admin@example.com</Select.Option>
              <Select.Option value="team@example.com">team@example.com</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Export Format" name="format" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio.Button value="pdf">
                <FilePdfOutlined /> PDF
              </Radio.Button>
              <Radio.Button value="excel">
                <FileExcelOutlined /> Excel
              </Radio.Button>
              <Radio.Button value="csv">
                <FileTextOutlined /> CSV
              </Radio.Button>
              <Radio.Button value="json">JSON</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Checkbox>Active (Enable automatic scheduling)</Checkbox>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Report
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Custom Report Builder Modal */}
      <Modal
        title="Custom Report Builder"
        open={builderVisible}
        onCancel={() => setBuilderVisible(false)}
        footer={null}
        width={900}
      >
        <Form form={builderForm} layout="vertical" onFinish={handleBuilderSubmit}>
          <Form.Item label="Report Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="e.g., Custom Performance Report" />
          </Form.Item>

          <Divider>Data Sources</Divider>

          <Form.Item label="Select Data Sources" name="dataSources" rules={[{ required: true }]}>
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={12}><Checkbox value="devices">Devices</Checkbox></Col>
                <Col span={12}><Checkbox value="alerts">Alerts</Checkbox></Col>
                <Col span={12}><Checkbox value="scripts">Scripts</Checkbox></Col>
                <Col span={12}><Checkbox value="users">Users</Checkbox></Col>
                <Col span={12}><Checkbox value="metrics">Performance Metrics</Checkbox></Col>
                <Col span={12}><Checkbox value="logs">Audit Logs</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item label="Columns" name="columns">
            <Select mode="multiple" placeholder="Select columns to include">
              <Select.Option value="device-name">Device Name</Select.Option>
              <Select.Option value="device-type">Device Type</Select.Option>
              <Select.Option value="status">Status</Select.Option>
              <Select.Option value="cpu">CPU Usage</Select.Option>
              <Select.Option value="memory">Memory Usage</Select.Option>
              <Select.Option value="disk">Disk Usage</Select.Option>
              <Select.Option value="last-seen">Last Seen</Select.Option>
            </Select>
          </Form.Item>

          <Divider>Formatting</Divider>

          <Form.Item label="Group By" name="groupBy">
            <Select placeholder="Group data by...">
              <Select.Option value="none">None</Select.Option>
              <Select.Option value="device-type">Device Type</Select.Option>
              <Select.Option value="status">Status</Select.Option>
              <Select.Option value="date">Date</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Sort By" name="sortBy">
            <Select placeholder="Sort data by...">
              <Select.Option value="name">Name</Select.Option>
              <Select.Option value="date">Date</Select.Option>
              <Select.Option value="status">Status</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Export Format" name="format" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio.Button value="pdf">PDF</Radio.Button>
              <Radio.Button value="excel">Excel</Radio.Button>
              <Radio.Button value="csv">CSV</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Custom Report
              </Button>
              <Button onClick={() => setBuilderVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

