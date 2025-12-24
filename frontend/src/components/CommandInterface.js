import { useState } from 'react';
import './CommandInterface.css';

const CommandInterface = ({ availableCommands, executeCommand }) => {
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [executing, setExecuting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const parseCommand = (input) => {
    const parts = input.trim().split(/\s+/);
    const command = parts[0];
    const parameters = {};
    
    // Parse parameters (simple key=value format)
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].includes('=')) {
        const [key, value] = parts[i].split('=');
        parameters[key] = value;
      } else {
        // If no key=value, use common parameter names
        if (!parameters.target && !parameters.hostname && !parameters.username) {
          parameters.target = parts[i];
          parameters.hostname = parts[i];
          parameters.username = parts[i];
        }
      }
    }
    
    return { command, parameters };
  };
  
  const handleExecuteCommand = async () => {
    if (!commandInput.trim() || executing) return;
    
    const { command, parameters } = parseCommand(commandInput);
    
    // Add to history
    const historyEntry = {
      input: commandInput,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
      status: 'executing'
    };
    setCommandHistory(prev => [...prev, historyEntry]);
    
    setExecuting(true);
    
    try {
      const response = await executeCommand(command, parameters);
      
      // Update history with result
      setCommandHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          status: 'success',
          message: response.message,
          newAlerts: response.new_alerts?.length || 0
        };
        return updated;
      });
      
      setCommandInput('');
    } catch (error) {
      // Update history with error
      setCommandHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          status: 'error',
          message: error.response?.data?.detail || error.message || 'فشل في تنفيذ الأمر'
        };
        return updated;
      });
    } finally {
      setExecuting(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleExecuteCommand();
    }
  };
  
  const quickCommands = [
    { cmd: 'isolate_host', label: 'عزل جهاز', icon: 'laptop', params: 'hostname=server-01' },
    { cmd: 'disable_account', label: 'تعطيل حساب', icon: 'user-slash', params: 'username=admin-backup' },
    { cmd: 'block_ip', label: 'حظر IP', icon: 'ban', params: 'ip=45.123.45.67' },
    { cmd: 'scan_for_malware', label: 'فحص البرمجيات الخبيثة', icon: 'virus', params: 'target=all' },
    { cmd: 'secure_s3_bucket', label: 'تأمين S3', icon: 'lock', params: 'bucket_name=prod-data-backup' },
    { cmd: 'preserve_logs', label: 'حفظ السجلات', icon: 'save', params: 'source=cloudtrail' },
    { cmd: 'query_logs', label: 'استعلام السجلات', icon: 'search', params: 'query=failed_login' },
    { cmd: 'enforce_mfa', label: 'فرض MFA', icon: 'key', params: '' }
  ];
  
  return (
    <div className="panel command-interface">
      <div className="panel-header">
        <h2><i className="fas fa-terminal"></i> واجهة الأوامر</h2>
        <button 
          className="help-btn"
          onClick={() => setShowHelp(!showHelp)}
        >
          <i className="fas fa-question-circle"></i>
          مساعدة
        </button>
      </div>
      
      {showHelp && (
        <div className="help-panel">
          <h4>الأوامر المتاحة:</h4>
          <div className="commands-list">
            {Object.entries(availableCommands).map(([cmd, details]) => (
              <div key={cmd} className="command-help-item">
                <code>{cmd}</code>
                <span>{details.description}</span>
                {details.params && details.params.length > 0 && (
                  <div className="params">
                    المعاملات: {details.params.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Quick Commands */}
      <div className="quick-commands">
        <div className="quick-commands-label">أوامر سريعة:</div>
        <div className="quick-commands-grid">
          {quickCommands.map(({ cmd, label, icon, params }) => (
            <button
              key={cmd}
              className="quick-cmd-btn"
              onClick={() => setCommandInput(`${cmd}${params ? ' ' + params : ''}`)}
              title={`${cmd} ${params}`}
              data-testid={`quick-cmd-${cmd}`}
            >
              <i className={`fas fa-${icon}`}></i>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Command Input */}
      <div className="command-input-container">
        <div className="input-wrapper">
          <span className="prompt">$</span>
          <input
            type="text"
            className="command-input"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="أدخل الأمر (مثل: isolate_host hostname=server-01)"
            disabled={executing}
            data-testid="command-input"
          />
        </div>
        <button
          className="execute-btn"
          onClick={handleExecuteCommand}
          disabled={!commandInput.trim() || executing}
          data-testid="execute-command-btn"
        >
          {executing ? (
            <>
              <span className="spinner small"></span>
              تنفيذ...
            </>
          ) : (
            <>
              <i className="fas fa-play"></i>
              تنفيذ
            </>
          )}
        </button>
      </div>
      
      {/* Command History */}
      <div className="command-history">
        <div className="history-header">سجل الأوامر</div>
        <div className="history-list">
          {commandHistory.length > 0 ? (
            commandHistory.slice().reverse().map((entry, idx) => (
              <div key={idx} className={`history-entry ${entry.status}`}>
                <div className="history-meta">
                  <span className="history-time">{entry.timestamp}</span>
                  <span className={`history-status status-${entry.status}`}>
                    {entry.status === 'success' && <i className="fas fa-check-circle"></i>}
                    {entry.status === 'error' && <i className="fas fa-times-circle"></i>}
                    {entry.status === 'executing' && <span className="spinner small"></span>}
                  </span>
                </div>
                <div className="history-command">
                  <code>{entry.input}</code>
                </div>
                {entry.message && (
                  <div className="history-message">
                    {entry.message}
                    {entry.newAlerts > 0 && (
                      <span className="new-alerts-badge">
                        <i className="fas fa-bell"></i>
                        {entry.newAlerts} إنذار جديد
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-history">
              <i className="fas fa-history"></i>
              <p>لم يتم تنفيذ أي أوامر بعد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandInterface;
