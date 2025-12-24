import './MetricsPanel.css';

const MetricsPanel = ({ metrics }) => {
  const getScoreClass = (score) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-average';
    return 'score-poor';
  };
  
  const metricsList = [
    { key: 'responseAccuracy', label: 'دقة الاستجابة', icon: 'bullseye' },
    { key: 'responseTime', label: 'سرعة الاستجابة', icon: 'tachometer-alt' },
    { key: 'decisionQuality', label: 'جودة القرارات', icon: 'brain' },
    { key: 'riskManagement', label: 'إدارة المخاطر', icon: 'shield-alt' },
    { key: 'businessContinuity', label: 'استمرارية الأعمال', icon: 'business-time' },
    { key: 'communication', label: 'التواصل', icon: 'comments' },
    { key: 'forensicPreservation', label: 'الأدلة الجنائية', icon: 'search' }
  ];
  
  return (
    <div className="panel metrics-panel">
      <div className="panel-header">
        <h2><i className="fas fa-chart-line"></i> المقاييس</h2>
      </div>
      
      <div className="metrics-grid">
        {metricsList.map(({ key, label, icon }) => {
          const value = metrics?.[key] || 0;
          return (
            <div key={key} className="metric-card" data-testid={`metric-${key}`}>
              <div className="metric-icon">
                <i className={`fas fa-${icon}`}></i>
              </div>
              <div className="metric-info">
                <div className="metric-label">{label}</div>
                <div className={`metric-value ${getScoreClass(value)}`}>
                  {Math.round(value)}%
                </div>
              </div>
              <div className="metric-bar">
                <div 
                  className="metric-bar-fill"
                  style={{
                    width: `${value}%`,
                    backgroundColor: value >= 90 ? 'var(--accent-green)' :
                                     value >= 80 ? 'var(--accent-blue)' :
                                     value >= 70 ? 'var(--accent-yellow)' :
                                     'var(--accent-red)'
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetricsPanel;
