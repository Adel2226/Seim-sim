# دليل المطور - JobSim SIEM Pro Advanced

## 🏗️ البنية المعمارية

### Backend Architecture

```
┌─────────────────────────────────────────┐
│         FastAPI Application             │
│  ┌───────────────────────────────────┐  │
│  │     API Router (/api)             │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Scenarios Endpoints       │  │  │
│  │  │   - GET /scenarios          │  │  │
│  │  │   - POST /scenarios         │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Simulation Endpoints      │  │  │
│  │  │   - POST /start             │  │  │
│  │  │   - GET /{session_id}       │  │  │
│  │  │   - POST /execute           │  │  │
│  │  │   - POST /complete          │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │   SimulationEngine                │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  execute_command()          │  │  │
│  │  │  - Apply effects            │  │  │
│  │  │  - Update state             │  │  │
│  │  │  - Attacker response        │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  evaluate_session()         │  │  │
│  │  │  - Calculate scores         │  │  │
│  │  │  - Determine ending         │  │  │
│  │  │  - Generate recommendations │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │         MongoDB                   │  │
│  │  - scenarios                      │  │
│  │  - simulation_sessions            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────┐
│           React Application             │
│  ┌───────────────────────────────────┐  │
│  │       App.js (Router)             │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  /                          │  │  │
│  │  │  ScenarioSelection          │  │  │
│  │  │  - Fetch scenarios          │  │  │
│  │  │  - Start simulation         │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  /simulation/:sessionId     │  │  │
│  │  │  SimulationDashboard        │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │ AlertsPanel           │  │  │  │
│  │  │  │ InvestigationPanel    │  │  │  │
│  │  │  │ CommandInterface      │  │  │  │
│  │  │  │ MetricsPanel          │  │  │  │
│  │  │  │ EvaluationModal       │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 📊 نماذج البيانات

### SystemState
```python
{
    "network_segment_isolated": {
        "production": bool,
        "staging": bool,
        "admin": bool
    },
    "firewall_rules_updated": bool,
    "malware_contained": bool,
    "compromised_hosts": List[str],
    "isolated_hosts": List[str],
    "suspicious_accounts_disabled": List[str],
    "mfa_enforced": bool,
    "password_reset_triggered": bool,
    "s3_buckets_secured": List[str],
    "data_exfiltration_detected": bool,
    "data_loss_prevented": bool,
    "logs_preserved": bool,
    "memory_dump_captured": bool,
    "network_traffic_captured": bool,
    "services_operational": {
        "web": bool,
        "api": bool,
        "database": bool,
        "payment": bool
    },
    "business_continuity_score": float  # 0-100
}
```

### AttackerState
```python
{
    "is_active": bool,
    "current_phase": AttackerPhase,  # Enum
    "progress": float,  # 0-100
    "stealth_mode": bool,
    "objectives_completed": List[str],
    "blocked_paths": List[str],
    "fallback_attempts": int,
    "ttd": Optional[float],  # Time to Detection
    "ttc": Optional[float]   # Time to Containment
}
```

### SimulationSession
```python
{
    "id": str,  # UUID
    "scenario_id": str,
    "user_id": str,
    "status": SimulationStatus,  # active, paused, completed
    "start_time": datetime,
    "end_time": Optional[datetime],
    "system_state": SystemState,
    "attacker_state": AttackerState,
    "simulation_time": float,  # minutes
    "stress_level": float,  # 0-100
    "alerts": List[Alert],
    "commands_history": List[Command],
    "attacker_actions": List[Dict],
    "metrics": Dict[str, float],
    "final_score": Optional[float],
    "ending_type": Optional[str]
}
```

## 🔄 تدفق البيانات

### 1. بدء المحاكاة
```
User clicks "Start" 
    → POST /api/simulation/start
    → Create SimulationSession
    → Load initial alerts from scenario
    → Save to MongoDB
    → Return session
    → Navigate to /simulation/{sessionId}
```

### 2. تنفيذ أمر
```
User enters command
    → POST /api/simulation/execute
    → SimulationEngine.execute_command()
    → Apply command effects
    → Update SystemState
    → Check attacker response
    → Update AttackerState
    → Generate new alerts
    → Update metrics
    → Update stress level
    → Save session to MongoDB
    → Return CommandExecutionResponse
    → Update UI
```

### 3. استجابة المهاجم
```
Command executed
    → Check if path blocked
    → If blocked:
        - Increment fallback_attempts
        - Disable stealth_mode
        - Add attacker action
        - Generate alert
    → Else:
        - Random progress (40% chance)
        - Advance phase if progress >= 100
        - Increase stress
```

### 4. إنهاء المحاكاة
```
User clicks "Complete"
    → POST /api/simulation/{session_id}/complete
    → SimulationEngine.evaluate_session()
    → Calculate TTD and TTC
    → Calculate component scores
    → Determine ending type
    → Calculate final score
    → Generate recommendations
    → Update session status
    → Save to MongoDB
    → Return EvaluationResult
    → Show evaluation modal
```

## 🎮 آلية المحاكاة

### نظام الأوامر

كل أمر لديه:
```python
{
    "description": str,
    "params": List[str],
    "cost": float,      # Business impact (0-100)
    "time": float       # Minutes required
}
```

### تأثيرات الأوامر

مثال: `isolate_host`
```python
# Direct effects
session.system_state.isolated_hosts.append(hostname)
session.system_state.business_continuity_score -= 10

# Metric updates
session.metrics["responseAccuracy"] += 7
session.metrics["riskManagement"] += 10

# Attacker impact
if hostname in session.system_state.compromised_hosts:
    session.attacker_state.progress -= 20
    # Critical foothold eliminated!
```

### مراحل المهاجم

```python
AttackerPhase = [
    "reconnaissance",        # Phase 0
    "initial_access",        # Phase 1
    "privilege_escalation",  # Phase 2
    "lateral_movement",      # Phase 3
    "data_exfiltration",     # Phase 4
    "persistence",           # Phase 5
    "cover_tracks"           # Phase 6
]
```

التقدم:
- كل مرحلة تتطلب progress = 100
- الإجراءات الفعالة تقلل التقدم
- حظر المسارات يمنع التقدم
- التقدم يزيد الضغط

## 📈 نظام التقييم

### حساب النتيجة النهائية

```python
final_score = (
    avg_metrics * 0.4 +                    # 40%
    attacker_interaction_score * 0.25 +    # 25%
    stress_management_score * 0.15 +       # 15%
    business_continuity_score * 0.2        # 20%
)

# Ending bonuses
if "success" in ending_type:
    final_score += 10
elif "stealth" in ending_type:
    final_score -= 20
```

### المقاييس

1. **responseAccuracy**: دقة الاستجابة
   - يزداد مع الإجراءات الفعالة
   - يقل مع القرارات الخاطئة

2. **responseTime**: سرعة الاستجابة
   - يعتمد على الوقت المستغرق
   - TTD و TTC

3. **decisionQuality**: جودة القرارات
   - يزداد مع إجراءات التحقيق
   - يقل مع الإجراءات العشوائية

4. **riskManagement**: إدارة المخاطر
   - يزداد مع الإجراءات الوقائية
   - الحظر، العزل، التأمين

5. **businessContinuity**: استمرارية الأعمال
   - يقل مع الإجراءات المعطلة
   - التوازن مهم

6. **communication**: التواصل
   - (للتوسع المستقبلي)

7. **forensicPreservation**: حفظ الأدلة
   - يزداد مع حفظ السجلات
   - التقاط الذاكرة، الشبكة

### تحديد النهاية

```python
if early_containment:
    return "early_success"
elif advanced_phases:
    return "late_containment"
elif low_business_continuity:
    return "business_impact"
else:
    return "successful_containment"
```

## 🔧 إضافة ميزات جديدة

### إضافة أمر جديد

1. في `simulation_engine.py`:
```python
self.available_commands["new_command"] = {
    "description": "وصف الأمر",
    "params": ["param1", "param2"],
    "cost": 5.0,
    "time": 2.0
}
```

2. أضف معالج في `execute_command()`:
```python
elif command == "new_command":
    param = parameters.get("param1", "default")
    # Apply effects
    session.system_state.some_field = value
    message = "Success message"
    session.metrics["someMetric"] += 10
```

3. في Frontend `CommandInterface.js`:
```javascript
const quickCommands = [
    ...
    { 
        cmd: 'new_command', 
        label: 'وصف عربي', 
        icon: 'icon-name', 
        params: 'param1=value' 
    }
];
```

### إضافة سيناريو جديد

1. في `server.py` - `_create_default_scenarios()`:
```python
scenario2 = Scenario(
    name="اسم السيناريو",
    description="الوصف",
    difficulty="متقدم",
    category="الفئة",
    duration_minutes=45,
    tags=["tag1", "tag2"],
    attacker_objectives=[...],
    initial_alerts=[...],
    hidden_objective="الهدف الخفي"
)
scenarios.append(scenario2)
```

### إضافة مقياس جديد

1. في `models.py` - `SimulationSession`:
```python
metrics: Dict[str, float] = Field(default_factory=lambda: {
    ...
    "newMetric": 70.0
})
```

2. في `simulation_engine.py` - `evaluate_session()`:
```python
# Include in calculation
```

3. في Frontend - `MetricsPanel.js`:
```javascript
const metricsList = [
    ...
    { key: 'newMetric', label: 'الاسم العربي', icon: 'icon-name' }
];
```

## 🐛 التصحيح

### تفعيل السجلات التفصيلية

Backend:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

Frontend:
```javascript
console.log("Debug info:", data);
```

### فحص حالة المحاكاة

```bash
# Get session
curl http://localhost:8001/api/simulation/{session_id} | jq

# Check MongoDB
docker exec -it mongodb mongosh
use your_db_name
db.simulation_sessions.find().pretty()
```

### مشاكل شائعة

1. **المهاجم لا يتقدم**
   - تحقق من `attacker_state.blocked_paths`
   - تحقق من `fallback_attempts`

2. **المقاييس لا تتحدث**
   - تحقق من تطبيق التأثيرات في `execute_command()`

3. **Frontend لا يتلقى التحديثات**
   - تحقق من تحديث الحالة في `setSession()`
   - تحقق من auto-refresh interval

## 📝 ملاحظات التطوير

- استخدم `black` لتنسيق Python
- استخدم `prettier` لتنسيق React
- اختبر الأوامر الجديدة مع curl أولاً
- استخدم React DevTools لتصحيح الحالة
- MongoDB Compass للتحقق من البيانات

## 🚀 الأداء

### تحسينات

1. **Caching**: ذاكرة مؤقتة للسيناريوهات
2. **Indexing**: فهرسة MongoDB على `session_id`
3. **Pagination**: تقسيم السجلات والإنذارات
4. **WebSocket**: للتحديثات الفورية (مستقبلي)

### المراقبة

```bash
# Backend performance
time curl http://localhost:8001/api/scenarios

# Database queries
db.setProfilingLevel(2)
db.system.profile.find().pretty()
```

---

**Happy Coding!** 🎉
