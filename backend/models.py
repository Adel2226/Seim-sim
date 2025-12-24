from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid
from enum import Enum

# Enums
class AlertSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class AttackerPhase(str, Enum):
    RECONNAISSANCE = "reconnaissance"
    INITIAL_ACCESS = "initial_access"
    PRIVILEGE_ESCALATION = "privilege_escalation"
    LATERAL_MOVEMENT = "lateral_movement"
    DATA_EXFILTRATION = "data_exfiltration"
    PERSISTENCE = "persistence"
    COVER_TRACKS = "cover_tracks"

class SimulationStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"

# System State Model
class SystemState(BaseModel):
    """Represents the current state of the system under attack"""
    # Network
    network_segment_isolated: Dict[str, bool] = Field(default_factory=lambda: {
        "production": False,
        "staging": False,
        "admin": False
    })
    firewall_rules_updated: bool = False
    
    # Endpoints
    malware_contained: bool = False
    compromised_hosts: List[str] = Field(default_factory=list)
    isolated_hosts: List[str] = Field(default_factory=list)
    
    # IAM
    suspicious_accounts_disabled: List[str] = Field(default_factory=list)
    mfa_enforced: bool = False
    password_reset_triggered: bool = False
    
    # Data
    s3_buckets_secured: List[str] = Field(default_factory=list)
    data_exfiltration_detected: bool = False
    data_loss_prevented: bool = False
    
    # Forensics
    logs_preserved: bool = False
    memory_dump_captured: bool = False
    network_traffic_captured: bool = False
    
    # Business
    services_operational: Dict[str, bool] = Field(default_factory=lambda: {
        "web": True,
        "api": True,
        "database": True,
        "payment": True
    })
    business_continuity_score: float = 100.0

# Attacker State Model
class AttackerState(BaseModel):
    """Represents the current state of the attacker"""
    is_active: bool = True
    current_phase: AttackerPhase = AttackerPhase.RECONNAISSANCE
    progress: float = 0.0  # 0-100
    stealth_mode: bool = True
    objectives_completed: List[str] = Field(default_factory=list)
    blocked_paths: List[str] = Field(default_factory=list)
    fallback_attempts: int = 0
    
    # Time to objectives
    ttd: Optional[float] = None  # Time to Detection (minutes)
    ttc: Optional[float] = None  # Time to Containment (minutes)

# Alert Model
class Alert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    severity: AlertSeverity
    source: str  # e.g., "CloudTrail", "GuardDuty", "SIEM"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    indicators: List[str] = Field(default_factory=list)
    is_false_positive: bool = False
    related_alerts: List[str] = Field(default_factory=list)

# Command Model
class Command(BaseModel):
    """Represents a user action/command"""
    command: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    cost: float = 0.0  # Business impact cost
    time_required: float = 1.0  # Minutes

# Scenario Model
class Scenario(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    difficulty: str  # "beginner", "intermediate", "advanced"
    category: str
    duration_minutes: int = 45
    tags: List[str] = Field(default_factory=list)
    
    # Attacker objectives
    attacker_objectives: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Initial state
    initial_alerts: List[Alert] = Field(default_factory=list)
    hidden_objective: Optional[str] = None

class ScenarioCreate(BaseModel):
    name: str
    description: str
    difficulty: str
    category: str
    duration_minutes: int = 45
    tags: List[str] = Field(default_factory=list)

# Simulation Session Model
class SimulationSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    scenario_id: str
    user_id: str = "guest"
    
    status: SimulationStatus = SimulationStatus.ACTIVE
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: Optional[datetime] = None
    
    # Current state
    system_state: SystemState = Field(default_factory=SystemState)
    attacker_state: AttackerState = Field(default_factory=AttackerState)
    
    # Simulation time (in minutes from start)
    simulation_time: float = 0.0
    stress_level: float = 20.0  # 0-100
    
    # History
    alerts: List[Alert] = Field(default_factory=list)
    commands_history: List[Command] = Field(default_factory=list)
    attacker_actions: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Metrics
    metrics: Dict[str, float] = Field(default_factory=lambda: {
        "responseAccuracy": 95.0,
        "responseTime": 82.0,
        "decisionQuality": 78.0,
        "riskManagement": 65.0,
        "businessContinuity": 80.0,
        "communication": 75.0,
        "forensicPreservation": 70.0
    })
    
    # Score
    final_score: Optional[float] = None
    ending_type: Optional[str] = None

class SimulationSessionCreate(BaseModel):
    scenario_id: str
    user_id: str = "guest"

# Command Execution Request
class CommandExecutionRequest(BaseModel):
    session_id: str
    command: str
    parameters: Dict[str, Any] = Field(default_factory=dict)

# Command Execution Response
class CommandExecutionResponse(BaseModel):
    success: bool
    message: str
    system_state: SystemState
    attacker_state: AttackerState
    new_alerts: List[Alert] = Field(default_factory=list)
    stress_level: float
    metrics: Dict[str, float]
    simulation_time: float
    timeline_events: List[Dict[str, Any]] = Field(default_factory=list)
    team_messages: List[Dict[str, Any]] = Field(default_factory=list)
    achievements: List[Dict[str, Any]] = Field(default_factory=list)

# Evaluation Result
class EvaluationResult(BaseModel):
    session_id: str
    final_score: float
    grade: str
    ending_type: str
    ending_description: str
    metrics: Dict[str, float]
    attacker_interaction_score: float
    hidden_objective_score: float
    recommendations: List[str]
    time_to_detection: Optional[float] = None
    time_to_containment: Optional[float] = None
