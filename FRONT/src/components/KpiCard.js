import React from 'react';
import './KpiCard.css';

const KpiCard = ({ title, value, icon, color = '#3498db', unit = '', trend = null }) => {
  return (
    <div className="kpi-card" style={{ borderTopColor: color }}>
      <div className="kpi-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="kpi-content">
        <h3 className="kpi-title">{title}</h3>
        <div className="kpi-value-container">
          <span className="kpi-value">{value}</span>
          {unit && <span className="kpi-unit">{unit}</span>}
        </div>
        {trend && (
          <div className={`kpi-trend ${trend > 0 ? 'positive' : trend < 0 ? 'negative' : ''}`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : ''}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard; 