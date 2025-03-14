import React from 'react';
import './Header.css';

const Header = ({ title }) => {
  return (
    <div className="header">
      <h1>{title}</h1>
      <div className="header-right">
        <div className="date">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>
  );
};

export default Header; 