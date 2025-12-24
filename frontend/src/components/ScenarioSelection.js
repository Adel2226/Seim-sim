import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ScenarioSelection.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ScenarioSelection = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const response = await axios.get(`${API}/scenarios`);
      setScenarios(response.data);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSimulation = async () => {
    if (!selectedScenario) return;
    
    setStarting(true);
    try {
      const response = await axios.post(`${API}/simulation/start`, {
        scenario_id: selectedScenario.id,
        user_id: 'guest'
      });
      
      // Navigate to simulation dashboard
      navigate(`/simulation/${response.data.id}`);
    } catch (error) {
      console.error('Error starting simulation:', error);
      alert('فشل في بدء المحاكاة. حاول مرة أخرى.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>جاري تحميل السيناريوهات...</p>
      </div>
    );
  }

  return (
    <div className="scenario-selection">
      <div className="hero-section">
        <div className="logo-container">
          <div className="logo-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h1>JobSim SIEM Pro Advanced</h1>
          <p className="tagline">نظام محاكاة مركز عمليات الأمن السيبراني المتقدم</p>
        </div>
      </div>

      <div className="scenarios-container">
        <h2 className="section-title">اختر سيناريو المحاكاة</h2>
        
        <div className="scenarios-grid">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`scenario-card ${selectedScenario?.id === scenario.id ? 'selected' : ''}`}
              onClick={() => setSelectedScenario(scenario)}
              data-testid={`scenario-${scenario.id}`}
            >
              <div className="scenario-header">
                <div className="scenario-icon">
                  <i className="fas fa-cloud"></i>
                </div>
                <div className="scenario-badges">
                  <span className="difficulty-badge">{scenario.difficulty}</span>
                  <span className="duration-badge">{scenario.duration_minutes} دقيقة</span>
                </div>
              </div>
              
              <h3>{scenario.name}</h3>
              <p className="scenario-description">{scenario.description}</p>
              
              <div className="scenario-tags">
                {scenario.tags && scenario.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
              
              <div className="scenario-category">
                <i className="fas fa-folder"></i>
                <span>{scenario.category}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedScenario && (
          <div className="selection-actions">
            <div className="selected-info">
              <i className="fas fa-check-circle"></i>
              <span>تم اختيار: {selectedScenario.name}</span>
            </div>
            <button
              className="start-button"
              onClick={startSimulation}
              disabled={starting}
              data-testid="start-simulation-btn"
            >
              {starting ? (
                <>
                  <span className="spinner small"></span>
                  <span>جاري البدء...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-play"></i>
                  <span>بدء المحاكاة</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioSelection;
