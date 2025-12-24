from typing import Dict, List
import random

class SoundEffects:
    """Advanced sound effects system"""
    
    @staticmethod
    def get_sound_config(event_type: str, severity: str = "medium") -> Dict:
        """Get sound configuration for event"""
        
        sounds = {
            "alert_critical": {
                "type": "beep",
                "frequency": 1000,
                "duration": 0.3,
                "repeat": 3,
                "interval": 0.2
            },
            "alert_high": {
                "type": "beep",
                "frequency": 800,
                "duration": 0.2,
                "repeat": 2,
                "interval": 0.15
            },
            "achievement": {
                "type": "melody",
                "notes": [523, 659, 784, 1047],  # C, E, G, C (major chord)
                "duration": 0.15
            },
            "command_success": {
                "type": "beep",
                "frequency": 600,
                "duration": 0.1,
                "repeat": 1
            },
            "command_error": {
                "type": "buzz",
                "frequency": 200,
                "duration": 0.3,
                "repeat": 1
            },
            "attacker_blocked": {
                "type": "powerdown",
                "start_frequency": 800,
                "end_frequency": 200,
                "duration": 0.5
            },
            "pressure_message": {
                "type": "notification",
                "frequency": 700,
                "duration": 0.2,
                "repeat": 2
            },
            "level_up": {
                "type": "melody",
                "notes": [392, 523, 659, 784, 1047],  # G, C, E, G, C
                "duration": 0.12
            }
        }
        
        key = f"{event_type}_{severity}" if f"{event_type}_{severity}" in sounds else event_type
        return sounds.get(key, sounds.get(event_type, {"type": "silent"}))


class RankingSystem:
    """Player ranking and leveling system"""
    
    RANKS = [
        {"name": "مبتدئ", "min_score": 0, "icon": "🌱"},
        {"name": "محلل مبتدئ", "min_score": 60, "icon": "👨‍💻"},
        {"name": "محلل SOC", "min_score": 70, "icon": "🛡️"},
        {"name": "محلل متقدم", "min_score": 80, "icon": "⚔️"},
        {"name": "خبير استجابة", "min_score": 85, "icon": "🎯"},
        {"name": "قائد SOC", "min_score": 90, "icon": "👑"},
        {"name": "أسطورة الحماية", "min_score": 95, "icon": "🏆"}
    ]
    
    @classmethod
    def get_rank(cls, score: float) -> Dict:
        """Get rank based on score"""
        for i in range(len(cls.RANKS) - 1, -1, -1):
            if score >= cls.RANKS[i]["min_score"]:
                rank = cls.RANKS[i].copy()
                
                # Calculate progress to next rank
                if i < len(cls.RANKS) - 1:
                    current_min = cls.RANKS[i]["min_score"]
                    next_min = cls.RANKS[i + 1]["min_score"]
                    progress = ((score - current_min) / (next_min - current_min)) * 100
                    rank["progress_to_next"] = min(100, progress)
                    rank["next_rank"] = cls.RANKS[i + 1]["name"]
                else:
                    rank["progress_to_next"] = 100
                    rank["next_rank"] = "MAX"
                
                return rank
        
        return cls.RANKS[0]
    
    @classmethod
    def get_title(cls, total_points: int, sessions_completed: int) -> str:
        """Get special title based on achievements"""
        titles = []
        
        if total_points > 1000:
            titles.append("🌟 ملك النقاط")
        if sessions_completed > 10:
            titles.append("🎮 مدمن التدريب")
        if sessions_completed > 5:
            titles.append("💪 مثابر")
        
        return " | ".join(titles) if titles else "🎯 محارب سيبراني"


class DifficultyManager:
    """Dynamic difficulty adjustment"""
    
    DIFFICULTY_LEVELS = {
        "tutorial": {
            "name": "تعليمي",
            "attacker_speed": 0.5,
            "hints_enabled": True,
            "time_pressure": False,
            "score_multiplier": 0.8
        },
        "easy": {
            "name": "سهل",
            "attacker_speed": 0.7,
            "hints_enabled": True,
            "time_pressure": False,
            "score_multiplier": 0.9
        },
        "normal": {
            "name": "عادي",
            "attacker_speed": 1.0,
            "hints_enabled": True,
            "time_pressure": True,
            "score_multiplier": 1.0
        },
        "hard": {
            "name": "صعب",
            "attacker_speed": 1.3,
            "hints_enabled": False,
            "time_pressure": True,
            "score_multiplier": 1.2
        },
        "expert": {
            "name": "خبير",
            "attacker_speed": 1.5,
            "hints_enabled": False,
            "time_pressure": True,
            "score_multiplier": 1.5
        }
    }
    
    @classmethod
    def get_difficulty_config(cls, level: str) -> Dict:
        """Get difficulty configuration"""
        return cls.DIFFICULTY_LEVELS.get(level, cls.DIFFICULTY_LEVELS["normal"])
    
    @classmethod
    def adjust_attacker_progress(cls, base_progress: float, difficulty: str) -> float:
        """Adjust attacker progress based on difficulty"""
        config = cls.get_difficulty_config(difficulty)
        return base_progress * config["attacker_speed"]
