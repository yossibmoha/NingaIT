'use client';

import { Card } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CloudServerOutlined } from '@ant-design/icons';

export default function ServersByType() {
  const serverData = [
    { name: 'Windows Server', value: 25, color: '#0078d4' },
    { name: 'Linux Server', value: 15, color: '#ff6b00' },
    { name: 'Ubuntu Server', value: 8, color: '#dd4814' },
    { name: 'CentOS', value: 5, color: '#932279' },
    { name: 'Debian', value: 3, color: '#a80030' },
  ];

  return (
    <Card 
      title={
        <span>
          <CloudServerOutlined /> Servers by Type
        </span>
      }
      extra={<span style={{ fontSize: 12, color: '#8c8c8c' }}>Total: 56 Servers</span>}
    >
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={serverData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {serverData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ marginTop: 16 }}>
        {serverData.map((item) => (
          <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>
              <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: item.color, marginRight: 8, borderRadius: 2 }} />
              {item.name}
            </span>
            <span style={{ fontWeight: 600 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

