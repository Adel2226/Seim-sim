import { useEffect, useState } from 'react';
import './NotificationSystem.css';

const NotificationSystem = ({ notifications, onDismiss }) => {
  return (
    <div className="notification-container">
      {notifications.map((notif, idx) => (
        <div 
          key={idx}
          className={`notification notification-${notif.type} ${notif.urgent ? 'notification-urgent' : ''}`}
          data-testid={`notification-${idx}`}
        >
          <div className="notification-icon">
            {notif.type === 'alert' && <i className="fas fa-exclamation-triangle"></i>}
            {notif.type === 'success' && <i className="fas fa-check-circle"></i>}
            {notif.type === 'message' && <i className="fas fa-envelope"></i>}
            {notif.type === 'achievement' && <i className="fas fa-trophy"></i>}
          </div>
          
          <div className="notification-content">
            <div className="notification-title">{notif.title}</div>
            <div className="notification-message">{notif.message}</div>
            {notif.points && (
              <div className="notification-points">
                +{notif.points} نقطة
              </div>
            )}
          </div>
          
          <button 
            className="notification-close"
            onClick={() => onDismiss(idx)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;
