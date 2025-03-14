import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import './Chart.css';

const GaugeChart = ({ value, title, min = 0, max = 100, colors = ['#e74c3c', '#f39c12', '#2ecc71'] }) => {
  // Assurez-vous que la valeur est dans les limites
  const safeValue = Math.min(Math.max(value, min), max);
  
  // Calculer le pourcentage de complétion
  const percentage = ((safeValue - min) / (max - min)) * 100;
  
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
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="gauge-container">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell key={`cell-0`} fill={color} />
              <Cell key={`cell-1`} fill="#f0f0f0" />
              <Label
                value={`${percentage.toFixed(1)}%`}
                position="center"
                fill="#333"
                style={{ fontSize: '24px', fontWeight: 'bold' }}
                dy={-20}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="gauge-labels">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};

export default GaugeChart; 