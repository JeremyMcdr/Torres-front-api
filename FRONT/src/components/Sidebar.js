import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

// Icônes pour les menus
import DashboardIcon from '../assets/dashboard-icon.svg';
import ChartIcon from '../assets/chart-icon.svg';
import UserIcon from '../assets/user-icon.svg';
import TargetIcon from '../assets/target-icon.svg';
import ReasonIcon from '../assets/reason-icon.svg';

const Sidebar = () => {
  const location = useLocation();
  
  // Vérifier si un lien est actif
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>TP_CSID Dashboard</h2>
      </div>
      
      <div className="sidebar-menu">
        <ul>
          <li className={isActive('/') ? 'active' : ''}>
            <Link to="/">
              <img src={DashboardIcon} alt="Dashboard" className="menu-icon" />
              <span>Tableau de bord</span>
            </Link>
          </li>
          
          <li className={isActive('/chiffre-affaires') ? 'active' : ''}>
            <Link to="/chiffre-affaires">
              <img src={ChartIcon} alt="Chiffre d'affaires" className="menu-icon" />
              <span>Chiffre d'affaires</span>
            </Link>
          </li>
          
          <li className={isActive('/commerciaux') ? 'active' : ''}>
            <Link to="/commerciaux">
              <img src={UserIcon} alt="Commerciaux" className="menu-icon" />
              <span>Commerciaux</span>
            </Link>
          </li>
          
          <li className={isActive('/objectifs') ? 'active' : ''}>
            <Link to="/objectifs">
              <img src={TargetIcon} alt="Objectifs" className="menu-icon" />
              <span>Objectifs</span>
            </Link>
          </li>
          
          <li className={isActive('/motifs') ? 'active' : ''}>
            <Link to="/motifs">
              <img src={ReasonIcon} alt="Motifs" className="menu-icon" />
              <span>Motifs de commande</span>
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="sidebar-footer">
        <p>© 2023 TP_CSID</p>
      </div>
    </div>
  );
};

export default Sidebar; 