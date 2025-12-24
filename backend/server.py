from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any
import uuid
from datetime import datetime, timezone

# Import simulation models and engine
from models import (
    Scenario, ScenarioCreate, SimulationSession, SimulationSessionCreate,
    CommandExecutionRequest, CommandExecutionResponse, EvaluationResult,
    Alert, AlertSeverity, AttackerPhase, SimulationStatus
)
from simulation_engine import SimulationEngine


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize simulation engine
sim_engine = SimulationEngine()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# ===== SIMULATION API ENDPOINTS =====

@api_router.get("/scenarios", response_model=List[Scenario])
async def get_scenarios():
    """Get all available simulation scenarios"""
    scenarios = await db.scenarios.find({}, {"_id": 0}).to_list(1000)
    
    # If no scenarios exist, create default ones
    if not scenarios:
        default_scenarios = _create_default_scenarios()
        for scenario in default_scenarios:
            scenario_dict = scenario.model_dump()
            # Convert nested objects to dicts
            if 'initial_alerts' in scenario_dict:
                scenario_dict['initial_alerts'] = [alert.model_dump() if hasattr(alert, 'model_dump') else alert for alert in scenario_dict['initial_alerts']]
            await db.scenarios.insert_one(scenario_dict)
        scenarios = default_scenarios
    
    return scenarios


@api_router.post("/scenarios", response_model=Scenario)
async def create_scenario(scenario_input: ScenarioCreate):
    """Create a new simulation scenario"""
    scenario = Scenario(**scenario_input.model_dump())
    scenario_dict = scenario.model_dump()
    
    await db.scenarios.insert_one(scenario_dict)
    return scenario


@api_router.post("/simulation/start", response_model=SimulationSession)
async def start_simulation(session_input: SimulationSessionCreate):
    """Start a new simulation session"""
    # Check if scenario exists
    scenario = await db.scenarios.find_one({"id": session_input.scenario_id}, {"_id": 0})
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    # Create new session
    session = SimulationSession(**session_input.model_dump())
    
    # Load initial alerts from scenario
    if 'initial_alerts' in scenario and scenario['initial_alerts']:
        session.alerts = [Alert(**alert) if isinstance(alert, dict) else alert 
                         for alert in scenario['initial_alerts']]
    
    # Save session to database
    session_dict = session.model_dump()
    # Convert nested models to dicts
    session_dict['system_state'] = session.system_state.model_dump()
    session_dict['attacker_state'] = session.attacker_state.model_dump()
    session_dict['alerts'] = [alert.model_dump() if hasattr(alert, 'model_dump') else alert for alert in session.alerts]
    session_dict['commands_history'] = [cmd.model_dump() if hasattr(cmd, 'model_dump') else cmd for cmd in session.commands_history]
    session_dict['start_time'] = session.start_time.isoformat()
    if session.end_time:
        session_dict['end_time'] = session.end_time.isoformat()
    
    await db.simulation_sessions.insert_one(session_dict)
    
    return session


@api_router.get("/simulation/{session_id}", response_model=SimulationSession)
async def get_simulation(session_id: str):
    """Get simulation session by ID"""
    session_dict = await db.simulation_sessions.find_one({"id": session_id}, {"_id": 0})
    
    if not session_dict:
        raise HTTPException(status_code=404, detail="Simulation session not found")
    
    # Convert ISO strings back to datetime
    if isinstance(session_dict.get('start_time'), str):
        session_dict['start_time'] = datetime.fromisoformat(session_dict['start_time'])
    if session_dict.get('end_time') and isinstance(session_dict['end_time'], str):
        session_dict['end_time'] = datetime.fromisoformat(session_dict['end_time'])
    
    # Convert nested dicts back to models
    from models import SystemState, AttackerState, Alert, Command
    if 'system_state' in session_dict and isinstance(session_dict['system_state'], dict):
        session_dict['system_state'] = SystemState(**session_dict['system_state'])
    if 'attacker_state' in session_dict and isinstance(session_dict['attacker_state'], dict):
        session_dict['attacker_state'] = AttackerState(**session_dict['attacker_state'])
    if 'alerts' in session_dict:
        session_dict['alerts'] = [Alert(**alert) if isinstance(alert, dict) else alert for alert in session_dict['alerts']]
    if 'commands_history' in session_dict:
        session_dict['commands_history'] = [Command(**cmd) if isinstance(cmd, dict) else cmd for cmd in session_dict['commands_history']]
    
    return SimulationSession(**session_dict)


@api_router.post("/simulation/execute", response_model=CommandExecutionResponse)
async def execute_command(request: CommandExecutionRequest):
    """Execute a command in the simulation"""
    # Get session
    session_dict = await db.simulation_sessions.find_one({"id": request.session_id}, {"_id": 0})
    
    if not session_dict:
        raise HTTPException(status_code=404, detail="Simulation session not found")
    
    # Convert to session object
    if isinstance(session_dict.get('start_time'), str):
        session_dict['start_time'] = datetime.fromisoformat(session_dict['start_time'])
    if session_dict.get('end_time') and isinstance(session_dict['end_time'], str):
        session_dict['end_time'] = datetime.fromisoformat(session_dict['end_time'])
    
    from models import SystemState, AttackerState, Alert, Command
    if 'system_state' in session_dict and isinstance(session_dict['system_state'], dict):
        session_dict['system_state'] = SystemState(**session_dict['system_state'])
    if 'attacker_state' in session_dict and isinstance(session_dict['attacker_state'], dict):
        session_dict['attacker_state'] = AttackerState(**session_dict['attacker_state'])
    if 'alerts' in session_dict:
        session_dict['alerts'] = [Alert(**alert) if isinstance(alert, dict) else alert for alert in session_dict['alerts']]
    if 'commands_history' in session_dict:
        session_dict['commands_history'] = [Command(**cmd) if isinstance(cmd, dict) else cmd for cmd in session_dict['commands_history']]
    
    session = SimulationSession(**session_dict)
    
    # Execute command
    response = sim_engine.execute_command(session, request.command, request.parameters)
    
    # Update session in database
    session_dict = session.model_dump()
    session_dict['system_state'] = session.system_state.model_dump()
    session_dict['attacker_state'] = session.attacker_state.model_dump()
    session_dict['alerts'] = [alert.model_dump() if hasattr(alert, 'model_dump') else alert for alert in session.alerts]
    session_dict['commands_history'] = [cmd.model_dump() if hasattr(cmd, 'model_dump') else cmd for cmd in session.commands_history]
    session_dict['start_time'] = session.start_time.isoformat()
    if session.end_time:
        session_dict['end_time'] = session.end_time.isoformat()
    
    await db.simulation_sessions.update_one(
        {"id": request.session_id},
        {"$set": session_dict}
    )
    
    return response


@api_router.post("/simulation/{session_id}/complete", response_model=EvaluationResult)
async def complete_simulation(session_id: str):
    """Complete simulation and get evaluation"""
    # Get session
    session_dict = await db.simulation_sessions.find_one({"id": session_id}, {"_id": 0})
    
    if not session_dict:
        raise HTTPException(status_code=404, detail="Simulation session not found")
    
    # Convert to session object
    if isinstance(session_dict.get('start_time'), str):
        session_dict['start_time'] = datetime.fromisoformat(session_dict['start_time'])
    if session_dict.get('end_time') and isinstance(session_dict['end_time'], str):
        session_dict['end_time'] = datetime.fromisoformat(session_dict['end_time'])
    
    from models import SystemState, AttackerState, Alert, Command
    if 'system_state' in session_dict and isinstance(session_dict['system_state'], dict):
        session_dict['system_state'] = SystemState(**session_dict['system_state'])
    if 'attacker_state' in session_dict and isinstance(session_dict['attacker_state'], dict):
        session_dict['attacker_state'] = AttackerState(**session_dict['attacker_state'])
    if 'alerts' in session_dict:
        session_dict['alerts'] = [Alert(**alert) if isinstance(alert, dict) else alert for alert in session_dict['alerts']]
    if 'commands_history' in session_dict:
        session_dict['commands_history'] = [Command(**cmd) if isinstance(cmd, dict) else cmd for cmd in session_dict['commands_history']]
    
    session = SimulationSession(**session_dict)
    
    # Evaluate session
    evaluation = sim_engine.evaluate_session(session)
    
    # Update session status
    session.status = SimulationStatus.COMPLETED
    session.end_time = datetime.now(timezone.utc)
    session.final_score = evaluation['final_score']
    session.ending_type = evaluation['ending_type']
    
    # Save updated session
    session_dict = session.model_dump()
    session_dict['system_state'] = session.system_state.model_dump()
    session_dict['attacker_state'] = session.attacker_state.model_dump()
    session_dict['alerts'] = [alert.model_dump() if hasattr(alert, 'model_dump') else alert for alert in session.alerts]
    session_dict['commands_history'] = [cmd.model_dump() if hasattr(cmd, 'model_dump') else cmd for cmd in session.commands_history]
    session_dict['start_time'] = session.start_time.isoformat()
    if session.end_time:
        session_dict['end_time'] = session.end_time.isoformat()
    
    await db.simulation_sessions.update_one(
        {"id": session_id},
        {"$set": session_dict}
    )
    
    # Return evaluation result
    return EvaluationResult(
        session_id=session_id,
        **evaluation
    )


@api_router.get("/simulation/commands/available")
async def get_available_commands():
    """Get list of available commands"""
    return {
        "commands": sim_engine.available_commands
    }


def _create_default_scenarios() -> List[Scenario]:
    """Create default simulation scenarios"""
    scenarios = []
    
    # Scenario 1: AWS Cloud Breach
    scenario1 = Scenario(
        name="اختراق بيئة AWS متطور",
        description="هجوم APT متعدد المراحل يستهدف بيئة AWS السحابية",
        difficulty="متقدم",
        category="تهديدات السحابة",
        duration_minutes=45,
        tags=["APT", "Cloud", "AWS", "IAM"],
        attacker_objectives=[
            {"phase": "reconnaissance", "description": "جمع معلومات عن البنية التحتية"},
            {"phase": "initial_access", "description": "الوصول الأولي عبر حساب IAM مخترق"},
            {"phase": "privilege_escalation", "description": "رفع الصلاحيات للوصول للموارد الحساسة"},
            {"phase": "lateral_movement", "description": "الانتقال الجانبي بين الخدمات"},
            {"phase": "data_exfiltration", "description": "سرقة البيانات من S3"},
        ],
        initial_alerts=[
            Alert(
                title="Unusual IAM Activity",
                description="Multiple failed authentication attempts from unknown IP",
                severity=AlertSeverity.HIGH,
                source="CloudTrail",
                indicators=["Unknown IP: 45.123.45.67", "15 failed attempts", "Off-hours activity"]
            ),
            Alert(
                title="S3 Bucket Policy Modified",
                description="Suspicious modification to S3 bucket policy",
                severity=AlertSeverity.MEDIUM,
                source="CloudTrail",
                indicators=["Bucket: prod-data-backup", "Policy: Public access enabled"]
            )
        ],
        hidden_objective="الحفاظ على الأدلة الجنائية الكاملة مع استمرارية الأعمال بنسبة 85%"
    )
    scenarios.append(scenario1)
    
    return scenarios

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()