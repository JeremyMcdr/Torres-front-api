import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { alpha, useTheme } from '@mui/material/styles'; // Import useTheme
// import './Chart.css'; // Removed, using Card for styling

const CHART_HEIGHT = 300; // Define a fixed height for the chart area

const BarChart = (props) => { // Receive all props
  const { data, xKey, yKey, title, color: barColor = '#3498db' } = props; // Destructure props
  const theme = useTheme(); // Get the current theme object

  // Resolve theme colors to strings
  const axisStrokeColor = theme.palette.text.secondary;
  const gridStrokeColor = theme.palette.divider;
  const legendColor = theme.palette.text.secondary;
  const tooltipBgColor = alpha(theme.palette.background.paper, 0.95);
  const tooltipBorderColor = theme.palette.divider;
  const tooltipTextColor = theme.palette.text.primary;
  const cursorFillColor = alpha(theme.palette.text.secondary, 0.1);

  return (
    <Card sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
    }}>
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
            {/* Use resolved color strings */}
            <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: axisStrokeColor }} stroke={axisStrokeColor} />
            <YAxis tick={{ fontSize: 12, fill: axisStrokeColor }} stroke={axisStrokeColor}/>
            <Tooltip
              cursor={{ fill: cursorFillColor }}
              contentStyle={{ 
                  backgroundColor: tooltipBgColor,
                  borderRadius: '8px', 
                  border: `1px solid ${tooltipBorderColor}`,
                  boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.1)}` // Add a subtle shadow to tooltip
               }}
              itemStyle={{ color: tooltipTextColor }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: legendColor }}/>
            <Bar dataKey={yKey} fill={barColor} radius={[4, 4, 0, 0]} /> {/* Added slight radius to top of bars */}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BarChart; 