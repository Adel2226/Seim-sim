import './AlertsPanel.css';

const AlertsPanel = ({ alerts }) => {
  const getSeverityClass = (severity) => {
    const classes = {
      critical: 'severity-critical',
      high: 'severity-high',
      medium: 'severity-medium',
      low: 'severity-low'
    };
    return classes[severity] || 'severity-medium';
  };
  
  const getSeverityText = (severity) => {
    const texts = {
      critical: 'حرج',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض'
    };
    return texts[severity] || severity;
  };
  
  return (
    <div className="panel alerts-panel">
      <div className="panel-header">
        <h2><i className="fas fa-bell"></i> الإنذارات النشطة</h2>
        <div className="alert-count" data-testid="alert-count">
          {alerts?.length || 0} إنذار
        </div>
      </div>
      
      <div className="alerts-container">
        {alerts && alerts.length > 0 ? (
          alerts.map((alert, idx) => (
            <div key={alert.id || idx} className="alert-card" data-testid={`alert-${idx}`}>
              <div className="alert-header">
                <h4>{alert.title}</h4>
                <span className={`alert-severity ${getSeverityClass(alert.severity)}`}>
                  {getSeverityText(alert.severity)}
                </span>
              </div>
              
              <p className="alert-description">{alert.description}</p>
              
              <div className="alert-meta">
                <div className="alert-source">
                  <i className="fas fa-database"></i>
                  <span>{alert.source}</span>
                </div>
                <div className="alert-time">
                  <i className="fas fa-clock"></i>
                  <span>{new Date(alert.timestamp).toLocaleTimeString('ar-EG')}</span>
                </div>
              </div>
              
              {alert.indicators && alert.indicators.length > 0 && (
                <div className="alert-indicators">
                  <strong>المؤشرات:</strong>
                  <ul>
                    {alert.indicators.map((indicator, i) => (
                      <li key={i}>{indicator}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <i className="fas fa-check-circle"></i>
            <p>لا توجد إنذارات حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
