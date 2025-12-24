class AIAssistant:
    """AI Assistant that provides intelligent hints and guidance"""
    
    def __init__(self):
        self.hint_history = []
        self.advice_given = []
        
    def analyze_situation(self, session) -> dict:
        """Analyze current situation and provide intelligent advice"""
        advice = {
            "severity": "info",
            "message": "",
            "suggested_actions": [],
            "reasoning": ""
        }
        
        # Check if user is stuck (no actions for a while)
        if len(session.commands_history) < 2 and session.simulation_time > 3:
            advice["severity"] = "warning"
            advice["message"] = "🤖 يبدو أنك تحتاج إلى البدء! دعني أساعدك."
            advice["suggested_actions"] = [
                "query_logs: ابدأ بالتحقيق في السجلات",
                "check_iam_activity: تحقق من نشاط IAM المشبوه"
            ]
            advice["reasoning"] = "البدء السريع في التحقيق يقلل وقت الاكتشاف (TTD)"
            return advice
        
        # Check attacker progress
        if session.attacker_state.progress > 70:
            advice["severity"] = "critical"
            advice["message"] = "🚨 المهاجم يتقدم بسرعة! تحتاج لإجراءات عاجلة."
            
            if session.attacker_state.current_phase == "lateral_movement":
                advice["suggested_actions"] = [
                    "isolate_network: عزل الشبكة لمنع الانتقال الجانبي",
                    "isolate_host: عزل الأجهزة المخترقة"
                ]
            elif session.attacker_state.current_phase == "data_exfiltration":
                advice["suggested_actions"] = [
                    "enable_dlp: فعّل منع فقدان البيانات فوراً",
                    "secure_s3_bucket: أمّن حاويات S3"
                ]
            
            advice["reasoning"] = f"المهاجم في مرحلة {session.attacker_state.current_phase}"
            return advice
        
        # Check if forensics are being neglected
        if session.simulation_time > 5 and not session.system_state.logs_preserved:
            advice["severity"] = "warning"
            advice["message"] = "⚠️ لا تنسَ حفظ الأدلة الجنائية!"
            advice["suggested_actions"] = [
                "preserve_logs: احفظ السجلات للتحقيق القانوني",
                "capture_memory_dump: التقط صورة الذاكرة"
            ]
            advice["reasoning"] = "الأدلة الجنائية ضرورية للملاحقة القانونية والتعلم من الحادثة"
            return advice
        
        # Check business continuity impact
        if session.system_state.business_continuity_score < 70:
            advice["severity"] = "warning"
            advice["message"] = "💼 انتبه! استمرارية الأعمال تتأثر."
            advice["suggested_actions"] = [
                "Focus on targeted containment",
                "Avoid broad network isolation"
            ]
            advice["reasoning"] = "التوازن بين الأمن واستمرارية الأعمال مهم جداً"
            return advice
        
        # Check if user is doing well
        avg_metrics = sum(session.metrics.values()) / len(session.metrics)
        if avg_metrics > 85 and len(session.commands_history) > 3:
            advice["severity"] = "success"
            advice["message"] = "✨ أداء ممتاز! استمر على هذا النهج."
            advice["suggested_actions"] = [
                "Continue systematic approach",
                "Don't forget to document everything"
            ]
            advice["reasoning"] = "نهجك المنظم يحقق نتائج رائعة"
            return advice
        
        # Default positive reinforcement
        if len(session.commands_history) > 0:
            advice["severity"] = "info"
            advice["message"] = "👍 تقدم جيد! واصل التحقيق."
            advice["reasoning"] = "كل إجراء تتخذه يقربنا من احتواء التهديد"
        
        return advice
    
    def get_hint(self, session, difficulty: str = "medium") -> dict:
        """Get contextual hint based on situation"""
        hints = {
            "easy": [
                "💡 تلميح: ابدأ بفحص السجلات لتحديد مصدر الهجوم",
                "💡 تلميح: عزل الأجهزة المخترقة يمنع انتشار الهجوم",
                "💡 تلميح: لا تنسَ حفظ الأدلة قبل التنظيف"
            ],
            "medium": [
                "💡 راقب أنماط حركة المرور غير الطبيعية",
                "💡 تحقق من التغييرات الأخيرة في أذونات IAM",
                "💡 ابحث عن اتصالات C2 (Command & Control)"
            ],
            "hard": [
                "💡 حلل الـ IOCs (Indicators of Compromise) بعمق",
                "💡 تتبع الـ Lateral Movement عبر الشبكة",
                "💡 ابحث عن Persistence Mechanisms"
            ]
        }
        
        available_hints = hints.get(difficulty, hints["medium"])
        
        # Filter hints not already given
        new_hints = [h for h in available_hints if h not in self.hint_history]
        
        if new_hints:
            hint = new_hints[0]
            self.hint_history.append(hint)
            return {"hint": hint, "available": True}
        
        return {"hint": "لقد استخدمت جميع التلميحات المتاحة!", "available": False}
    
    def get_tutorial_step(self, step_number: int) -> dict:
        """Get tutorial step for beginners"""
        tutorial_steps = [
            {
                "step": 1,
                "title": "مرحباً بك في المحاكاة!",
                "description": "أنت الآن محلل SOC. هدفك: احتواء هجوم سيبراني.",
                "action": "ابدأ بفحص الإنذارات في اللوحة اليسرى"
            },
            {
                "step": 2,
                "title": "استخدم واجهة الأوامر",
                "description": "يمكنك تنفيذ الأوامر مباشرة أو استخدام الأزرار السريعة",
                "action": "جرب: query_logs query=failed_login"
            },
            {
                "step": 3,
                "title": "راقب المهاجم",
                "description": "المهاجم التكيفي يستجيب لإجراءاتك",
                "action": "راقب شريط تقدم المهاجم في الأعلى"
            },
            {
                "step": 4,
                "title": "احفظ الأدلة",
                "description": "الأدلة الجنائية مهمة للملاحقة القانونية",
                "action": "نفذ: preserve_logs source=cloudtrail"
            },
            {
                "step": 5,
                "title": "احتوِ التهديد",
                "description": "استخدم العزل والحظر لوقف المهاجم",
                "action": "عزل الأجهزة المخترقة وحظر IPs المشبوهة"
            }
        ]
        
        if 0 < step_number <= len(tutorial_steps):
            return tutorial_steps[step_number - 1]
        
        return None
