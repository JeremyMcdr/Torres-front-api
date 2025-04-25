import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// import './Chart.css'; // Removed

const CHART_HEIGHT = 200; // Keep original height for Gauge

const GaugeChart = ({ value, title, min = 0, max = 100, colors = ['#e74c3c', '#f39c12', '#2ecc71'] }) => {
  // Assurez-vous que la valeur est dans les limites
  const safeValue = Math.min(Math.max(value, min), max);
  
  // Calculer le pourcentage de complétion
  const percentage = max > min ? ((safeValue - min) / (max - min)) * 100 : 0; // Avoid division by zero
  
  // Déterminer la couleur en fonction du pourcentage
  let color;
  if (percentage < 33) {
    color = colors[0]; // Rouge pour moins de 33%
  } else if (percentage < 66) {
    color = colors[1]; // Orange pour 33-66%
  } else {
    color = colors[2]; // Vert pour plus de 66%
  }
  
  // Créer les données pour le graphique en demi-cercle
  const data = [
    { name: 'Completed', value: percentage },
    { name: 'Remaining', value: 100 - percentage }
  ];
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', align: 'center' }}
        sx={{ pb: 0 }}
      />
      {/* Ensure CardContent takes available height and centers content */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 1 }}>
        {/* Box with fixed height for the chart itself */}
        <Box sx={{ width: '100%', height: CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius="60%" // Use percentage for responsiveness
                outerRadius="80%" // Use percentage for responsiveness
                paddingAngle={0}
                dataKey="value"
                isAnimationActive={false} // Optional: disable animation
              >
                <Cell key={`cell-0`} fill={color} />
                <Cell key={`cell-1`} fill="#e0e0e0" /> {/* Lighter grey */}
                <Label
                  value={`${percentage.toFixed(1)}%`}
                  position="center"
                  // fill={theme.palette.text.primary} // Use theme color if needed
                  style={{ fontSize: '1rem', fontWeight: 'bold' }} // Adjusted size
                  dy={-15} // Adjusted vertical position
                />
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        </Box>
        {/* Labels below the chart */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '80%', mt: -1.5 }}>
          <Typography variant="caption" color="text.secondary">{min}</Typography>
          <Typography variant="caption" color="text.secondary">{max}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GaugeChart; 