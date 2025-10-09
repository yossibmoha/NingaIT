'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Tag, 
  Button,
  Space,
  Modal,
  Switch,
  Typography,
  Divider,
  message,
} from 'antd';
import {
  DashboardOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import AvailabilityMonitoring from '@/components/dashboard/AvailabilityMonitoring';
import ServersByType from '@/components/dashboard/ServersByType';
import AlertsBreakdown from '@/components/dashboard/AlertsBreakdown';
import PatchStatus from '@/components/dashboard/PatchStatus';
import BackupStatus from '@/components/dashboard/BackupStatus';
import TopDevicesByResource from '@/components/dashboard/TopDevicesByResource';

const { Title, Text } = Typography;
const ResponsiveGridLayout = WidthProvider(Responsive);

interface CardConfig {
  id: string;
  title: string;
  component: React.ReactNode;
  defaultLayout: {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
  };
}

export default function DashboardPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Record<string, boolean>>({});
  const [layouts, setLayouts] = useState<Layouts>({});

  // Define all available cards with layout matching the screenshot
  const allCards: CardConfig[] = [
    {
      id: 'critical-alerts',
      title: 'Critical Alerts',
      component: (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Statistic
            title="Requires Attention"
            value={20}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#f5222d', fontSize: 36 }}
          />
        </div>
      ),
      defaultLayout: { x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    },
    {
      id: 'system-health',
      title: 'System Health',
      component: (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Progress
            type="circle"
            percent={87}
            format={(percent) => (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a' }}>{percent}</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Good</div>
              </div>
            )}
            strokeColor={{
              '0%': '#52c41a',
              '100%': '#52c41a',
            }}
            width={120}
          />
          <Text type="secondary" style={{ marginTop: 16 }}>Last updated: 2 min ago</Text>
        </div>
      ),
      defaultLayout: { x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    },
    {
      id: 'online-devices',
      title: 'Online Devices',
      component: (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Statistic
            title="Currently Online"
            value={215}
            suffix="/ 247"
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a', fontSize: 28 }}
          />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Total Devices: </Text>
            <Text strong style={{ color: '#1890ff' }}>247 / 300</Text>
          </div>
        </div>
      ),
      defaultLayout: { x: 6, y: 0, w: 6, h: 2, minW: 3, minH: 2 },
    },
    {
      id: 'patch-status',
      title: 'Patch Status',
      component: <PatchStatus />,
      defaultLayout: { x: 0, y: 2, w: 12, h: 3, minW: 6, minH: 3 },
    },
    {
      id: 'top-devices',
      title: 'Top Devices by Resource',
      component: <TopDevicesByResource />,
      defaultLayout: { x: 0, y: 5, w: 5, h: 4, minW: 4, minH: 3 },
    },
    {
      id: 'availability',
      title: 'Availability Monitoring',
      component: <AvailabilityMonitoring />,
      defaultLayout: { x: 5, y: 5, w: 7, h: 4, minW: 5, minH: 3 },
    },
    {
      id: 'servers-by-type',
      title: 'Servers by Type',
      component: <ServersByType />,
      defaultLayout: { x: 0, y: 9, w: 4, h: 4, minW: 3, minH: 3 },
    },
    {
      id: 'backup-status',
      title: 'Backup Status',
      component: <BackupStatus />,
      defaultLayout: { x: 4, y: 9, w: 8, h: 4, minW: 4, minH: 3 },
    },
    {
      id: 'alerts-breakdown',
      title: 'Alerts Breakdown',
      component: <AlertsBreakdown />,
      defaultLayout: { x: 0, y: 13, w: 12, h: 4, minW: 6, minH: 3 },
    },
  ];

  // Initialize visible cards and layouts from localStorage
  useEffect(() => {
    const savedVisible = localStorage.getItem('dashboard-visible-cards');
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    const savedLocked = localStorage.getItem('dashboard-locked');

    if (savedVisible) {
      setVisibleCards(JSON.parse(savedVisible));
    } else {
      // By default, show all cards
      const defaultVisible: Record<string, boolean> = {};
      allCards.forEach(card => {
        defaultVisible[card.id] = true;
      });
      setVisibleCards(defaultVisible);
    }

    if (savedLayouts) {
      setLayouts(JSON.parse(savedLayouts));
    } else {
      // Set default layouts
      const defaultLayouts: Layouts = {
        lg: allCards.map(card => ({ i: card.id, ...card.defaultLayout })),
        md: allCards.map(card => ({ i: card.id, ...card.defaultLayout, w: Math.min(card.defaultLayout.w, 10) })),
        sm: allCards.map(card => ({ i: card.id, x: 0, y: card.defaultLayout.y, w: 6, h: card.defaultLayout.h })),
        xs: allCards.map(card => ({ i: card.id, x: 0, y: card.defaultLayout.y, w: 4, h: card.defaultLayout.h })),
      };
      setLayouts(defaultLayouts);
    }

    if (savedLocked) {
      setIsLocked(JSON.parse(savedLocked));
    }
  }, []);

  // Save layouts to localStorage
  const handleLayoutChange = (currentLayout: any, allLayouts: Layouts) => {
    if (!isLocked) {
      setLayouts(allLayouts);
      localStorage.setItem('dashboard-layouts', JSON.stringify(allLayouts));
    }
  };

  // Toggle card visibility
  const toggleCardVisibility = (cardId: string) => {
    const newVisible = {
      ...visibleCards,
      [cardId]: !visibleCards[cardId],
    };
    setVisibleCards(newVisible);
    localStorage.setItem('dashboard-visible-cards', JSON.stringify(newVisible));
  };

  // Toggle lock/unlock
  const toggleLock = () => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    localStorage.setItem('dashboard-locked', JSON.stringify(newLocked));
    message.success(newLocked ? 'Dashboard locked' : 'Dashboard unlocked');
  };

  // Reset to defaults
  const resetToDefaults = () => {
    const defaultVisible: Record<string, boolean> = {};
    allCards.forEach(card => {
      defaultVisible[card.id] = true;
    });
    setVisibleCards(defaultVisible);
    
    const defaultLayouts: Layouts = {
      lg: allCards.map(card => ({ i: card.id, ...card.defaultLayout })),
      md: allCards.map(card => ({ i: card.id, ...card.defaultLayout, w: Math.min(card.defaultLayout.w, 10) })),
      sm: allCards.map(card => ({ i: card.id, x: 0, y: card.defaultLayout.y, w: 6, h: card.defaultLayout.h })),
      xs: allCards.map(card => ({ i: card.id, x: 0, y: card.defaultLayout.y, w: 4, h: card.defaultLayout.h })),
    };
    setLayouts(defaultLayouts);
    
    localStorage.setItem('dashboard-visible-cards', JSON.stringify(defaultVisible));
    localStorage.setItem('dashboard-layouts', JSON.stringify(defaultLayouts));
    message.success('Dashboard reset to defaults');
    setCustomizeModalOpen(false);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Filter visible cards
  const visibleCardsData = allCards.filter(card => visibleCards[card.id] !== false);

  return (
    <div style={{ 
      padding: isFullscreen ? 0 : undefined,
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : undefined,
      left: isFullscreen ? 0 : undefined,
      right: isFullscreen ? 0 : undefined,
      bottom: isFullscreen ? 0 : undefined,
      zIndex: isFullscreen ? 1000 : undefined,
      background: isFullscreen ? 'var(--background-color-light)' : undefined,
      overflow: isFullscreen ? 'auto' : undefined,
      transition: 'all 0.3s',
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: 24,
        padding: isFullscreen ? '24px 24px 0' : undefined,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <DashboardOutlined />
            Dashboard
          </Title>
          <Text type="secondary">Last updated: 2 minutes ago</Text>
        </div>
        
        <Space>
          <Button
            icon={isLocked ? <LockOutlined /> : <UnlockOutlined />}
            onClick={toggleLock}
            type={isLocked ? 'primary' : 'default'}
          >
            {isLocked ? 'Locked' : 'Unlocked'}
          </Button>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setCustomizeModalOpen(true)}
          >
            Customize
          </Button>
          <Button
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </Space>
      </div>

      {/* Grid Layout */}
      <div style={{ padding: isFullscreen ? '0 24px 24px' : undefined }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          onLayoutChange={handleLayoutChange}
          isDraggable={!isLocked}
          isResizable={!isLocked}
          compactType="vertical"
          preventCollision={false}
        >
          {visibleCardsData.map((card) => (
            <div key={card.id} style={{ position: 'relative' }}>
              <Card
                title={card.title}
                style={{ 
                  height: '100%',
                  overflow: 'hidden',
                  cursor: isLocked ? 'default' : 'move',
                }}
                bodyStyle={{ 
                  height: 'calc(100% - 56px)',
                  overflow: 'auto',
                }}
              >
                {card.component}
              </Card>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {/* Customize Modal */}
      <Modal
        title={
          <Space>
            <SettingOutlined />
            <span>Customize Dashboard</span>
          </Space>
        }
        open={customizeModalOpen}
        onCancel={() => setCustomizeModalOpen(false)}
        footer={[
          <Button key="reset" onClick={resetToDefaults} danger>
            Reset to Defaults
          </Button>,
          <Button key="close" type="primary" onClick={() => setCustomizeModalOpen(false)}>
            Done
          </Button>,
        ]}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Toggle cards to show or hide them on your dashboard. Changes are saved automatically.
          </Text>
        </div>
        
        <Divider />

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {allCards.map((card) => (
            <div
              key={card.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'rgba(0, 0, 0, 0.02)',
                borderRadius: 4,
              }}
            >
              <Text strong>{card.title}</Text>
              <Switch
                checked={visibleCards[card.id] !== false}
                onChange={() => toggleCardVisibility(card.id)}
                checkedChildren="ON"
                unCheckedChildren="OFF"
              />
            </div>
          ))}
        </Space>

        <Divider />

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>Dashboard Controls:</Text>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><Text type="secondary">Click and drag cards to rearrange them</Text></li>
            <li><Text type="secondary">Drag the bottom-right corner to resize cards</Text></li>
            <li><Text type="secondary">Lock the dashboard to prevent accidental changes</Text></li>
            <li><Text type="secondary">Use fullscreen mode for presentations</Text></li>
          </ul>
        </Space>
      </Modal>
    </div>
  );
}
