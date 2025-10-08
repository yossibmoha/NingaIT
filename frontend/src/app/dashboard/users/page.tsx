'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  Card,
  Drawer,
  Descriptions,
  Switch,
  Transfer,
  Tabs,
  notification,
  Badge,
  Avatar,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  LockOutlined,
  TeamOutlined,
  SafetyOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { TransferDirection } from 'antd/es/transfer';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  phone?: string;
  avatar?: string;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

const AVAILABLE_PERMISSIONS = [
  { key: 'devices.view', title: 'View Devices' },
  { key: 'devices.create', title: 'Create Devices' },
  { key: 'devices.edit', title: 'Edit Devices' },
  { key: 'devices.delete', title: 'Delete Devices' },
  { key: 'alerts.view', title: 'View Alerts' },
  { key: 'alerts.manage', title: 'Manage Alerts' },
  { key: 'scripts.view', title: 'View Scripts' },
  { key: 'scripts.execute', title: 'Execute Scripts' },
  { key: 'scripts.manage', title: 'Manage Scripts' },
  { key: 'users.view', title: 'View Users' },
  { key: 'users.manage', title: 'Manage Users' },
  { key: 'roles.view', title: 'View Roles' },
  { key: 'roles.manage', title: 'Manage Roles' },
  { key: 'reports.view', title: 'View Reports' },
  { key: 'reports.create', title: 'Create Reports' },
  { key: 'settings.view', title: 'View Settings' },
  { key: 'settings.manage', title: 'Manage Settings' },
];

export default function UsersPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [userForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockUsers: User[] = [
        {
          id: 'user-1',
          email: 'admin@example.com',
          firstName: 'John',
          lastName: 'Admin',
          role: 'Administrator',
          status: 'active',
          lastLogin: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          phone: '+1234567890',
          permissions: AVAILABLE_PERMISSIONS.map((p) => p.key),
        },
        {
          id: 'user-2',
          email: 'technician@example.com',
          firstName: 'Jane',
          lastName: 'Tech',
          role: 'Technician',
          status: 'active',
          lastLogin: new Date(Date.now() - 7200000).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          permissions: ['devices.view', 'alerts.view', 'scripts.view', 'scripts.execute'],
        },
        {
          id: 'user-3',
          email: 'viewer@example.com',
          firstName: 'Bob',
          lastName: 'Viewer',
          role: 'Viewer',
          status: 'inactive',
          lastLogin: new Date(Date.now() - 86400000 * 7).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
          permissions: ['devices.view', 'alerts.view'],
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      notification.error({
        message: 'Failed to fetch users',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      // TODO: Replace with actual API call
      const mockRoles: Role[] = [
        {
          id: 'role-1',
          name: 'Administrator',
          description: 'Full system access',
          permissions: AVAILABLE_PERMISSIONS.map((p) => p.key),
          userCount: 1,
          isSystem: true,
        },
        {
          id: 'role-2',
          name: 'Technician',
          description: 'Can manage devices and execute scripts',
          permissions: ['devices.view', 'devices.edit', 'alerts.view', 'scripts.view', 'scripts.execute'],
          userCount: 5,
          isSystem: false,
        },
        {
          id: 'role-3',
          name: 'Viewer',
          description: 'Read-only access',
          permissions: ['devices.view', 'alerts.view', 'scripts.view', 'reports.view'],
          userCount: 10,
          isSystem: false,
        },
      ];
      setRoles(mockRoles);
    } catch (error) {
      notification.error({
        message: 'Failed to fetch roles',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    userForm.resetFields();
    setUserModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    userForm.setFieldsValue(user);
    setUserModalVisible(true);
  };

  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: 'Delete User',
      content: 'Are you sure you want to delete this user?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          // TODO: Call API to delete user
          notification.success({ message: 'User deleted successfully' });
          fetchUsers();
        } catch (error) {
          notification.error({
            message: 'Failed to delete user',
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
    });
  };

  const handleUserSubmit = async (values: any) => {
    try {
      // TODO: Call API to create/update user
      notification.success({
        message: editingUser ? 'User updated successfully' : 'User created successfully',
      });
      setUserModalVisible(false);
      fetchUsers();
    } catch (error) {
      notification.error({
        message: editingUser ? 'Failed to update user' : 'Failed to create user',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    roleForm.resetFields();
    setSelectedPermissions([]);
    setRoleModalVisible(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    roleForm.setFieldsValue(role);
    setSelectedPermissions(role.permissions);
    setRoleModalVisible(true);
  };

  const handleDeleteRole = (roleId: string) => {
    Modal.confirm({
      title: 'Delete Role',
      content: 'Are you sure you want to delete this role?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          // TODO: Call API to delete role
          notification.success({ message: 'Role deleted successfully' });
          fetchRoles();
        } catch (error) {
          notification.error({
            message: 'Failed to delete role',
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
    });
  };

  const handleRoleSubmit = async (values: any) => {
    try {
      // TODO: Call API to create/update role
      notification.success({
        message: editingRole ? 'Role updated successfully' : 'Role created successfully',
      });
      setRoleModalVisible(false);
      fetchRoles();
    } catch (error) {
      notification.error({
        message: editingRole ? 'Failed to update role' : 'Failed to create role',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const getStatusTag = (status: string) => {
    const colors = {
      active: 'success',
      inactive: 'default',
      suspended: 'error',
    };
    return <Tag color={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Tag>;
  };

  const userColumns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.firstName} {record.lastName}
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag icon={<SafetyOutlined />}>{role}</Tag>,
      filters: roles.map((r) => ({ text: r.name, value: r.name })),
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Suspended', value: 'suspended' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => (date ? dayjs(date).fromNow() : 'Never'),
      sorter: (a, b) => {
        if (!a.lastLogin) return 1;
        if (!b.lastLogin) return -1;
        return new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime();
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
          />
        </Space>
      ),
    },
  ];

  const roleColumns: ColumnsType<Role> = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space>
          <SafetyOutlined />
          <span style={{ fontWeight: 500 }}>{name}</span>
          {record.isSystem && <Tag color="blue">System</Tag>}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <Tooltip title={permissions.join(', ')}>
          <Badge count={permissions.length} showZero color="blue" />
        </Tooltip>
      ),
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => <Badge count={count} showZero />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
            disabled={record.isSystem}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRole(record.id)}
            disabled={record.isSystem}
          />
        </Space>
      ),
    },
  ];

  const filteredUsers = users.filter((user) => {
    if (searchText && !user.email.toLowerCase().includes(searchText.toLowerCase()) &&
        !`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    if (roleFilter && user.role !== roleFilter) return false;
    if (statusFilter && user.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>
          <TeamOutlined /> User Management
        </h1>
        <p>Manage users, roles, and permissions</p>
      </div>

      <Card>
        <Tabs defaultActiveKey="users">
          <TabPane
            tab={
              <span>
                <UserOutlined /> Users ({users.length})
              </span>
            }
            key="users"
          >
            <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <Input
                  placeholder="Search users..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                />
                <Select
                  placeholder="Filter by role"
                  value={roleFilter}
                  onChange={setRoleFilter}
                  allowClear
                  style={{ width: 150 }}
                >
                  {roles.map((role) => (
                    <Select.Option key={role.id} value={role.name}>
                      {role.name}
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  placeholder="Filter by status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  allowClear
                  style={{ width: 150 }}
                >
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="inactive">Inactive</Select.Option>
                  <Select.Option value="suspended">Suspended</Select.Option>
                </Select>
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateUser}>
                Add User
              </Button>
            </Space>

            <Table
              columns={userColumns}
              dataSource={filteredUsers}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <SafetyOutlined /> Roles ({roles.length})
              </span>
            }
            key="roles"
          >
            <Space style={{ marginBottom: '16px' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateRole}>
                Create Role
              </Button>
            </Space>

            <Table
              columns={roleColumns}
              dataSource={roles}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Create User'}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={userForm} layout="vertical" onFinish={handleUserSubmit}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="user@example.com" />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
              <Input placeholder="John" />
            </Form.Item>
            <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
              <Input placeholder="Doe" />
            </Form.Item>
          </Space>
          <Form.Item label="Phone" name="phone">
            <Input prefix={<PhoneOutlined />} placeholder="+1234567890" />
          </Form.Item>
          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select placeholder="Select role">
              {roles.map((role) => (
                <Select.Option key={role.id} value={role.name}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
              <Select.Option value="suspended">Suspended</Select.Option>
            </Select>
          </Form.Item>
          {!editingUser && (
            <Form.Item label="Password" name="password" rules={[{ required: true, min: 8 }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Min 8 characters" />
            </Form.Item>
          )}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setUserModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Role Modal */}
      <Modal
        title={editingRole ? 'Edit Role' : 'Create Role'}
        open={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={roleForm} layout="vertical" onFinish={handleRoleSubmit}>
          <Form.Item label="Role Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="e.g., Senior Technician" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={2} placeholder="Brief description of this role" />
          </Form.Item>
          <Form.Item label="Permissions" required>
            <Transfer
              dataSource={AVAILABLE_PERMISSIONS}
              titles={['Available', 'Selected']}
              targetKeys={selectedPermissions}
              onChange={setSelectedPermissions}
              render={(item) => item.title}
              listStyle={{ width: 300, height: 400 }}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRole ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setRoleModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

