import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
// import './Chart.css'; // Removed

const CHART_HEIGHT = 400; // Keep original height for Comparison

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
  const formatTooltip = (value) => {
    // Vérifier si la valeur est numérique avant de la formater
    if (typeof value === 'number') {
      return `${value.toLocaleString('fr-FR')} €`;
    }
    return value; // Retourner la valeur telle quelle si ce n'est pas un nombre
  };

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', align: 'center' }}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ height: CHART_HEIGHT, width: '100%', p: 1, pt: 2, '& .recharts-wrapper': { width: '100% !important' } }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
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
              formatter={formatTooltip}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #ccc' }}
              itemStyle={{ color: '#333' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }}/>
            <ReferenceLine y={0} stroke="#000" />
            <Bar dataKey={yKey1} name={label1} fill={color1} />
            <Bar dataKey={yKey2} name={label2} fill={color2} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ComparisonChart; 