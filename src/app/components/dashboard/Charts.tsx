import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useData } from '../../context/DataContext';

const COLORS = ['#0b6cff', '#60a5fa', '#7dd3fc', '#06b6d4', '#34d399', '#f97316'];

function aggregateByMonth(items: { createdAt: string }[]) {
  const map: Record<string, number> = {};
  items.forEach((it) => {
    const d = new Date(it.createdAt);
    if (isNaN(d.getTime())) return;
    const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    map[key] = (map[key] || 0) + 1;
  });
  // sort by date
  const entries = Object.keys(map)
    .map((k) => ({ name: k, value: map[k] }))
    .sort((a, b) => {
      const da = new Date(a.name);
      const db = new Date(b.name);
      return da.getTime() - db.getTime();
    });
  return entries.map((e) => ({ name: e.name, count: e.value }));
}

export default function Charts() {
  const { rfqs, quotations } = useData();
  const theme = useTheme();

  const rfqData = aggregateByMonth(rfqs);

  const statusMap: Record<string, number> = {};
  quotations.forEach((q) => {
    statusMap[q.status] = (statusMap[q.status] || 0) + 1;
  });
  const statusData = Object.keys(statusMap).map((k) => ({ name: k, value: statusMap[k] }));

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 0.75 }}>Overview</Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 260, height: 200 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>RFQs over time</Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rfqData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ width: 300, minWidth: 220, height: 200 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Quotations by status</Typography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={4}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Paper>
  );
}
