import './AchievementsDisplay.css';

const AchievementsDisplay = ({ achievements, totalPoints }) => {
  if (!achievements || achievements.length === 0) return null;
  
  return (
    <div className="achievements-display">
      {achievements.map((achievement, idx) => (
        <div 
          key={idx} 
          className="achievement-popup"
          data-testid={`achievement-${achievement.id}`}
        >
          <div className="achievement-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <div className="achievement-content">
            <div className="achievement-title">{achievement.title}</div>
            <div className="achievement-description">{achievement.description}</div>
            <div className="achievement-points">+{achievement.points} نقطة</div>
          </div>
          <div className="achievement-sparkles">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="sparkle" style={{
                '--angle': `${i * 45}deg`,
                '--delay': `${i * 0.1}s`
              }}></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AchievementsDisplay;
