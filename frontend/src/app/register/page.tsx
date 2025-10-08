'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, Form, Input, Button, Typography, Space, Alert } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/auth'

const { Title, Text } = Typography

export default function RegisterPage() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [error, setError] = useState<string | null>(null)
  const { register, isLoading } = useAuthStore()

  const onFinish = async (values: any) => {
    try {
      setError(null)
      await register({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        organizationName: values.organizationName,
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 480,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          {/* Logo */}
          <div>
            <ThunderboltOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            <Title level={2} style={{ marginTop: 16, marginBottom: 0 }}>
              Create Your Account
            </Title>
            <Text type="secondary">Start your 14-day free trial</Text>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          {/* Register Form */}
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            style={{ width: '100%' }}
          >
            <Form.Item
              name="fullName"
              rules={[
                { required: true, message: 'Please input your full name!' },
                { min: 2, message: 'Name must be at least 2 characters!' },
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Full Name" 
                autoComplete="name"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="Email address" 
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="organizationName"
              rules={[
                { required: true, message: 'Please input your organization name!' },
                { min: 2, message: 'Organization name must be at least 2 characters!' },
              ]}
            >
              <Input 
                prefix={<TeamOutlined />} 
                placeholder="Organization Name" 
                autoComplete="organization"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 8, message: 'Password must be at least 8 characters!' },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password (min. 8 characters)"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Passwords do not match!'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={isLoading}
                size="large"
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          {/* Login Link */}
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Already have an account?{' '}
              <Link href="/login" style={{ fontWeight: 500 }}>
                Sign in
              </Link>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  )
}

