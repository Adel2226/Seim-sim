import './AttackMapVisualization.css';

const AttackMapVisualization = ({ attackerState, systemState }) => {
  const killChainPhases = [
    { id: 'reconnaissance', name: 'استطلاع', icon: 'search' },
    { id: 'initial_access', name: 'وصول أولي', icon: 'door-open' },
    { id: 'privilege_escalation', name: 'رفع صلاحيات', icon: 'level-up-alt' },
    { id: 'lateral_movement', name: 'انتقال جانبي', icon: 'arrows-alt' },
    { id: 'data_exfiltration', name: 'سرقة بيانات', icon: 'download' },
    { id: 'persistence', name: 'استمرارية', icon: 'anchor' },
    { id: 'cover_tracks', name: 'محو آثار', icon: 'eraser' }
  ];
  
  const getCurrentPhaseIndex = () => {
    return killChainPhases.findIndex(p => p.id === attackerState.current_phase);
  };
  
  const currentIndex = getCurrentPhaseIndex();
  
  return (
    <div className="attack-map-panel">
      <div className="panel-header">
        <h3><i className="fas fa-project-diagram"></i> سلسلة الهجوم (Kill Chain)</h3>
      </div>
      
      <div className="kill-chain-container">
        {killChainPhases.map((phase, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isBlocked = attackerState.blocked_paths.some(p => 
            p.includes(phase.id) || p.includes(phase.name)
          );
          
          return (
            <div key={phase.id} className="kill-chain-step">
              <div className={`phase-indicator ${
                isActive ? 'active' : 
                isCompleted ? 'completed' : 
                isBlocked ? 'blocked' : 
                'pending'
              }`}>
                <div className="phase-number">{index + 1}</div>
                <div className="phase-icon">
                  <i className={`fas fa-${phase.icon}`}></i>
                </div>
                <div className="phase-name">{phase.name}</div>
                
                {isActive && (
                  <div className="progress-ring">
                    <svg width="100" height="100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="var(--accent-blue)"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${attackerState.progress * 2.827}, 282.7`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="progress-text">{Math.round(attackerState.progress)}%</div>
                  </div>
                )}
                
                {isBlocked && (
                  <div className="blocked-indicator">
                    <i className="fas fa-ban"></i>
                    <span>محظور</span>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="completed-indicator">
                    <i className="fas fa-check"></i>
                  </div>
                )}
              </div>
              
              {index < killChainPhases.length - 1 && (
                <div className={`phase-connector ${isCompleted ? 'completed' : ''}`}>
                  <div className="connector-line"></div>
                  <div className="connector-arrow">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="attack-stats">
        <div className="stat-item">
          <div className="stat-label">مراحل مكتملة</div>
          <div className="stat-value">{currentIndex} / {killChainPhases.length}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">مسارات محظورة</div>
          <div className="stat-value blocked-count">{attackerState.blocked_paths.length}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">محاولات بديلة</div>
          <div className="stat-value">{attackerState.fallback_attempts}</div>
        </div>
      </div>
    </div>
  );
};

export default AttackMapVisualization;
