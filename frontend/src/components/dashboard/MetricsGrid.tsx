'use client';

import React from 'react';
import { Row, Col, Card, Statistic, Progress } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';

interface MetricCardProps {
  title: string;
  value: number;
  suffix?: string;
  trend?: number;
  status?: 'normal' | 'warning' | 'critical';
  showProgress?: boolean;
  icon?: React.ReactNode;
}

function MetricCard({
  title,
  value,
  suffix = '%',
  trend,
  status = 'normal',
  showProgress = true,
  icon,
}: MetricCardProps) {
  const getStatusColor = () => {
    if (status === 'critical') return '#f5222d';
    if (status === 'warning') return '#faad14';
    return '#52c41a';
  };

  const getStatusIcon = () => {
    if (status === 'critical') return <CloseCircleOutlined />;
    if (status === 'warning') return <WarningOutlined />;
    return <CheckCircleOutlined />;
  };

  const getTrendIcon = () => {
    if (trend === undefined) return null;
    return trend > 0 ? (
      <ArrowUpOutlined style={{ color: '#f5222d' }} />
    ) : (
      <ArrowDownOutlined style={{ color: '#52c41a' }} />
    );
  };

  return (
    <Card hoverable>
      <Statistic
        title={
          <span>
            {icon} {title}
          </span>
        }
        value={value}
        suffix={suffix}
        prefix={getStatusIcon()}
        valueStyle={{ color: getStatusColor() }}
      />
      {showProgress && (
        <Progress
          percent={value}
          strokeColor={getStatusColor()}
          showInfo={false}
          size="small"
          style={{ marginTop: '8px' }}
        />
      )}
      {trend !== undefined && (
        <div style={{ marginTop: '8px', fontSize: '14px' }}>
          {getTrendIcon()} {Math.abs(trend)}% from last hour
        </div>
      )}
    </Card>
  );
}

interface MetricsGridProps {
  metrics: {
    cpu: { value: number; trend?: number; status?: 'normal' | 'warning' | 'critical' };
    memory: { value: number; trend?: number; status?: 'normal' | 'warning' | 'critical' };
    disk: { value: number; trend?: number; status?: 'normal' | 'warning' | 'critical' };
    network: { value: number; trend?: number; status?: 'normal' | 'warning' | 'critical' };
  };
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <MetricCard
          title="CPU Usage"
          value={metrics.cpu.value}
          trend={metrics.cpu.trend}
          status={metrics.cpu.status}
          icon={<CloudServerOutlined />}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <MetricCard
          title="Memory Usage"
          value={metrics.memory.value}
          trend={metrics.memory.trend}
          status={metrics.memory.status}
          icon={<CloudServerOutlined />}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <MetricCard
          title="Disk Usage"
          value={metrics.disk.value}
          trend={metrics.disk.trend}
          status={metrics.disk.status}
          icon={<CloudServerOutlined />}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <MetricCard
          title="Network Load"
          value={metrics.network.value}
          suffix=" Mbps"
          trend={metrics.network.trend}
          status={metrics.network.status}
          showProgress={false}
          icon={<CloudServerOutlined />}
        />
      </Col>
    </Row>
  );
}

