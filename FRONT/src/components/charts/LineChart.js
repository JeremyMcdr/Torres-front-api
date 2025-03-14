import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Chart.css';

const LineChart = ({ data, xKey, yKey, title, color = '#3498db', secondaryData = null, secondaryKey = null, secondaryColor = '#e74c3c' }) => {
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={yKey} 
            stroke={color} 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
          {secondaryData && secondaryKey && (
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
    </div>
  );
};

export default LineChart; 