import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
// import './Chart.css'; // Removed, using Card for styling

const CHART_HEIGHT = 300; // Define a fixed height for the chart area

const BarChart = ({ data, xKey, yKey, title, color = '#3498db' }) => {
  return (
    // Card can take available height, but content has fixed height
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Card Header for Title */}
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', align: 'center' }} // Use theme typography, center title
        sx={{ pb: 0 }} // Reduce bottom padding of header
      />
      {/* Set fixed height on CardContent to ensure ResponsiveContainer works */}
      <CardContent sx={{ height: CHART_HEIGHT, width: '100%', p: 1, pt: 2, '& .recharts-wrapper': { width: '100% !important' } }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 0, // Adjusted for potentially tighter space
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #ccc' }}
              itemStyle={{ color: '#333' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }}/>
            <Bar dataKey={yKey} fill={color} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BarChart; 