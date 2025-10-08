import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import { theme } from '@/lib/theme'
import './globals.css'

export const metadata: Metadata = {
  title: 'NinjaIT - All-in-One IT Management Platform',
  description: 'Remote Monitoring & Management, PSA, and AI-powered IT automation',
  keywords: ['RMM', 'IT Management', 'MSP', 'Monitoring', 'Automation'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}

