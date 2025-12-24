import './TimelinePanel.css';

const TimelinePanel = ({ events }) => {
  const getEventIcon = (type) => {
    const icons = {
      command: 'terminal',
      alert: 'exclamation-triangle',
      attacker: 'user-ninja',
      system: 'cog',
      message: 'comment'
    };
    return icons[type] || 'circle';
  };
  
  const getEventColor = (severity) => {
    const colors = {
      critical: 'var(--accent-red)',
      high: 'var(--accent-yellow)',
      medium: 'var(--accent-blue)',
      low: 'var(--accent-green)',
      info: 'var(--accent-blue)'
    };
    return colors[severity] || 'var(--text-gray)';
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-EG', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  return (
    <div className="panel timeline-panel">
      <div className="panel-header">
        <h3><i className="fas fa-stream"></i> الخط الزمني للأحداث</h3>
      </div>
      
      <div className="timeline-container">
        {events && events.length > 0 ? (
          <div className="timeline-list">
            {events.map((event, idx) => (
              <div key={idx} className="timeline-item" data-testid={`timeline-${idx}`}>
                <div 
                  className="timeline-marker"
                  style={{borderColor: getEventColor(event.severity)}}
                >
                  <i className={`fas fa-${getEventIcon(event.type)}`}></i>
                </div>
                
                <div className="timeline-content">
                  <div className="timeline-header">
                    <div className="timeline-title">{event.title}</div>
                    <div className="timeline-time">{formatTime(event.timestamp)}</div>
                  </div>
                  <div className="timeline-description">{event.description}</div>
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="timeline-metadata">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <span key={key} className="metadata-tag">
                          {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-timeline">
            <i className="fas fa-history"></i>
            <p>لا توجد أحداث بعد</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePanel;
