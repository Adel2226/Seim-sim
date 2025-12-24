from typing import List, Dict, Any
import random
from datetime import datetime, timezone
from models import Alert, AlertSeverity

class RealtimeEventGenerator:
    """Generates realistic real-time events during simulation"""
    
    def __init__(self):
        self.pressure_messages = [
            {
                "sender": "CEO",
                "message": "ما هو الوضع؟ لدينا اجتماع مجلس إدارة خلال ساعة!",
                "urgency": "high",
                "trigger_time": 5
            },
            {
                "sender": "CISO",
                "message": "هل تم تحديد نطاق الاختراق؟ أحتاج تقريراً فورياً.",
                "urgency": "high",
                "trigger_time": 3
            },
            {
                "sender": "Legal Team",
                "message": "هل يوجد تسريب بيانات عملاء؟ نحتاج للإبلاغ خلال 72 ساعة!",
                "urgency": "critical",
                "trigger_time": 7
            },
            {
                "sender": "VP Engineering",
                "message": "الفريق يسأل متى يمكنهم العودة للعمل. الإنتاجية متوقفة!",
                "urgency": "medium",
                "trigger_time": 10
            },
            {
                "sender": "PR Team",
                "message": "وسائل الإعلام بدأت بالسؤال. ما هو البيان الصحفي؟",
                "urgency": "high",
                "trigger_time": 12
            },
            {
                "sender": "Customer Support",
                "message": "العملاء يشتكون من عدم الوصول للخدمات. ماذا نخبرهم؟",
                "urgency": "high",
                "trigger_time": 8
            }
        ]
        
        self.team_messages = [
            {
                "sender": "SOC Analyst",
                "message": "وجدت نشاطاً مشبوهاً إضافياً في السجلات. هل أحقق؟",
                "type": "question"
            },
            {
                "sender": "Network Engineer",
                "message": "Firewall يظهر ارتفاعاً في الاتصالات الخارجية غير المعتادة.",
                "type": "info"
            },
            {
                "sender": "Incident Response Lead",
                "message": "جيد! استمر في هذا الاتجاه. لكن لا تنسَ جمع الأدلة.",
                "type": "feedback"
            },
            {
                "sender": "Forensics Specialist",
                "message": "تحذير: لم يتم حفظ السجلات بعد. قد نفقد أدلة حاسمة!",
                "type": "warning"
            },
            {
                "sender": "Security Manager",
                "message": "رائع! القرار السريع أنقذنا من تصعيد الهجوم.",
                "type": "praise"
            }
        ]
        
        self.random_events = [
            {
                "type": "alert",
                "title": "New Suspicious Process Detected",
                "description": "Process 'svchost.exe' spawned from unusual location",
                "severity": "high",
                "probability": 0.3
            },
            {
                "type": "alert",
                "title": "Unusual Network Traffic",
                "description": "Large data transfer detected to unknown IP",
                "severity": "critical",
                "probability": 0.2
            },
            {
                "type": "alert",
                "title": "Failed Login Attempts Surge",
                "description": "300+ failed login attempts in last 5 minutes",
                "severity": "high",
                "probability": 0.25
            },
            {
                "type": "system",
                "message": "Backup system automatically triggered",
                "positive": True,
                "probability": 0.15
            },
            {
                "type": "system",
                "message": "EDR detected and quarantined malware sample",
                "positive": True,
                "probability": 0.2
            }
        ]
    
    def get_pressure_message(self, simulation_time: float) -> Dict[str, Any]:
        """Get pressure message based on simulation time"""
        for msg in self.pressure_messages:
            if abs(simulation_time - msg["trigger_time"]) < 0.5:
                return msg
        return None
    
    def get_random_team_message(self) -> Dict[str, Any]:
        """Get random team message"""
        if random.random() < 0.3:  # 30% chance
            return random.choice(self.team_messages)
        return None
    
    def generate_random_event(self) -> Dict[str, Any]:
        """Generate random realistic event"""
        for event in self.random_events:
            if random.random() < event["probability"]:
                return event
        return None
    
    def create_alert_from_event(self, event: Dict) -> Alert:
        """Create Alert from event"""
        return Alert(
            title=event["title"],
            description=event["description"],
            severity=AlertSeverity(event["severity"]),
            source="Real-time Detection",
            indicators=["Dynamic event", "Real-time"]
        )
    
    def get_achievement(self, metrics: Dict[str, float], actions_count: int) -> Dict[str, Any]:
        """Check and return achievements"""
        achievements = []
        
        # Speed achievements
        if actions_count >= 5 and metrics.get("responseTime", 0) > 90:
            achievements.append({
                "id": "speed_demon",
                "title": "⚡ سرعة البرق",
                "description": "استجابة فائقة السرعة!",
                "points": 50
            })
        
        # Accuracy achievements
        if metrics.get("responseAccuracy", 0) >= 95:
            achievements.append({
                "id": "sharpshooter",
                "title": "🎯 دقة عالية",
                "description": "دقة استجابة 95%+",
                "points": 75
            })
        
        # Forensics achievements
        if metrics.get("forensicPreservation", 0) >= 90:
            achievements.append({
                "id": "evidence_master",
                "title": "🔍 خبير الأدلة",
                "description": "حفظ ممتاز للأدلة الجنائية",
                "points": 60
            })
        
        # Risk management achievements
        if metrics.get("riskManagement", 0) >= 90:
            achievements.append({
                "id": "risk_ninja",
                "title": "🛡️ ماستر الحماية",
                "description": "إدارة مخاطر متقنة",
                "points": 70
            })
        
        return achievements
