import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { App } from 'antd'
import { ThemeProvider } from '@/context/ThemeContext'
import './globals.css'
import '../styles/recharts-theme.css'

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
          <ThemeProvider>
            <App>
              {children}
            </App>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}

