'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Select, Space, Spin } from 'antd';
import { Line, Area, Bar } from '@ant-design/charts';
import { useWebSocket } from '@/hooks/useWebSocket';

interface RealTimeChartProps {
  deviceId?: string;
  metric: 'cpu' | 'memory' | 'disk' | 'network';
  title: string;
  type?: 'line' | 'area' | 'bar';
  height?: number;
  timeWindow?: number; // minutes
  showControls?: boolean;
}

interface MetricDataPoint {
  timestamp: string;
  value: number;
  metric: string;
}

export default function RealTimeChart({
  deviceId,
  metric,
  title,
  type = 'line',
  height = 300,
  timeWindow = 60,
  showControls = true,
}: RealTimeChartProps) {
  const [data, setData] = useState<MetricDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState(timeWindow);
  const maxDataPoints = 100;

  const { isConnected, subscribeToDevice, unsubscribeFromDevice } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'metrics' && message.data) {
        const metricValue = message.data[metric];
        if (metricValue !== undefined) {
          addDataPoint({
            timestamp: message.timestamp || new Date().toISOString(),
            value: metricValue,
            metric,
          });
        }
      }
    },
  });

  useEffect(() => {
    if (deviceId && isConnected) {
      subscribeToDevice(deviceId);
      fetchHistoricalData();
    }

    return () => {
      if (deviceId) {
        unsubscribeFromDevice(deviceId);
      }
    };
  }, [deviceId, isConnected]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      // TODO: Fetch historical data from API
      // Simulate historical data for now
      const now = Date.now();
      const mockData: MetricDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(now - (30 - i) * 60000).toISOString(),
        value: Math.random() * 100,
        metric,
      }));
      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDataPoint = (point: MetricDataPoint) => {
    setData((prevData) => {
      const newData = [...prevData, point];
      // Keep only the last maxDataPoints
      if (newData.length > maxDataPoints) {
        return newData.slice(newData.length - maxDataPoints);
      }
      return newData;
    });
  };

  const getChartConfig = () => {
    const baseConfig = {
      data,
      xField: 'timestamp',
      yField: 'value',
      height,
      smooth: true,
      animation: {
        appear: {
          animation: 'wave-in',
          duration: 300,
        },
      },
      xAxis: {
        type: 'time',
        label: {
          formatter: (text: string) => {
            const date = new Date(text);
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
          },
        },
      },
      yAxis: {
        label: {
          formatter: (text: string) => `${text}%`,
        },
        min: 0,
        max: 100,
      },
      tooltip: {
        formatter: (datum: any) => {
          return {
            name: metric.toUpperCase(),
            value: `${datum.value.toFixed(2)}%`,
          };
        },
      },
      point: {
        size: 2,
        shape: 'circle',
      },
    };

    // Add type-specific configurations
    if (type === 'area') {
      return {
        ...baseConfig,
        areaStyle: {
          fillOpacity: 0.3,
        },
      };
    }

    return baseConfig;
  };

  const ChartComponent = type === 'area' ? Area : type === 'bar' ? Bar : Line;

  return (
    <Card
      title={title}
      extra={
        showControls && (
          <Space>
            <Select
              value={selectedTimeWindow}
              onChange={(value) => {
                setSelectedTimeWindow(value);
                fetchHistoricalData();
              }}
              style={{ width: 120 }}
              size="small"
            >
              <Select.Option value={15}>15 min</Select.Option>
              <Select.Option value={30}>30 min</Select.Option>
              <Select.Option value={60}>1 hour</Select.Option>
              <Select.Option value={180}>3 hours</Select.Option>
              <Select.Option value={360}>6 hours</Select.Option>
              <Select.Option value={1440}>24 hours</Select.Option>
            </Select>
          </Space>
        )
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin />
        </div>
      ) : (
        <ChartComponent {...getChartConfig()} />
      )}
      {isConnected && (
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#999', marginTop: '8px' }}>
          🟢 Live Updates
        </div>
      )}
    </Card>
  );
}

