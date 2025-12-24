import { useState, useEffect } from 'react';
import './TeamMessagesPanel.css';

const TeamMessagesPanel = ({ messages }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    setUnreadCount(messages.length);
  }, [messages]);
  
  const getMessageIcon = (type) => {
    const icons = {
      question: 'question-circle',
      info: 'info-circle',
      warning: 'exclamation-triangle',
      feedback: 'comment',
      praise: 'star',
      system: 'cog'
    };
    return icons[type] || 'comment';
  };
  
  const getUrgencyClass = (urgency) => {
    if (urgency === 'critical') return 'message-critical';
    if (urgency === 'high') return 'message-high';
    if (urgency === 'medium') return 'message-medium';
    return 'message-normal';
  };
  
  return (
    <div className={`team-messages-container ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className="team-messages-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="team-messages-toggle"
      >
        <i className="fas fa-users"></i>
        <span>رسائل الفريق</span>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
        <i className={`fas fa-chevron-${isExpanded ? 'down' : 'up'}`}></i>
      </button>
      
      {isExpanded && (
        <div className="team-messages-panel">
          <div className="messages-list">
            {messages && messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`team-message ${getUrgencyClass(msg.urgency)}`}
                  data-testid={`team-message-${idx}`}
                >
                  <div className="message-header">
                    <div className="message-sender">
                      <i className={`fas fa-${getMessageIcon(msg.type)}`}></i>
                      <strong>{msg.sender}</strong>
                    </div>
                    {msg.urgency && (
                      <span className="urgency-badge">
                        {msg.urgency === 'critical' && '🔥'}
                        {msg.urgency === 'high' && '⚠️'}
                      </span>
                    )}
                  </div>
                  <div className="message-content">{msg.message}</div>
                  {msg.positive && (
                    <div className="message-positive">
                      <i className="fas fa-check-circle"></i>
                      إيجابي
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-messages">
                <i className="fas fa-inbox"></i>
                <p>لا توجد رسائل جديدة</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMessagesPanel;
