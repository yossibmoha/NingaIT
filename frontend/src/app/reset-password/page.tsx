'use client'

import { useState, useEffect, Suspense } from 'react'
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd'
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import api from '@/lib/api'

const { Title, Text } = Typography

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      message.error('Invalid reset link')
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

  const onFinish = async (values: { password: string; confirmPassword: string }) => {
    if (!token) {
      message.error('Invalid reset token')
      return
    }

    try {
      setLoading(true)
      
      await api.post('/auth/reset-password', {
        token,
        password: values.password,
      })

      setSuccess(true)
      message.success('Password reset successful!')
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
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
            maxWidth: 450,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          <Alert
            message="Invalid Reset Link"
            description="This password reset link is invalid or has expired. Please request a new one."
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Link href="/forgot-password">
            <Button type="primary" block size="large">
              Request New Reset Link
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (success) {
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
            maxWidth: 450,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <CheckCircleOutlined 
              style={{ 
                fontSize: 64, 
                color: '#52c41a',
                marginBottom: 16
              }} 
            />
            <Title level={3}>Password Reset Successful!</Title>
            <Text type="secondary">
              Your password has been reset successfully. You can now login with your new password.
            </Text>
          </div>

          <Link href="/login">
            <Button type="primary" block size="large">
              Go to Login
            </Button>
          </Link>
        </Card>
      </div>
    )
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
          maxWidth: 450,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
          <Title level={2} style={{ marginBottom: 8 }}>
            Reset Password
          </Title>
          <Text type="secondary">
            Enter your new password below.
          </Text>
        </div>

        <Form
          form={form}
          name="reset-password"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter your new password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter new password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Passwords do not match'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm new password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={loading}
            >
              Reset Password
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link href="/login">
              <Button type="link">
                Back to Login
              </Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}

