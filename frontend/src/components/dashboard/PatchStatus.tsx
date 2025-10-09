'use client';

import { Card, Progress, Row, Col, Statistic, Tag } from 'antd';
import { SafetyOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';

export default function PatchStatus() {
  const patchStats = {
    upToDate: 198,
    pending: 45,
    failed: 7,
    total: 250,
  };

  const upToDatePercent = (patchStats.upToDate / patchStats.total) * 100;
  const pendingPercent = (patchStats.pending / patchStats.total) * 100;
  const failedPercent = (patchStats.failed / patchStats.total) * 100;

  return (
    <Card
      title={
        <span>
          <SafetyOutlined /> Patch Status
        </span>
      }
    >
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Statistic
            title="Up to Date"
            value={patchStats.upToDate}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
            suffix={`/ ${patchStats.total}`}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Pending"
            value={patchStats.pending}
            valueStyle={{ color: '#faad14' }}
            prefix={<WarningOutlined />}
            suffix={`/ ${patchStats.total}`}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Failed"
            value={patchStats.failed}
            valueStyle={{ color: '#f5222d' }}
            prefix={<CloseCircleOutlined />}
            suffix={`/ ${patchStats.total}`}
          />
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Overall Patch Compliance</span>
          <span style={{ fontWeight: 600 }}>{upToDatePercent.toFixed(1)}%</span>
        </div>
        <Progress 
          percent={upToDatePercent}
          success={{ percent: upToDatePercent }}
          strokeColor="#52c41a"
        />
      </div>

      <Row gutter={8}>
        <Col span={16}>
          <div style={{ marginBottom: 8 }}>
            <Tag color="success" style={{ marginRight: 8 }}>
              ✓ Up to Date
            </Tag>
            <span style={{ color: '#52c41a', fontWeight: 600 }}>{upToDatePercent.toFixed(1)}%</span>
          </div>
          <Progress 
            percent={upToDatePercent} 
            showInfo={false} 
            strokeColor="#52c41a"
            size="small"
          />
        </Col>
        <Col span={8}>
          <div style={{ textAlign: 'right', fontSize: 20, fontWeight: 600, color: '#52c41a' }}>
            {patchStats.upToDate}
          </div>
        </Col>
      </Row>

      <Row gutter={8} style={{ marginTop: 12 }}>
        <Col span={16}>
          <div style={{ marginBottom: 8 }}>
            <Tag color="warning" style={{ marginRight: 8 }}>
              ⚠ Pending
            </Tag>
            <span style={{ color: '#faad14', fontWeight: 600 }}>{pendingPercent.toFixed(1)}%</span>
          </div>
          <Progress 
            percent={pendingPercent} 
            showInfo={false} 
            strokeColor="#faad14"
            size="small"
          />
        </Col>
        <Col span={8}>
          <div style={{ textAlign: 'right', fontSize: 20, fontWeight: 600, color: '#faad14' }}>
            {patchStats.pending}
          </div>
        </Col>
      </Row>

      <Row gutter={8} style={{ marginTop: 12 }}>
        <Col span={16}>
          <div style={{ marginBottom: 8 }}>
            <Tag color="error" style={{ marginRight: 8 }}>
              ✗ Failed
            </Tag>
            <span style={{ color: '#f5222d', fontWeight: 600 }}>{failedPercent.toFixed(1)}%</span>
          </div>
          <Progress 
            percent={failedPercent} 
            showInfo={false} 
            strokeColor="#f5222d"
            size="small"
          />
        </Col>
        <Col span={8}>
          <div style={{ textAlign: 'right', fontSize: 20, fontWeight: 600, color: '#f5222d' }}>
            {patchStats.failed}
          </div>
        </Col>
      </Row>
    </Card>
  );
}

