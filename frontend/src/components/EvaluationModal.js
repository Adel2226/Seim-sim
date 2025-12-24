import './EvaluationModal.css';

const EvaluationModal = ({ evaluation, onClose, onRestart }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--accent-green)';
    if (score >= 80) return 'var(--accent-blue)';
    if (score >= 70) return 'var(--accent-yellow)';
    return 'var(--accent-red)';
  };
  
  const getScoreClass = (score) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-average';
    return 'score-poor';
  };
  
  const metricsList = [
    { key: 'responseAccuracy', label: 'دقة الاستجابة' },
    { key: 'responseTime', label: 'سرعة الاستجابة' },
    { key: 'decisionQuality', label: 'جودة القرارات' },
    { key: 'riskManagement', label: 'إدارة المخاطر' },
    { key: 'businessContinuity', label: 'استمرارية الأعمال' },
    { key: 'communication', label: 'التواصل' },
    { key: 'forensicPreservation', label: 'الأدلة الجنائية' }
  ];
  
  return (
    <div className="evaluation-overlay" onClick={onClose}>
      <div className="evaluation-content" onClick={(e) => e.stopPropagation()}>
        <div className="evaluation-header">
          <div className="logo-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <h1>تقرير تقييم المحاكاة</h1>
          <p>تقييم أدائك في محاكاة استجابة الحوادث الأمنية</p>
        </div>
        
        {/* Ending Description */}
        <div className="ending-section">
          <div className="ending-card">
            <h3>نتيجة المحاكاة</h3>
            <p>{evaluation.ending_description}</p>
          </div>
        </div>
        
        {/* Final Score */}
        <div className="score-section">
          <div className="final-score-card">
            <div className="score-label">النتيجة الإجمالية</div>
            <div className={`final-score ${getScoreClass(evaluation.final_score)}`}
                 style={{color: getScoreColor(evaluation.final_score)}}>
              {Math.round(evaluation.final_score)}%
            </div>
            <div className="grade">{evaluation.grade}</div>
          </div>
        </div>
        
        {/* Metrics Breakdown */}
        <div className="metrics-breakdown">
          <h3>تفصيل المقاييس</h3>
          <div className="metrics-list">
            {metricsList.map(({ key, label }) => {
              const value = evaluation.metrics?.[key] || 0;
              return (
                <div key={key} className="metric-row">
                  <div className="metric-label">{label}</div>
                  <div className="metric-bar-container">
                    <div className="metric-bar">
                      <div 
                        className="metric-bar-fill"
                        style={{
                          width: `${value}%`,
                          backgroundColor: getScoreColor(value)
                        }}
                      ></div>
                    </div>
                    <div className="metric-value" style={{color: getScoreColor(value)}}>
                      {Math.round(value)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Additional Scores */}
        <div className="additional-scores">
          <div className="score-item">
            <div className="score-item-label">التفاعل مع المهاجم</div>
            <div className="score-item-value" style={{color: getScoreColor(evaluation.attacker_interaction_score)}}>
              {Math.round(evaluation.attacker_interaction_score)}%
            </div>
          </div>
          <div className="score-item">
            <div className="score-item-label">إدارة الضغط</div>
            <div className="score-item-value" style={{color: getScoreColor(evaluation.stress_management_score || 0)}}>
              {Math.round(evaluation.stress_management_score || 0)}%
            </div>
          </div>
          {evaluation.time_to_detection && (
            <div className="score-item">
              <div className="score-item-label">وقت الاكتشاف (TTD)</div>
              <div className="score-item-value">{evaluation.time_to_detection.toFixed(1)} دقيقة</div>
            </div>
          )}
          {evaluation.time_to_containment && (
            <div className="score-item">
              <div className="score-item-label">وقت الاحتواء (TTC)</div>
              <div className="score-item-value">{evaluation.time_to_containment.toFixed(1)} دقيقة</div>
            </div>
          )}
        </div>
        
        {/* Recommendations */}
        {evaluation.recommendations && evaluation.recommendations.length > 0 && (
          <div className="recommendations">
            <h3><i className="fas fa-lightbulb"></i> التوصيات</h3>
            <ul>
              {evaluation.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Actions */}
        <div className="evaluation-actions">
          <button className="action-btn btn-primary" onClick={onRestart}>
            <i className="fas fa-redo"></i>
            بدء محاكاة جديدة
          </button>
          <button className="action-btn btn-secondary" onClick={onClose}>
            <i className="fas fa-times"></i>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationModal;
