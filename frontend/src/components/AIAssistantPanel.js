import { useState } from 'react';
import './AIAssistantPanel.css';

const AIAssistantPanel = ({ advice, onRequestHint }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  
  if (isMinimized) {
    return (
      <div className="ai-assistant-minimized" onClick={() => setIsMinimized(false)}>
        <i className="fas fa-robot"></i>
        <span className="pulse-dot"></span>
      </div>
    );
  }
  
  const getSeverityClass = (severity) => {
    return `advice-${severity}`;
  };
  
  return (
    <div className={`ai-assistant-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="ai-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="ai-icon">
          <i className="fas fa-robot"></i>
          <span className="ai-pulse"></span>
        </div>
        <div className="ai-title">
          <h3>🤖 مساعد AI</h3>
          <span className="ai-status">نشط</span>
        </div>
        <button 
          className="minimize-btn"
          onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
        >
          <i className="fas fa-minus"></i>
        </button>
      </div>
      
      {isExpanded && (
        <div className="ai-content">
          {advice ? (
            <div className={`ai-advice ${getSeverityClass(advice.severity)}`}>
              <div className="advice-message">
                <i className={`fas fa-${
                  advice.severity === 'critical' ? 'exclamation-circle' :
                  advice.severity === 'warning' ? 'exclamation-triangle' :
                  advice.severity === 'success' ? 'check-circle' :
                  'info-circle'
                }`}></i>
                <span>{advice.message}</span>
              </div>
              
              {advice.suggested_actions && advice.suggested_actions.length > 0 && (
                <div className="suggested-actions">
                  <div className="actions-title">إجراءات مقترحة:</div>
                  <ul>
                    {advice.suggested_actions.map((action, idx) => (
                      <li key={idx}>
                        <i className="fas fa-arrow-right"></i>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {advice.reasoning && (
                <div className="advice-reasoning">
                  <i className="fas fa-lightbulb"></i>
                  <span>{advice.reasoning}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="ai-waiting">
              <div className="ai-thinking">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <p>أحلل الموقف...</p>
            </div>
          )}
          
          <button 
            className="hint-button"
            onClick={onRequestHint}
            data-testid="request-hint-btn"
          >
            <i className="fas fa-question-circle"></i>
            اطلب تلميحاً
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAssistantPanel;
