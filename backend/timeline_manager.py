from typing import List, Dict, Any
from datetime import datetime, timezone

class TimelineManager:
    """Manages simulation timeline events"""
    
    def __init__(self):
        self.events = []
    
    def add_event(self, event_type: str, title: str, description: str, 
                  severity: str = "info", metadata: Dict = None):
        """Add event to timeline"""
        event = {
            "id": len(self.events),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "type": event_type,  # command, alert, attacker, system, message
            "title": title,
            "description": description,
            "severity": severity,
            "metadata": metadata or {}
        }
        self.events.append(event)
        return event
    
    def get_timeline(self) -> List[Dict]:
        """Get full timeline"""
        return sorted(self.events, key=lambda x: x["timestamp"], reverse=True)
    
    def get_recent_events(self, count: int = 10) -> List[Dict]:
        """Get recent events"""
        return self.get_timeline()[:count]
    
    def get_events_by_type(self, event_type: str) -> List[Dict]:
        """Get events by type"""
        return [e for e in self.events if e["type"] == event_type]
    
    def get_critical_events(self) -> List[Dict]:
        """Get critical/high severity events"""
        return [e for e in self.events if e["severity"] in ["critical", "high"]]
