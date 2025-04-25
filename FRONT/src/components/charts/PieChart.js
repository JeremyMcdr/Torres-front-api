import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
// import './Chart.css'; // Removed

const CHART_HEIGHT = 300; // Define a fixed height

const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#d35400', '#34495e'];

const PieChart = ({ data, nameKey, valueKey, title }) => {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', align: 'center' }}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ height: CHART_HEIGHT, width: '100%', p: 1, pt: 2, '& .recharts-wrapper': { width: '100% !important' } }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={valueKey}
              nameKey={nameKey}
              label={({ name, percent }) => percent > 0.02 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''} // Hide small labels
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${value}`}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #ccc' }}
              itemStyle={{ color: '#333' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }}/>
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PieChart; 