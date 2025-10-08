'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, Form, Input, Button, Typography, Space, Alert } from 'antd'
import { UserOutlined, LockOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/auth'

const { Title, Text } = Typography

export default function LoginPage() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [error, setError] = useState<string | null>(null)
  const { login, isLoading } = useAuthStore()

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setError(null)
      await login(values.email, values.password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
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
          maxWidth: 400,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          {/* Logo */}
          <div>
            <ThunderboltOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            <Title level={2} style={{ marginTop: 16, marginBottom: 0 }}>
              Welcome to NinjaIT
            </Title>
            <Text type="secondary">Sign in to your account</Text>
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

          {/* Login Form */}
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            style={{ width: '100%' }}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Email address" 
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                autoComplete="current-password"
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
                Sign In
              </Button>
            </Form.Item>
          </Form>

          {/* Register Link */}
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Don't have an account?{' '}
              <Link href="/register" style={{ fontWeight: 500 }}>
                Sign up now
              </Link>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  )
}

