from typing import Dict, List, Tuple, Optional
from models import (
    SystemState, AttackerState, Alert, Command, SimulationSession,
    AlertSeverity, AttackerPhase, CommandExecutionResponse
)
from datetime import datetime, timezone
import random
import uuid
from realtime_events import RealtimeEventGenerator
from timeline_manager import TimelineManager

class SimulationEngine:
    """Core engine for the interactive SIEM simulation"""
    
    def __init__(self):
        self.event_generator = RealtimeEventGenerator()
        self.timeline = TimelineManager()
        
        # Command definitions with their effects
        self.available_commands = {
            # Network commands
            "isolate_network": {
                "description": "Isolate a network segment",
                "params": ["segment"],
                "cost": 15.0,
                "time": 2.0
            },
            "update_firewall": {
                "description": "Update firewall rules",
                "params": ["rule"],
                "cost": 5.0,
                "time": 1.5
            },
            "block_ip": {
                "description": "Block an IP address",
                "params": ["ip"],
                "cost": 2.0,
                "time": 0.5
            },
            
            # Endpoint commands
            "isolate_host": {
                "description": "Isolate a compromised host",
                "params": ["hostname"],
                "cost": 10.0,
                "time": 1.0
            },
            "scan_for_malware": {
                "description": "Scan system for malware",
                "params": ["target"],
                "cost": 3.0,
                "time": 5.0
            },
            "terminate_process": {
                "description": "Terminate a suspicious process",
                "params": ["process_id"],
                "cost": 1.0,
                "time": 0.3
            },
            
            # IAM commands
            "disable_account": {
                "description": "Disable a user account",
                "params": ["username"],
                "cost": 5.0,
                "time": 0.5
            },
            "enforce_mfa": {
                "description": "Enforce MFA across organization",
                "params": [],
                "cost": 8.0,
                "time": 3.0
            },
            "reset_passwords": {
                "description": "Force password reset for affected accounts",
                "params": ["scope"],
                "cost": 12.0,
                "time": 2.0
            },
            
            # Data protection commands
            "secure_s3_bucket": {
                "description": "Secure S3 bucket with strict policies",
                "params": ["bucket_name"],
                "cost": 4.0,
                "time": 1.0
            },
            "enable_dlp": {
                "description": "Enable Data Loss Prevention",
                "params": [],
                "cost": 6.0,
                "time": 2.5
            },
            
            # Forensics commands
            "capture_memory_dump": {
                "description": "Capture memory dump from host",
                "params": ["hostname"],
                "cost": 7.0,
                "time": 4.0
            },
            "preserve_logs": {
                "description": "Preserve logs for forensic analysis",
                "params": ["source"],
                "cost": 3.0,
                "time": 1.5
            },
            "capture_network_traffic": {
                "description": "Capture network traffic for analysis",
                "params": [],
                "cost": 5.0,
                "time": 3.0
            },
            
            # Investigation commands
            "query_logs": {
                "description": "Query logs from SIEM",
                "params": ["query"],
                "cost": 1.0,
                "time": 0.5
            },
            "check_iam_activity": {
                "description": "Check IAM activity logs",
                "params": ["username"],
                "cost": 1.0,
                "time": 0.5
            },
            "analyze_network_traffic": {
                "description": "Analyze network traffic patterns",
                "params": [],
                "cost": 2.0,
                "time": 2.0
            }
        }
    
    def execute_command(
        self,
        session: SimulationSession,
        command: str,
        parameters: Dict
    ) -> CommandExecutionResponse:
        """Execute a user command and update simulation state"""
        
        if command not in self.available_commands:
            return CommandExecutionResponse(
                success=False,
                message=f"Unknown command: {command}",
                system_state=session.system_state,
                attacker_state=session.attacker_state,
                stress_level=session.stress_level,
                metrics=session.metrics,
                simulation_time=session.simulation_time
            )
        
        cmd_def = self.available_commands[command]
        
        # Update simulation time
        session.simulation_time += cmd_def["time"]
        
        # Apply command effects
        new_alerts = []
        message = ""
        
        if command == "isolate_network":
            segment = parameters.get("segment", "production")
            session.system_state.network_segment_isolated[segment] = True
            message = f"Network segment '{segment}' isolated successfully"
            
            # Impact on business continuity
            session.system_state.business_continuity_score -= cmd_def["cost"]
            session.metrics["responseAccuracy"] += 5
            session.metrics["riskManagement"] += 8
            
            # Block attacker's lateral movement
            if session.attacker_state.current_phase == AttackerPhase.LATERAL_MOVEMENT:
                session.attacker_state.blocked_paths.append("network_lateral")
                message += " - Attacker's lateral movement blocked!"
        
        elif command == "isolate_host":
            hostname = parameters.get("hostname", "unknown")
            if hostname not in session.system_state.isolated_hosts:
                session.system_state.isolated_hosts.append(hostname)
            message = f"Host '{hostname}' isolated from network"
            
            session.system_state.business_continuity_score -= cmd_def["cost"]
            session.metrics["responseAccuracy"] += 7
            session.metrics["riskManagement"] += 10
            
            # If attacker is on this host, severely impact their progress
            if hostname in session.system_state.compromised_hosts:
                session.attacker_state.progress = max(0, session.attacker_state.progress - 20)
                message += " - Critical attacker foothold eliminated!"
        
        elif command == "disable_account":
            username = parameters.get("username", "unknown")
            if username not in session.system_state.suspicious_accounts_disabled:
                session.system_state.suspicious_accounts_disabled.append(username)
            message = f"Account '{username}' disabled"
            
            session.metrics["responseAccuracy"] += 6
            
            # If this is the attacker's account, major impact
            if "attacker" in username.lower() or username == "admin-backup":
                session.attacker_state.blocked_paths.append("iam_access")
                session.attacker_state.progress = max(0, session.attacker_state.progress - 30)
                message += " - Attacker's access revoked!"
        
        elif command == "enforce_mfa":
            session.system_state.mfa_enforced = True
            message = "MFA enforced across organization"
            session.metrics["riskManagement"] += 15
            session.attacker_state.blocked_paths.append("credential_reuse")
        
        elif command == "secure_s3_bucket":
            bucket_name = parameters.get("bucket_name", "unknown")
            if bucket_name not in session.system_state.s3_buckets_secured:
                session.system_state.s3_buckets_secured.append(bucket_name)
            message = f"S3 bucket '{bucket_name}' secured with strict policies"
            session.metrics["riskManagement"] += 8
            
            # Prevent data exfiltration
            if session.attacker_state.current_phase == AttackerPhase.DATA_EXFILTRATION:
                session.system_state.data_loss_prevented = True
                session.attacker_state.blocked_paths.append("s3_exfiltration")
                message += " - Data exfiltration prevented!"
        
        elif command == "enable_dlp":
            session.system_state.data_loss_prevented = True
            message = "Data Loss Prevention enabled"
            session.metrics["riskManagement"] += 12
            session.attacker_state.blocked_paths.append("data_exfiltration")
        
        elif command == "capture_memory_dump":
            hostname = parameters.get("hostname", "unknown")
            session.system_state.memory_dump_captured = True
            message = f"Memory dump captured from '{hostname}'"
            session.metrics["forensicPreservation"] += 15
        
        elif command == "preserve_logs":
            session.system_state.logs_preserved = True
            message = "Logs preserved for forensic analysis"
            session.metrics["forensicPreservation"] += 10
        
        elif command == "scan_for_malware":
            target = parameters.get("target", "all")
            message = f"Malware scan initiated on '{target}'"
            session.metrics["responseAccuracy"] += 4
            
            # Detect malware
            if random.random() > 0.3:  # 70% chance to detect
                session.system_state.malware_contained = True
                new_alerts.append(Alert(
                    title="Malware Detected",
                    description=f"Trojan.Generic detected on {target}",
                    severity=AlertSeverity.CRITICAL,
                    source="Antivirus",
                    indicators=["C2 communication", "Suspicious file execution"]
                ))
                message += " - Malware detected and contained!"
        
        elif command in ["query_logs", "check_iam_activity", "analyze_network_traffic"]:
            # Investigation commands provide information
            message = f"Investigation command '{command}' executed"
            session.metrics["decisionQuality"] += 3
            
            # Possibly reveal attacker activity
            if random.random() > 0.5 and not session.attacker_state.stealth_mode:
                new_alerts.append(Alert(
                    title="Suspicious Activity Detected",
                    description=f"Investigation revealed anomalous patterns",
                    severity=AlertSeverity.HIGH,
                    source="SIEM Analysis",
                    indicators=["Unusual access patterns", "Off-hours activity"]
                ))
        
        # Record command in history
        cmd_record = Command(
            command=command,
            parameters=parameters,
            cost=cmd_def["cost"],
            time_required=cmd_def["time"]
        )
        session.commands_history.append(cmd_record)
        
        # Update stress level based on effectiveness
        if "blocked" in message or "prevented" in message:
            session.stress_level = max(0, session.stress_level - 5)
        else:
            session.stress_level = min(100, session.stress_level + 2)
        
        # Trigger attacker response
        attacker_response = self._attacker_responds(session, command)
        if attacker_response:
            new_alerts.extend(attacker_response)
        
        return CommandExecutionResponse(
            success=True,
            message=message,
            system_state=session.system_state,
            attacker_state=session.attacker_state,
            new_alerts=new_alerts,
            stress_level=session.stress_level,
            metrics=session.metrics,
            simulation_time=session.simulation_time
        )
    
    def _attacker_responds(self, session: SimulationSession, defender_action: str) -> List[Alert]:
        """Attacker adapts to defender's actions"""
        new_alerts = []
        
        if not session.attacker_state.is_active:
            return new_alerts
        
        # Check if attacker's path is blocked
        if len(session.attacker_state.blocked_paths) > session.attacker_state.fallback_attempts:
            # Attacker tries fallback
            session.attacker_state.fallback_attempts += 1
            session.attacker_state.stealth_mode = False
            
            # Record attacker action
            action = {
                "time": session.simulation_time,
                "action": "Fallback attempt - trying alternative attack vector",
                "triggered_by": defender_action
            }
            session.attacker_actions.append(action)
            
            new_alerts.append(Alert(
                title="Attacker Activity Detected",
                description="Suspicious activity suggests attacker is adapting to defenses",
                severity=AlertSeverity.HIGH,
                source="Threat Intelligence",
                indicators=["Alternative attack vector", "Persistence attempt"]
            ))
        
        # Attacker progresses if not blocked
        elif random.random() > 0.6:  # 40% chance to progress
            session.attacker_state.progress += 10
            
            # Phase progression
            if session.attacker_state.progress >= 100:
                self._advance_attacker_phase(session)
        
        return new_alerts
    
    def _advance_attacker_phase(self, session: SimulationSession):
        """Advance attacker to next phase"""
        phases = [
            AttackerPhase.RECONNAISSANCE,
            AttackerPhase.INITIAL_ACCESS,
            AttackerPhase.PRIVILEGE_ESCALATION,
            AttackerPhase.LATERAL_MOVEMENT,
            AttackerPhase.DATA_EXFILTRATION,
            AttackerPhase.PERSISTENCE,
            AttackerPhase.COVER_TRACKS
        ]
        
        current_idx = phases.index(session.attacker_state.current_phase)
        if current_idx < len(phases) - 1:
            session.attacker_state.current_phase = phases[current_idx + 1]
            session.attacker_state.progress = 0
            
            # Increase stress
            session.stress_level = min(100, session.stress_level + 15)
    
    def evaluate_session(self, session: SimulationSession) -> Dict:
        """Evaluate the simulation session and calculate final score"""
        
        # Calculate time to detection (TTD)
        if session.commands_history:
            first_detection_action = next(
                (cmd for cmd in session.commands_history 
                 if cmd.command in ["query_logs", "check_iam_activity", "analyze_network_traffic"]),
                None
            )
            if first_detection_action:
                session.attacker_state.ttd = first_detection_action.timestamp.timestamp() - session.start_time.timestamp()
        
        # Calculate time to containment (TTC)
        containment_actions = ["isolate_host", "isolate_network", "disable_account", "block_ip"]
        first_containment = next(
            (cmd for cmd in session.commands_history if cmd.command in containment_actions),
            None
        )
        if first_containment:
            session.attacker_state.ttc = first_containment.timestamp.timestamp() - session.start_time.timestamp()
        
        # Calculate component scores
        avg_metrics = sum(session.metrics.values()) / len(session.metrics)
        attacker_interaction_score = self._calculate_attacker_interaction_score(session)
        stress_management_score = max(0, 100 - session.stress_level)
        business_continuity_score = session.system_state.business_continuity_score
        
        # Determine ending type
        ending_type, ending_description = self._determine_ending(session)
        
        # Calculate final score
        final_score = (
            avg_metrics * 0.4 +
            attacker_interaction_score * 0.25 +
            stress_management_score * 0.15 +
            business_continuity_score * 0.2
        )
        
        # Apply ending bonus/penalty
        if "success" in ending_type:
            final_score += 10
        elif "stealth" in ending_type:
            final_score -= 20
        
        final_score = max(0, min(100, final_score))
        
        # Determine grade
        if final_score >= 90:
            grade = "ممتاز"
        elif final_score >= 80:
            grade = "جيد جداً"
        elif final_score >= 70:
            grade = "جيد"
        elif final_score >= 60:
            grade = "مقبول"
        else:
            grade = "يحتاج تحسين"
        
        return {
            "final_score": round(final_score, 2),
            "grade": grade,
            "ending_type": ending_type,
            "ending_description": ending_description,
            "metrics": session.metrics,
            "attacker_interaction_score": attacker_interaction_score,
            "stress_management_score": stress_management_score,
            "business_continuity_score": business_continuity_score,
            "time_to_detection": session.attacker_state.ttd,
            "time_to_containment": session.attacker_state.ttc,
            "recommendations": self._generate_recommendations(session)
        }
    
    def _calculate_attacker_interaction_score(self, session: SimulationSession) -> float:
        """Calculate how well the defender handled the attacker"""
        score = 70.0
        
        # Reward for early containment
        if len(session.attacker_actions) < 3:
            score += 15
        
        # Penalty for letting attacker advance
        if session.attacker_state.current_phase in [
            AttackerPhase.DATA_EXFILTRATION,
            AttackerPhase.PERSISTENCE,
            AttackerPhase.COVER_TRACKS
        ]:
            score -= 20
        
        # Reward for blocking paths
        score += len(session.attacker_state.blocked_paths) * 5
        
        return max(0, min(100, score))
    
    def _determine_ending(self, session: SimulationSession) -> Tuple[str, str]:
        """Determine the ending type based on session state"""
        
        # Check if attacker was contained early
        if session.attacker_state.current_phase in [
            AttackerPhase.RECONNAISSANCE,
            AttackerPhase.INITIAL_ACCESS
        ] and len(session.attacker_state.blocked_paths) >= 2:
            return ("early_success", 
                    "نجاح باهر! تم احتواء الهجوم في مراحله المبكرة قبل حدوث أي ضرر جوهري.")
        
        # Check if attacker reached advanced phases
        if session.attacker_state.current_phase in [
            AttackerPhase.DATA_EXFILTRATION,
            AttackerPhase.COVER_TRACKS
        ]:
            return ("late_containment",
                    "احتواء متأخر. تم وقف الهجوم لكن بعد أن حقق المهاجم بعض أهدافه.")
        
        # Check business continuity
        if session.system_state.business_continuity_score < 60:
            return ("business_impact",
                    "تأثير كبير على الأعمال. تم احتواء الهجوم لكن مع تعطل ملحوظ في الخدمات.")
        
        # Default success
        return ("successful_containment",
                "نجاح! تم احتواء الهجوم بفعالية مع الحفاظ على استمرارية الأعمال.")
    
    def _generate_recommendations(self, session: SimulationSession) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        if session.metrics["responseTime"] < 70:
            recommendations.append("تحسين سرعة الاستجابة للحوادث الأمنية")
        
        if session.metrics["forensicPreservation"] < 70:
            recommendations.append("التركيز أكثر على الحفاظ على الأدلة الجنائية للملاحقة القانونية")
        
        if session.system_state.business_continuity_score < 80:
            recommendations.append("الموازنة بين الإجراءات الأمنية واستمرارية الأعمال")
        
        if len(session.attacker_actions) > 5:
            recommendations.append("الاستجابة بشكل أسرع لمنع تقدم المهاجم")
        
        if session.stress_level > 70:
            recommendations.append("تطوير مهارات إدارة الضغط في الأزمات")
        
        if not recommendations:
            recommendations.append("أداء ممتاز! استمر في التدريب على سيناريوهات أكثر تعقيداً")
        
        return recommendations
