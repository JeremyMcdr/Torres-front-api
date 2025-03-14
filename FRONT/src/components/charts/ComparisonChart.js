import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import './Chart.css';

const ComparisonChart = ({ 
  data, 
  xKey, 
  yKey1, 
  yKey2, 
  title, 
  color1 = '#3498db', 
  color2 = '#2ecc71', 
  label1 = 'Objectif', 
  label2 = 'Réalisation' 
}) => {
  // Formatter pour les tooltips
  const formatTooltip = (value) => {
    return `${value.toLocaleString('fr-FR')} €`;
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip formatter={formatTooltip} />
          <Legend />
          <Bar dataKey={yKey1} name={label1} fill={color1} />
          <Bar dataKey={yKey2} name={label2} fill={color2} />
          <ReferenceLine y={0} stroke="#000" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonChart; 