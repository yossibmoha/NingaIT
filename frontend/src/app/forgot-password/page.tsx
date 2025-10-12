'use client'

import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd'
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import api from '@/lib/api'

const { Title, Text } = Typography

export default function ForgotPasswordPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const onFinish = async (values: { email: string }) => {
    try {
      setLoading(true)
      
      await api.post('/auth/forgot-password', {
        email: values.email,
      })

      setEmailSent(true)
      message.success('Password reset instructions sent to your email')
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
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
            <div style={{ 
              fontSize: 48, 
              marginBottom: 16,
              color: '#52c41a'
            }}>
              ✓
            </div>
            <Title level={3}>Check Your Email</Title>
            <Text type="secondary">
              We&apos;ve sent password reset instructions to your email address.
              Please check your inbox and follow the link to reset your password.
            </Text>
          </div>

          <Alert
            message="Didn't receive the email?"
            description="Check your spam folder or try again in a few minutes."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Link href="/login">
            <Button type="link" icon={<ArrowLeftOutlined />} block>
              Back to Login
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <Title level={2} style={{ marginBottom: 8 }}>
            Forgot Password?
          </Title>
          <Text type="secondary">
            No worries! Enter your email and we&apos;ll send you reset instructions.
          </Text>
        </div>

        <Form
          form={form}
          name="forgot-password"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email"
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
              Send Reset Link
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link href="/login">
              <Button type="link" icon={<ArrowLeftOutlined />}>
                Back to Login
              </Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

