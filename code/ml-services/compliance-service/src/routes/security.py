import logging
import re
import secrets
from datetime import datetime, timedelta
from typing import Dict, List

from flask import Blueprint, jsonify, request

security_bp = Blueprint("security", __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SecurityMonitor:
    """Advanced security monitoring and threat detection system"""

    def __init__(self):
        self.security_events = []
        self.threat_indicators = []
        self.blocked_ips = set()
        self.security_policies = self._initialize_security_policies()

    def _initialize_security_policies(self) -> Dict:
        """Initialize security policies and thresholds"""
        return {
            "authentication": {
                "max_failed_attempts": 5,
                "lockout_duration_minutes": 30,
                "password_min_length": 12,
                "password_complexity_required": True,
                "mfa_required_roles": ["ADMIN", "MANAGER", "COMPLIANCE_OFFICER"],
            },
            "session_management": {
                "max_session_duration_hours": 8,
                "idle_timeout_minutes": 30,
                "concurrent_sessions_limit": 3,
            },
            "network_security": {
                "max_requests_per_minute": 100,
                "suspicious_ip_threshold": 50,
                "geo_blocking_enabled": True,
                "allowed_countries": ["US", "CA", "GB", "AU"],
            },
            "data_protection": {
                "encryption_required": True,
                "data_masking_enabled": True,
                "secure_transmission_only": True,
                "backup_encryption_required": True,
            },
        }

    def analyze_login_attempt(self, login_data: Dict) -> Dict:
        """Analyze login attempt for security threats"""

        threats = []
        risk_score = 0

        username = login_data.get("username", "")
        ip_address = login_data.get("ip_address", "")
        user_agent = login_data.get("user_agent", "")
        success = login_data.get("success", False)
        timestamp = login_data.get("timestamp", datetime.now().isoformat())

        # Check for brute force attacks
        recent_attempts = self._get_recent_failed_attempts(username, ip_address)
        if (
            recent_attempts
            >= self.security_policies["authentication"]["max_failed_attempts"]
        ):
            threats.append(
                {
                    "type": "BRUTE_FORCE_ATTACK",
                    "description": f"Multiple failed login attempts detected for {username}",
                    "severity": "HIGH",
                    "risk_points": 30,
                }
            )
            risk_score += 30

        # Check for suspicious IP addresses
        if self._is_suspicious_ip(ip_address):
            threats.append(
                {
                    "type": "SUSPICIOUS_IP",
                    "description": f"Login attempt from suspicious IP: {ip_address}",
                    "severity": "MEDIUM",
                    "risk_points": 20,
                }
            )
            risk_score += 20

        # Check for unusual user agent
        if self._is_suspicious_user_agent(user_agent):
            threats.append(
                {
                    "type": "SUSPICIOUS_USER_AGENT",
                    "description": "Login attempt with suspicious user agent",
                    "severity": "LOW",
                    "risk_points": 10,
                }
            )
            risk_score += 10

        # Check for geographic anomalies
        location = login_data.get("location", {})
        if self._is_geographic_anomaly(username, location):
            threats.append(
                {
                    "type": "GEOGRAPHIC_ANOMALY",
                    "description": "Login from unusual geographic location",
                    "severity": "MEDIUM",
                    "risk_points": 25,
                }
            )
            risk_score += 25

        # Check for time-based anomalies
        if self._is_time_anomaly(timestamp):
            threats.append(
                {
                    "type": "TIME_ANOMALY",
                    "description": "Login attempt outside normal business hours",
                    "severity": "LOW",
                    "risk_points": 5,
                }
            )
            risk_score += 5

        # Determine action based on risk score
        if risk_score >= 50:
            action = "BLOCK"
            self.blocked_ips.add(ip_address)
        elif risk_score >= 30:
            action = "CHALLENGE"  # Require additional authentication
        elif risk_score >= 15:
            action = "MONITOR"
        else:
            action = "ALLOW"

        security_event = {
            "event_id": self._generate_event_id(),
            "event_type": "LOGIN_ATTEMPT",
            "username": username,
            "ip_address": ip_address,
            "success": success,
            "risk_score": risk_score,
            "threats": threats,
            "action": action,
            "timestamp": timestamp,
        }

        self.security_events.append(security_event)

        return {
            "security_assessment": {
                "risk_score": risk_score,
                "risk_level": self._get_risk_level(risk_score),
                "action": action,
                "threats_detected": len(threats),
                "threats": threats,
            },
            "recommendations": self._get_security_recommendations(threats),
            "event_id": security_event["event_id"],
        }

    def _get_recent_failed_attempts(self, username: str, ip_address: str) -> int:
        """Count recent failed login attempts"""
        cutoff_time = datetime.now() - timedelta(minutes=15)

        count = 0
        for event in self.security_events:
            if (
                event.get("event_type") == "LOGIN_ATTEMPT"
                and not event.get("success")
                and (
                    event.get("username") == username
                    or event.get("ip_address") == ip_address
                )
                and datetime.fromisoformat(event.get("timestamp", "")) > cutoff_time
            ):
                count += 1

        return count

    def _is_suspicious_ip(self, ip_address: str) -> bool:
        """Check if IP address is suspicious"""
        # Check against known threat intelligence
        suspicious_patterns = [
            r"^10\.0\.0\.",  # Example: block certain internal ranges
            r"^192\.168\.1\.",  # Example: suspicious local network
        ]

        for pattern in suspicious_patterns:
            if re.match(pattern, ip_address):
                return True

        # Check if IP is in blocked list
        return ip_address in self.blocked_ips

    def _is_suspicious_user_agent(self, user_agent: str) -> bool:
        """Check if user agent is suspicious"""
        if not user_agent:
            return True

        suspicious_indicators = [
            "bot",
            "crawler",
            "spider",
            "scraper",
            "automated",
            "python-requests",
            "curl",
            "wget",
        ]

        user_agent_lower = user_agent.lower()
        return any(indicator in user_agent_lower for indicator in suspicious_indicators)

    def _is_geographic_anomaly(self, username: str, location: Dict) -> bool:
        """Check for geographic anomalies"""
        country = location.get("country", "")

        # Check if country is in allowed list
        allowed_countries = self.security_policies["network_security"][
            "allowed_countries"
        ]
        if country and country not in allowed_countries:
            return True

        # Check for rapid geographic changes (would require user history)
        return False

    def _is_time_anomaly(self, timestamp: str) -> bool:
        """Check for time-based anomalies"""
        try:
            dt = datetime.fromisoformat(timestamp)
            hour = dt.hour

            # Consider 6 AM to 10 PM as normal business hours
            return hour < 6 or hour > 22
        except:
            return False

    def _get_risk_level(self, risk_score: int) -> str:
        """Convert risk score to risk level"""
        if risk_score >= 50:
            return "CRITICAL"
        elif risk_score >= 30:
            return "HIGH"
        elif risk_score >= 15:
            return "MEDIUM"
        else:
            return "LOW"

    def _get_security_recommendations(self, threats: List[Dict]) -> List[str]:
        """Generate security recommendations based on threats"""
        recommendations = []

        threat_types = [t["type"] for t in threats]

        if "BRUTE_FORCE_ATTACK" in threat_types:
            recommendations.append("Implement account lockout and CAPTCHA")
            recommendations.append("Enable multi-factor authentication")

        if "SUSPICIOUS_IP" in threat_types:
            recommendations.append("Review and update IP whitelist/blacklist")
            recommendations.append("Implement geo-blocking for high-risk regions")

        if "GEOGRAPHIC_ANOMALY" in threat_types:
            recommendations.append("Require additional verification for foreign logins")
            recommendations.append("Notify user of login from new location")

        if not recommendations:
            recommendations.append("Continue monitoring for suspicious activity")

        return recommendations

    def _generate_event_id(self) -> str:
        """Generate unique event ID"""
        return f"SEC_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{secrets.token_hex(4).upper()}"

    def monitor_api_usage(self, api_data: Dict) -> Dict:
        """Monitor API usage for security threats"""

        threats = []
        risk_score = 0

        endpoint = api_data.get("endpoint", "")
        api_data.get("method", "")
        ip_address = api_data.get("ip_address", "")
        api_data.get("user_id", "")
        response_code = api_data.get("response_code", 200)

        # Check for rate limiting violations
        request_count = self._get_recent_request_count(ip_address)
        max_requests = self.security_policies["network_security"][
            "max_requests_per_minute"
        ]

        if request_count > max_requests:
            threats.append(
                {
                    "type": "RATE_LIMIT_VIOLATION",
                    "description": f"IP {ip_address} exceeded rate limit: {request_count} requests/minute",
                    "severity": "HIGH",
                    "risk_points": 25,
                }
            )
            risk_score += 25

        # Check for SQL injection attempts
        if self._detect_sql_injection(api_data.get("parameters", {})):
            threats.append(
                {
                    "type": "SQL_INJECTION_ATTEMPT",
                    "description": "Potential SQL injection detected in request parameters",
                    "severity": "CRITICAL",
                    "risk_points": 40,
                }
            )
            risk_score += 40

        # Check for XSS attempts
        if self._detect_xss_attempt(api_data.get("parameters", {})):
            threats.append(
                {
                    "type": "XSS_ATTEMPT",
                    "description": "Potential XSS attack detected in request parameters",
                    "severity": "HIGH",
                    "risk_points": 30,
                }
            )
            risk_score += 30

        # Check for unauthorized access attempts
        if response_code in [401, 403]:
            threats.append(
                {
                    "type": "UNAUTHORIZED_ACCESS",
                    "description": f"Unauthorized access attempt to {endpoint}",
                    "severity": "MEDIUM",
                    "risk_points": 15,
                }
            )
            risk_score += 15

        # Check for sensitive endpoint access
        if self._is_sensitive_endpoint(endpoint):
            threats.append(
                {
                    "type": "SENSITIVE_ENDPOINT_ACCESS",
                    "description": f"Access to sensitive endpoint: {endpoint}",
                    "severity": "MEDIUM",
                    "risk_points": 10,
                }
            )
            risk_score += 10

        return {
            "api_security_assessment": {
                "risk_score": risk_score,
                "risk_level": self._get_risk_level(risk_score),
                "threats_detected": len(threats),
                "threats": threats,
            },
            "monitoring_timestamp": datetime.now().isoformat(),
        }

    def _get_recent_request_count(self, ip_address: str) -> int:
        """Count recent API requests from IP"""
        cutoff_time = datetime.now() - timedelta(minutes=1)

        count = 0
        for event in self.security_events:
            if (
                event.get("event_type") == "API_REQUEST"
                and event.get("ip_address") == ip_address
                and datetime.fromisoformat(event.get("timestamp", "")) > cutoff_time
            ):
                count += 1

        return count

    def _detect_sql_injection(self, parameters: Dict) -> bool:
        """Detect potential SQL injection attempts"""
        sql_patterns = [
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)",
            r"(\b(UNION|OR|AND)\b.*\b(SELECT|INSERT|UPDATE|DELETE)\b)",
            r"('|\"|;|--|\*|\/\*|\*\/)",
            r"(\b(EXEC|EXECUTE|SP_|XP_)\b)",
        ]

        for value in parameters.values():
            if isinstance(value, str):
                for pattern in sql_patterns:
                    if re.search(pattern, value.upper()):
                        return True

        return False

    def _detect_xss_attempt(self, parameters: Dict) -> bool:
        """Detect potential XSS attempts"""
        xss_patterns = [
            r"<script[^>]*>.*?</script>",
            r"javascript:",
            r"on\w+\s*=",
            r"<iframe[^>]*>",
            r"<object[^>]*>",
            r"<embed[^>]*>",
        ]

        for value in parameters.values():
            if isinstance(value, str):
                for pattern in xss_patterns:
                    if re.search(pattern, value, re.IGNORECASE):
                        return True

        return False

    def _is_sensitive_endpoint(self, endpoint: str) -> bool:
        """Check if endpoint is considered sensitive"""
        sensitive_patterns = [
            "/admin/",
            "/api/admin/",
            "/management/",
            "/config/",
            "/settings/",
            "/users/",
            "/accounts/",
            "/transactions/",
            "/reports/",
        ]

        return any(pattern in endpoint.lower() for pattern in sensitive_patterns)

    def generate_security_report(self, hours: int = 24) -> Dict:
        """Generate comprehensive security report"""

        cutoff_time = datetime.now() - timedelta(hours=hours)
        recent_events = [
            e
            for e in self.security_events
            if datetime.fromisoformat(e.get("timestamp", "")) > cutoff_time
        ]

        # Calculate statistics
        total_events = len(recent_events)
        threat_events = [e for e in recent_events if e.get("threats")]
        blocked_attempts = [e for e in recent_events if e.get("action") == "BLOCK"]

        # Threat distribution
        threat_types = {}
        for event in threat_events:
            for threat in event.get("threats", []):
                threat_type = threat.get("type", "UNKNOWN")
                threat_types[threat_type] = threat_types.get(threat_type, 0) + 1

        # Risk level distribution
        risk_levels = {}
        for event in recent_events:
            risk_score = event.get("risk_score", 0)
            risk_level = self._get_risk_level(risk_score)
            risk_levels[risk_level] = risk_levels.get(risk_level, 0) + 1

        # Top threat sources
        ip_threats = {}
        for event in threat_events:
            ip = event.get("ip_address", "UNKNOWN")
            ip_threats[ip] = ip_threats.get(ip, 0) + 1

        top_threat_ips = sorted(ip_threats.items(), key=lambda x: x[1], reverse=True)[
            :10
        ]

        return {
            "report_period_hours": hours,
            "summary": {
                "total_security_events": total_events,
                "threat_events": len(threat_events),
                "blocked_attempts": len(blocked_attempts),
                "unique_threat_ips": len(ip_threats),
                "blocked_ips_count": len(self.blocked_ips),
            },
            "threat_analysis": {
                "threat_types": threat_types,
                "risk_levels": risk_levels,
                "top_threat_sources": top_threat_ips,
            },
            "security_posture": {
                "overall_risk": (
                    "HIGH"
                    if len(blocked_attempts) > 10
                    else "MEDIUM" if len(threat_events) > 5 else "LOW"
                ),
                "blocked_ips": list(self.blocked_ips),
                "active_policies": len(self.security_policies),
            },
            "generated_at": datetime.now().isoformat(),
        }


# Initialize security monitor
security_monitor = SecurityMonitor()


@security_bp.route("/analyze-login", methods=["POST"])
def analyze_login_attempt():
    """Analyze login attempt for security threats"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No login data provided"}), 400

        # Add request metadata
        data.update(
            {
                "ip_address": data.get("ip_address", request.remote_addr),
                "user_agent": data.get("user_agent", request.headers.get("User-Agent")),
                "timestamp": data.get("timestamp", datetime.now().isoformat()),
            }
        )

        result = security_monitor.analyze_login_attempt(data)

        logger.info(
            f"Login security analysis completed: {result['security_assessment']['risk_level']} risk"
        )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error analyzing login attempt: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@security_bp.route("/monitor-api", methods=["POST"])
def monitor_api_usage():
    """Monitor API usage for security threats"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No API data provided"}), 400

        # Add request metadata
        data.update(
            {
                "ip_address": data.get("ip_address", request.remote_addr),
                "timestamp": datetime.now().isoformat(),
            }
        )

        result = security_monitor.monitor_api_usage(data)

        # Log API request event
        api_event = {
            "event_id": security_monitor._generate_event_id(),
            "event_type": "API_REQUEST",
            "endpoint": data.get("endpoint"),
            "method": data.get("method"),
            "ip_address": data.get("ip_address"),
            "user_id": data.get("user_id"),
            "response_code": data.get("response_code"),
            "risk_score": result["api_security_assessment"]["risk_score"],
            "threats": result["api_security_assessment"]["threats"],
            "timestamp": data.get("timestamp"),
        }

        security_monitor.security_events.append(api_event)

        logger.info(
            f"API security monitoring completed: {result['api_security_assessment']['risk_level']} risk"
        )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error monitoring API usage: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@security_bp.route("/security-report", methods=["GET"])
def get_security_report():
    """Generate comprehensive security report"""
    try:
        hours = int(request.args.get("hours", 24))

        report = security_monitor.generate_security_report(hours)

        logger.info(f"Security report generated for {hours} hours")

        return jsonify(report), 200

    except Exception as e:
        logger.error(f"Error generating security report: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@security_bp.route("/blocked-ips", methods=["GET"])
def get_blocked_ips():
    """Get list of blocked IP addresses"""
    try:
        return (
            jsonify(
                {
                    "blocked_ips": list(security_monitor.blocked_ips),
                    "total_blocked": len(security_monitor.blocked_ips),
                    "retrieved_at": datetime.now().isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error retrieving blocked IPs: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@security_bp.route("/unblock-ip", methods=["POST"])
def unblock_ip():
    """Unblock an IP address"""
    try:
        data = request.get_json()
        ip_address = data.get("ip_address")

        if not ip_address:
            return jsonify({"error": "IP address is required"}), 400

        if ip_address in security_monitor.blocked_ips:
            security_monitor.blocked_ips.remove(ip_address)
            message = f"IP {ip_address} has been unblocked"
            logger.info(message)
        else:
            message = f"IP {ip_address} was not in blocked list"

        return (
            jsonify(
                {
                    "status": "success",
                    "message": message,
                    "ip_address": ip_address,
                    "unblocked_at": datetime.now().isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error unblocking IP: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@security_bp.route("/security-policies", methods=["GET"])
def get_security_policies():
    """Get current security policies"""
    try:
        return (
            jsonify(
                {
                    "security_policies": security_monitor.security_policies,
                    "retrieved_at": datetime.now().isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error retrieving security policies: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
