import { useState } from 'react';
import './InvestigationPanel.css';

const InvestigationPanel = ({ session, executeCommand }) => {
  const [activeTab, setActiveTab] = useState('logs');
  
  const tabs = [
    { id: 'logs', label: 'السجلات', icon: 'file-alt' },
    { id: 'iam', label: 'IAM', icon: 'user-shield' },
    { id: 'network', label: 'الشبكة', icon: 'network-wired' },
    { id: 'endpoint', label: 'نقاط النهاية', icon: 'server' },
    { id: 'threat', label: 'تحليل التهديد', icon: 'bug' }
  ];
  
  const renderLogs = () => {
    const logs = [
      { level: 'critical', time: '22:45:12', message: 'Multiple failed login attempts detected from IP 45.123.45.67' },
      { level: 'warning', time: '22:46:34', message: 'S3 bucket policy modified: prod-data-backup' },
      { level: 'info', time: '22:47:15', message: 'IAM role assumed: AdminBackupRole' },
      { level: 'critical', time: '22:48:22', message: 'Unusual data transfer detected: 2.5GB to external IP' },
      { level: 'warning', time: '22:49:10', message: 'New EC2 instance launched in unusual region' }
    ];
    
    return (
      <div className="logs-container">
        {logs.map((log, idx) => (
          <div key={idx} className={`log-line log-${log.level}`}>
            <span className="log-time">[{log.time}]</span>
            <span className="log-level">{log.level.toUpperCase()}</span>
            <span className="log-message">{log.message}</span>
          </div>
        ))}
      </div>
    );
  };
  
  const renderIAM = () => {
    const iamData = [
      { user: 'admin-backup', status: 'suspicious', lastAccess: '22:45:00', actions: ['AssumeRole', 'GetObject'] },
      { user: 'dev-user-1', status: 'normal', lastAccess: '18:30:00', actions: ['PutObject'] },
      { user: 'prod-deploy', status: 'normal', lastAccess: '20:15:00', actions: ['UpdateService'] }
    ];
    
    return (
      <div className="iam-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>الحالة</th>
              <th>آخر وصول</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {iamData.map((item, idx) => (
              <tr key={idx}>
                <td>{item.user}</td>
                <td>
                  <span className={`status-badge ${item.status === 'suspicious' ? 'status-danger' : 'status-ok'}`}>
                    {item.status === 'suspicious' ? 'مشبوه' : 'عادي'}
                  </span>
                </td>
                <td>{item.lastAccess}</td>
                <td>{item.actions.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderNetwork = () => {
    return (
      <div className="network-container">
        <div className="network-stats">
          <div className="stat-card">
            <div className="stat-label">الاتصالات النشطة</div>
            <div className="stat-value">127</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">عناوين IP المشبوهة</div>
            <div className="stat-value danger">3</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">نقل البيانات</div>
            <div className="stat-value">2.5 GB</div>
          </div>
        </div>
        
        <div className="suspicious-ips">
          <h4>عناوين IP المشبوهة</h4>
          <div className="ip-list">
            <div className="ip-item">
              <i className="fas fa-exclamation-triangle"></i>
              <span>45.123.45.67</span>
              <span className="ip-location">روسيا</span>
            </div>
            <div className="ip-item">
              <i className="fas fa-exclamation-triangle"></i>
              <span>178.62.45.23</span>
              <span className="ip-location">أوكرانيا</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderEndpoint = () => {
    const endpoints = [
      { name: 'server-01', status: 'compromised', processes: 12, alerts: 3 },
      { name: 'server-02', status: 'clean', processes: 8, alerts: 0 },
      { name: 'workstation-dev-05', status: 'suspicious', processes: 15, alerts: 1 }
    ];
    
    return (
      <div className="endpoint-container">
        {endpoints.map((endpoint, idx) => (
          <div key={idx} className={`endpoint-card status-${endpoint.status}`}>
            <div className="endpoint-header">
              <i className="fas fa-server"></i>
              <h4>{endpoint.name}</h4>
              <span className={`status-badge status-${endpoint.status}`}>
                {endpoint.status === 'compromised' ? 'مخترق' : 
                 endpoint.status === 'suspicious' ? 'مشبوه' : 'نظيف'}
              </span>
            </div>
            <div className="endpoint-stats">
              <div>العمليات: {endpoint.processes}</div>
              <div>الإنذارات: {endpoint.alerts}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderThreat = () => {
    return (
      <div className="threat-container">
        <div className="threat-analysis">
          <h4>تحليل التهديد</h4>
          <div className="threat-info">
            <div className="threat-item">
              <strong>نوع التهديد:</strong>
              <span>APT (Advanced Persistent Threat)</span>
            </div>
            <div className="threat-item">
              <strong>مجموعة المهاجمين:</strong>
              <span>Fancy Bear (APT28)</span>
            </div>
            <div className="threat-item">
              <strong>TTP المستخدمة:</strong>
              <span>Credential Dumping, Data Exfiltration, Lateral Movement</span>
            </div>
            <div className="threat-item">
              <strong>مؤشرات التهديد:</strong>
              <ul>
                <li>IP: 45.123.45.67 (روسيا)</li>
                <li>Domain: malicious-c2.com</li>
                <li>Hash: a1b2c3d4e5f6...</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'logs': return renderLogs();
      case 'iam': return renderIAM();
      case 'network': return renderNetwork();
      case 'endpoint': return renderEndpoint();
      case 'threat': return renderThreat();
      default: return null;
    }
  };
  
  return (
    <div className="panel investigation-panel">
      <div className="panel-header">
        <h2><i className="fas fa-search"></i> منطقة التحقيق</h2>
      </div>
      
      <div className="investigation-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`inv-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            data-testid={`tab-${tab.id}`}
          >
            <i className={`fas fa-${tab.icon}`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default InvestigationPanel;
