import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
// import './Chart.css'; // Removed

const CHART_HEIGHT = 300; // Define a fixed height

const LineChart = ({ data, xKey, yKey, title, color = '#3498db', secondaryData = null, secondaryKey = null, secondaryColor = '#e74c3c' }) => {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', align: 'center' }}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ height: CHART_HEIGHT, width: '100%', p: 1, pt: 2, '& .recharts-wrapper': { width: '100% !important' } }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 0,
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
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={color}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            {/* Use secondaryData if provided for the second line */}
            {secondaryData && secondaryKey && (
              <Line
                type="monotone"
                data={secondaryData} // Ensure secondary data is used if different
                dataKey={secondaryKey}
                stroke={secondaryColor}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            )}
            {/* If secondaryData is not provided, but key is, assume same data source */}
            {!secondaryData && secondaryKey && (
              <Line
                type="monotone"
                dataKey={secondaryKey}
                stroke={secondaryColor}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            )}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LineChart; 