import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SimulationDashboard.css';
import AlertsPanel from './AlertsPanel';
import InvestigationPanel from './InvestigationPanel';
import CommandInterface from './CommandInterface';
import MetricsPanel from './MetricsPanel';
import EvaluationModal from './EvaluationModal';
import NotificationSystem from './NotificationSystem';
import TimelinePanel from './TimelinePanel';
import TeamMessagesPanel from './TeamMessagesPanel';
import AchievementsDisplay from './AchievementsDisplay';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SimulationDashboard = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableCommands, setAvailableCommands] = useState({});
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  
  // New interactive states
  const [notifications, setNotifications] = useState([]);
  const [teamMessages, setTeamMessages] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [timelineEvents, setTimelineEvents] = useState([]);
  
  useEffect(() => {
    fetchSession();
    fetchAvailableCommands();
    
    // Auto-refresh session every 5 seconds
    const interval = setInterval(fetchSession, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);
  
  const fetchSession = async () => {
    try {
      const response = await axios.get(`${API}/simulation/${sessionId}`);
      setSession(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching session:', error);
      if (error.response?.status === 404) {
        alert('الجلسة غير موجودة');
        navigate('/');
      }
    }
  };
  
  const fetchAvailableCommands = async () => {
    try {
      const response = await axios.get(`${API}/simulation/commands/available`);
      setAvailableCommands(response.data.commands);
    } catch (error) {
      console.error('Error fetching commands:', error);
    }
  };
  
  const executeCommand = useCallback(async (command, parameters = {}) => {
    try {
      const response = await axios.post(`${API}/simulation/execute`, {
        session_id: sessionId,
        command: command,
        parameters: parameters
      });
      
      // Update session with new state
      setSession(prevSession => ({
        ...prevSession,
        system_state: response.data.system_state,
        attacker_state: response.data.attacker_state,
        alerts: [...prevSession.alerts, ...response.data.new_alerts],
        stress_level: response.data.stress_level,
        metrics: response.data.metrics,
        simulation_time: response.data.simulation_time
      }));
      
      // Handle new alerts
      if (response.data.new_alerts && response.data.new_alerts.length > 0) {
        response.data.new_alerts.forEach(alert => {
          addNotification({
            type: 'alert',
            title: alert.title,
            message: alert.description,
            urgent: alert.severity === 'critical'
          });
          
          // Play sound for critical alerts
          if (alert.severity === 'critical') {
            playAlertSound();
          }
        });
      }
      
      // Handle timeline events
      if (response.data.timeline_events) {
        setTimelineEvents(response.data.timeline_events);
      }
      
      // Handle team messages
      if (response.data.team_messages && response.data.team_messages.length > 0) {
        setTeamMessages(prev => [...response.data.team_messages, ...prev]);
        
        // Add notification for urgent messages
        response.data.team_messages.forEach(msg => {
          if (msg.urgency === 'critical' || msg.urgency === 'high') {
            addNotification({
              type: 'message',
              title: `${msg.sender}: رسالة عاجلة`,
              message: msg.message,
              urgent: msg.urgency === 'critical'
            });
          }
        });
      }
      
      // Handle achievements
      if (response.data.achievements && response.data.achievements.length > 0) {
        setAchievements(prev => [...prev, ...response.data.achievements]);
        
        response.data.achievements.forEach(achievement => {
          setTotalPoints(prev => prev + achievement.points);
          
          addNotification({
            type: 'achievement',
            title: achievement.title,
            message: achievement.description,
            points: achievement.points
          });
        });
      }
      
      // Success notification
      addNotification({
        type: 'success',
        title: 'تم التنفيذ',
        message: response.data.message
      });
      
      return response.data;
    } catch (error) {
      console.error('Error executing command:', error);
      
      addNotification({
        type: 'alert',
        title: 'خطأ',
        message: error.response?.data?.detail || 'فشل تنفيذ الأمر',
        urgent: true
      });
      
      throw error;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);
  
  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(id);
    }, 5000);
  };
  
  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const playAlertSound = () => {
    // Simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };
  
  const completeSimulation = async () => {
    try {
      const response = await axios.post(`${API}/simulation/${sessionId}/complete`);
      setEvaluation(response.data);
      setShowEvaluation(true);
    } catch (error) {
      console.error('Error completing simulation:', error);
      alert('فشل في إنهاء المحاكاة');
    }
  };
  
  const formatTime = (minutes) => {
    const totalMinutes = Math.floor(minutes);
    const seconds = Math.floor((minutes - totalMinutes) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>جاري تحميل المحاكاة...</p>
      </div>
    );
  }
  
  if (!session) {
    return <div>الجلسة غير موجودة</div>;
  }
  
  return (
    <div className="simulation-dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <div className="logo-text">
            <h1>JobSim SIEM Pro</h1>
            <div className="logo-tagline">محاكاة تفاعلية</div>
          </div>
        </div>
        
        <div className="simulation-controls">
          <div className="simulation-time" data-testid="simulation-time">
            {formatTime(session.simulation_time)}
          </div>
          
          <div className="stress-level">
            <span>الضغط:</span>
            <div className="stress-bar">
              <div 
                className="stress-fill" 
                style={{width: `${session.stress_level}%`}}
              ></div>
            </div>
            <span>{Math.round(session.stress_level)}%</span>
          </div>
          
          <button 
            className="control-btn"
            onClick={completeSimulation}
            data-testid="complete-simulation-btn"
          >
            <i className="fas fa-flag-checkered"></i>
            إنهاء المحاكاة
          </button>
          
          <button 
            className="control-btn"
            onClick={() => navigate('/')}
          >
            <i className="fas fa-home"></i>
            الرئيسية
          </button>
        </div>
      </nav>
      
      {/* Attacker Status */}
      {session.attacker_state && (
        <div className="attacker-status" data-testid="attacker-status">
          <i className="fas fa-user-ninja"></i>
          <span>مرحلة المهاجم: {session.attacker_state.current_phase}</span>
          <span>التقدم: {Math.round(session.attacker_state.progress)}%</span>
          {session.attacker_state.blocked_paths.length > 0 && (
            <span className="blocked-paths">
              <i className="fas fa-ban"></i>
              {session.attacker_state.blocked_paths.length} مسار محظور
            </span>
          )}
        </div>
      )}
      
      {/* Main Dashboard */}
      <div className="dashboard-grid">
        {/* Left Column: Alerts & Metrics */}
        <div className="left-column">
          <AlertsPanel alerts={session.alerts} />
          <MetricsPanel metrics={session.metrics} />
          <TimelinePanel events={timelineEvents} />
        </div>
        
        {/* Center Column: Investigation & CLI */}
        <div className="center-column">
          <InvestigationPanel 
            session={session}
            executeCommand={executeCommand}
          />
          <CommandInterface 
            availableCommands={availableCommands}
            executeCommand={executeCommand}
          />
        </div>
        
        {/* Right Column: System State */}
        <div className="right-column">
          <div className="panel system-state-panel">
            <div className="panel-header">
              <h3><i className="fas fa-server"></i> حالة النظام</h3>
            </div>
            <div className="system-state-content">
              <div className="state-section">
                <h4>الشبكة</h4>
                <div className="state-items">
                  {Object.entries(session.system_state.network_segment_isolated || {}).map(([segment, isolated]) => (
                    <div key={segment} className="state-item">
                      <span>{segment}</span>
                      <span className={isolated ? 'status-isolated' : 'status-active'}>
                        {isolated ? 'معزول' : 'نشط'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="state-section">
                <h4>الأجهزة المعزولة</h4>
                <div className="state-items">
                  {session.system_state.isolated_hosts?.length > 0 ? (
                    session.system_state.isolated_hosts.map((host, idx) => (
                      <div key={idx} className="state-item">
                        <i className="fas fa-laptop"></i>
                        <span>{host}</span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">لا توجد أجهزة معزولة</div>
                  )}
                </div>
              </div>
              
              <div className="state-section">
                <h4>الحسابات المعطلة</h4>
                <div className="state-items">
                  {session.system_state.suspicious_accounts_disabled?.length > 0 ? (
                    session.system_state.suspicious_accounts_disabled.map((account, idx) => (
                      <div key={idx} className="state-item">
                        <i className="fas fa-user-slash"></i>
                        <span>{account}</span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">لا توجد حسابات معطلة</div>
                  )}
                </div>
              </div>
              
              <div className="state-section">
                <h4>استمرارية الأعمال</h4>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{
                      width: `${session.system_state.business_continuity_score}%`,
                      backgroundColor: session.system_state.business_continuity_score > 70 ? 'var(--accent-green)' : 
                                       session.system_state.business_continuity_score > 50 ? 'var(--accent-yellow)' : 
                                       'var(--accent-red)'
                    }}
                  ></div>
                </div>
                <div className="score-text">
                  {Math.round(session.system_state.business_continuity_score)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Evaluation Modal */}
      {showEvaluation && evaluation && (
        <EvaluationModal 
          evaluation={evaluation}
          onClose={() => setShowEvaluation(false)}
          onRestart={() => navigate('/')}
        />
      )}
      
      {/* Interactive Components */}
      <NotificationSystem 
        notifications={notifications}
        onDismiss={(idx) => dismissNotification(notifications[idx]?.id)}
      />
      
      <TeamMessagesPanel messages={teamMessages} />
      
      <AchievementsDisplay 
        achievements={achievements.slice(-1)}
        totalPoints={totalPoints}
      />
    </div>
  );
};

export default SimulationDashboard;
