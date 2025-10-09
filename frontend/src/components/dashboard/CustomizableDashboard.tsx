'use client';

import { useState, useEffect } from 'react';
import { Button, Modal, Checkbox, Space, Switch, Drawer, Typography, message } from 'antd';
import {
  SettingOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  DragOutlined,
  EyeOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const { Title, Text } = Typography;

export interface DashboardCard {
  id: string;
  title: string;
  component: React.ReactNode;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
}

interface CustomizableDashboardProps {
  cards: DashboardCard[];
  defaultLayout?: Layout[];
}

export default function CustomizableDashboard({ cards, defaultLayout }: CustomizableDashboardProps) {
  const [layout, setLayout] = useState<Layout[]>(defaultLayout || []);
  const [visibleCards, setVisibleCards] = useState<string[]>(cards.map(c => c.id));
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customizeDrawerOpen, setCustomizeDrawerOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Initialize layout if not provided
  useEffect(() => {
    if (!defaultLayout || defaultLayout.length === 0) {
      const initialLayout: Layout[] = cards.map((card, index) => ({
        i: card.id,
        x: (index * card.defaultSize.w) % 12,
        y: Math.floor((index * card.defaultSize.w) / 12) * card.defaultSize.h,
        w: card.defaultSize.w,
        h: card.defaultSize.h,
        minW: card.minSize.w,
        minH: card.minSize.h,
      }));
      setLayout(initialLayout);
    }
  }, [cards, defaultLayout]);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboardLayout');
    const savedVisibleCards = localStorage.getItem('visibleCards');
    
    if (savedLayout) {
      setLayout(JSON.parse(savedLayout));
    }
    if (savedVisibleCards) {
      setVisibleCards(JSON.parse(savedVisibleCards));
    }
  }, []);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
  };

  const handleSaveLayout = () => {
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    localStorage.setItem('visibleCards', JSON.stringify(visibleCards));
    message.success('Dashboard layout saved!');
  };

  const handleResetLayout = () => {
    const initialLayout: Layout[] = cards.map((card, index) => ({
      i: card.id,
      x: (index * card.defaultSize.w) % 12,
      y: Math.floor((index * card.defaultSize.w) / 12) * card.defaultSize.h,
      w: card.defaultSize.w,
      h: card.defaultSize.h,
      minW: card.minSize.w,
      minH: card.minSize.h,
    }));
    setLayout(initialLayout);
    setVisibleCards(cards.map(c => c.id));
    localStorage.removeItem('dashboardLayout');
    localStorage.removeItem('visibleCards');
    message.info('Dashboard reset to default');
  };

  const toggleCardVisibility = (cardId: string) => {
    setVisibleCards(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleCardExpand = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const filteredCards = cards.filter(card => visibleCards.includes(card.id));
  const filteredLayout = layout.filter(l => visibleCards.includes(l.i));

  return (
    <div style={{ position: 'relative' }}>
      {/* Toolbar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#fff',
          padding: '12px 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}
      >
        <Space>
          <Switch
            checked={isEditMode}
            onChange={setIsEditMode}
            checkedChildren={<DragOutlined />}
            unCheckedChildren={<DragOutlined />}
          />
          <Text type="secondary">Edit Mode</Text>
        </Space>

        <Button
          icon={<SettingOutlined />}
          onClick={() => setCustomizeDrawerOpen(true)}
        >
          Customize
        </Button>

        <Button
          icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>

        {isEditMode && (
          <>
            <Button icon={<SaveOutlined />} type="primary" onClick={handleSaveLayout}>
              Save Layout
            </Button>
            <Button onClick={handleResetLayout}>
              Reset
            </Button>
          </>
        )}
      </div>

      {/* Grid Layout */}
      <div style={{ padding: '24px' }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: filteredLayout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={80}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
        >
          {filteredCards.map(card => {
            const isExpanded = expandedCards.has(card.id);
            return (
              <div
                key={card.id}
                style={{
                  background: '#fff',
                  border: isEditMode ? '2px dashed #1890ff' : '1px solid #f0f0f0',
                  borderRadius: '8px',
                  overflow: isExpanded ? 'auto' : 'hidden',
                  position: 'relative',
                }}
              >
                {/* Card Header */}
                {isEditMode && (
                  <div
                    className="drag-handle"
                    style={{
                      padding: '8px',
                      background: '#1890ff',
                      color: '#fff',
                      cursor: 'move',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Space>
                      <DragOutlined />
                      <Text style={{ color: '#fff', fontSize: 12 }}>{card.title}</Text>
                    </Space>
                  </div>
                )}

                {/* Expand/Collapse Button */}
                <Button
                  size="small"
                  type="text"
                  icon={isExpanded ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  onClick={() => toggleCardExpand(card.id)}
                  style={{
                    position: 'absolute',
                    top: isEditMode ? 48 : 8,
                    right: 8,
                    zIndex: 10,
                  }}
                />

                {/* Card Content */}
                <div
                  style={{
                    padding: isEditMode ? '8px' : '0',
                    height: isExpanded ? 'auto' : '100%',
                    overflow: isExpanded ? 'visible' : 'hidden',
                  }}
                >
                  {card.component}
                </div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>

      {/* Customize Drawer */}
      <Drawer
        title="Customize Dashboard"
        placement="right"
        onClose={() => setCustomizeDrawerOpen(false)}
        open={customizeDrawerOpen}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={5}>
              <EyeOutlined /> Visible Cards
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Select which cards to display on your dashboard
            </Text>
            <div style={{ marginTop: 16 }}>
              {cards.map(card => (
                <div key={card.id} style={{ marginBottom: 12 }}>
                  <Checkbox
                    checked={visibleCards.includes(card.id)}
                    onChange={() => toggleCardVisibility(card.id)}
                  >
                    {card.title}
                  </Checkbox>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Button block icon={<SaveOutlined />} type="primary" onClick={handleSaveLayout}>
              Save Preferences
            </Button>
          </div>

          <div>
            <Button block onClick={handleResetLayout}>
              Reset to Default
            </Button>
          </div>
        </Space>
      </Drawer>
    </div>
  );
}

