import logging
from datetime import datetime, timedelta
from typing import Dict

from flask import Blueprint, jsonify, request

compliance_bp = Blueprint("compliance", __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ComplianceMonitor:
    """Real-time compliance monitoring and alerting system"""

    def __init__(self):
        self.compliance_rules = self._initialize_rules()
        self.violations = []
        self.alerts = []

    def _initialize_rules(self) -> Dict:
        """Initialize compliance rules for various regulations"""
        return {
            "SOX": {
                "financial_transaction_approval": {
                    "description": "All financial transactions above $10,000 require dual approval",
                    "threshold": 10000,
                    "required_approvers": 2,
                    "severity": "HIGH",
                },
                "segregation_of_duties": {
                    "description": "Same user cannot initiate and approve transactions",
                    "severity": "CRITICAL",
                },
                "financial_reporting_access": {
                    "description": "Access to financial reporting systems must be logged",
                    "severity": "MEDIUM",
                },
            },
            "PCI_DSS": {
                "card_data_encryption": {
                    "description": "All card data must be encrypted in transit and at rest",
                    "severity": "CRITICAL",
                },
                "access_control": {
                    "description": "Access to cardholder data must be restricted by business need",
                    "severity": "HIGH",
                },
                "vulnerability_management": {
                    "description": "Regular security scans and updates required",
                    "frequency_days": 30,
                    "severity": "MEDIUM",
                },
            },
            "GDPR": {
                "data_consent": {
                    "description": "Explicit consent required for personal data processing",
                    "severity": "HIGH",
                },
                "data_retention": {
                    "description": "Personal data must not be retained longer than necessary",
                    "max_retention_years": 7,
                    "severity": "MEDIUM",
                },
                "data_breach_notification": {
                    "description": "Data breaches must be reported within 72 hours",
                    "notification_hours": 72,
                    "severity": "CRITICAL",
                },
            },
            "BSA_AML": {
                "suspicious_activity_reporting": {
                    "description": "Suspicious transactions must be reported within 30 days",
                    "threshold": 5000,
                    "reporting_days": 30,
                    "severity": "CRITICAL",
                },
                "customer_due_diligence": {
                    "description": "Enhanced due diligence required for high-risk customers",
                    "severity": "HIGH",
                },
                "currency_transaction_reporting": {
                    "description": "Cash transactions over $10,000 must be reported",
                    "threshold": 10000,
                    "severity": "HIGH",
                },
            },
        }

    def check_transaction_compliance(self, transaction_data: Dict) -> Dict:
        """Check transaction against compliance rules"""

        violations = []
        alerts = []

        amount = transaction_data.get("amount", 0)
        transaction_type = transaction_data.get("type", "")
        user_id = transaction_data.get("user_id", "")
        approver_id = transaction_data.get("approver_id", "")

        # SOX Compliance Checks
        if (
            amount
            > self.compliance_rules["SOX"]["financial_transaction_approval"][
                "threshold"
            ]
        ):
            approvers = transaction_data.get("approvers", [])
            required_approvers = self.compliance_rules["SOX"][
                "financial_transaction_approval"
            ]["required_approvers"]

            if len(approvers) < required_approvers:
                violations.append(
                    {
                        "rule": "SOX - Dual Approval Required",
                        "description": f"Transaction of ${amount} requires {required_approvers} approvers, only {len(approvers)} provided",
                        "severity": "HIGH",
                        "regulation": "SOX",
                    }
                )

        # Segregation of duties check
        if user_id and approver_id and user_id == approver_id:
            violations.append(
                {
                    "rule": "SOX - Segregation of Duties",
                    "description": "Same user cannot initiate and approve transaction",
                    "severity": "CRITICAL",
                    "regulation": "SOX",
                }
            )

        # BSA/AML Compliance Checks
        if (
            transaction_type.upper() == "CASH"
            and amount
            > self.compliance_rules["BSA_AML"]["currency_transaction_reporting"][
                "threshold"
            ]
        ):
            alerts.append(
                {
                    "rule": "BSA/AML - Currency Transaction Reporting",
                    "description": f"Cash transaction of ${amount} requires CTR filing",
                    "severity": "HIGH",
                    "regulation": "BSA_AML",
                    "action_required": "FILE_CTR",
                }
            )

        # Suspicious activity detection
        if self._is_suspicious_transaction(transaction_data):
            alerts.append(
                {
                    "rule": "BSA/AML - Suspicious Activity",
                    "description": "Transaction flagged for suspicious activity review",
                    "severity": "CRITICAL",
                    "regulation": "BSA_AML",
                    "action_required": "REVIEW_SAR",
                }
            )

        return {
            "transaction_id": transaction_data.get("transaction_id"),
            "compliance_status": "VIOLATION" if violations else "COMPLIANT",
            "violations": violations,
            "alerts": alerts,
            "checked_at": datetime.now().isoformat(),
        }

    def _is_suspicious_transaction(self, transaction_data: Dict) -> bool:
        """Detect potentially suspicious transactions"""

        amount = transaction_data.get("amount", 0)
        frequency = transaction_data.get("daily_transaction_count", 1)
        location = transaction_data.get("location", {})

        # High amount transactions
        if amount > 50000:
            return True

        # High frequency transactions
        if frequency > 20:
            return True

        # Unusual location patterns
        if location.get("country") != transaction_data.get("customer_home_country"):
            return True

        # Round number transactions (potential structuring)
        if amount % 1000 == 0 and amount < 10000:
            return True

        return False

    def check_data_privacy_compliance(self, data_access_request: Dict) -> Dict:
        """Check data access against GDPR and privacy regulations"""

        violations = []
        alerts = []

        data_type = data_access_request.get("data_type", "")
        purpose = data_access_request.get("purpose", "")
        consent_status = data_access_request.get("consent_status", False)
        retention_period = data_access_request.get("retention_period_days", 0)

        # GDPR Consent Check
        if "personal" in data_type.lower() and not consent_status:
            violations.append(
                {
                    "rule": "GDPR - Data Consent",
                    "description": "Personal data access requires explicit consent",
                    "severity": "HIGH",
                    "regulation": "GDPR",
                }
            )

        # Data Retention Check
        max_retention_days = (
            self.compliance_rules["GDPR"]["data_retention"]["max_retention_years"] * 365
        )
        if retention_period > max_retention_days:
            violations.append(
                {
                    "rule": "GDPR - Data Retention",
                    "description": f"Retention period of {retention_period} days exceeds maximum of {max_retention_days} days",
                    "severity": "MEDIUM",
                    "regulation": "GDPR",
                }
            )

        # Purpose limitation check
        if not purpose or len(purpose.strip()) < 10:
            alerts.append(
                {
                    "rule": "GDPR - Purpose Limitation",
                    "description": "Data processing purpose must be clearly specified",
                    "severity": "MEDIUM",
                    "regulation": "GDPR",
                }
            )

        return {
            "request_id": data_access_request.get("request_id"),
            "compliance_status": "VIOLATION" if violations else "COMPLIANT",
            "violations": violations,
            "alerts": alerts,
            "checked_at": datetime.now().isoformat(),
        }

    def monitor_system_access(self, access_data: Dict) -> Dict:
        """Monitor system access for compliance violations"""

        violations = []
        alerts = []

        user_role = access_data.get("user_role", "")
        accessed_system = access_data.get("system", "")
        access_time = access_data.get("access_time", datetime.now().isoformat())

        # PCI DSS Access Control
        if "payment" in accessed_system.lower() or "card" in accessed_system.lower():
            if user_role not in ["ADMIN", "PAYMENT_PROCESSOR", "COMPLIANCE_OFFICER"]:
                violations.append(
                    {
                        "rule": "PCI DSS - Access Control",
                        "description": f"User role '{user_role}' not authorized for payment system access",
                        "severity": "HIGH",
                        "regulation": "PCI_DSS",
                    }
                )

        # SOX Financial System Access
        if (
            "financial" in accessed_system.lower()
            or "accounting" in accessed_system.lower()
        ):
            if user_role not in ["ADMIN", "MANAGER", "EMPLOYEE", "AUDITOR"]:
                violations.append(
                    {
                        "rule": "SOX - Financial System Access",
                        "description": f"User role '{user_role}' not authorized for financial system access",
                        "severity": "HIGH",
                        "regulation": "SOX",
                    }
                )

        # After-hours access monitoring
        access_dt = datetime.fromisoformat(access_time).replace(tzinfo=None)
        if access_dt.hour < 6 or access_dt.hour > 22:
            alerts.append(
                {
                    "rule": "Security - After Hours Access",
                    "description": "System access outside normal business hours",
                    "severity": "MEDIUM",
                    "regulation": "INTERNAL",
                }
            )

        return {
            "access_id": access_data.get("access_id"),
            "compliance_status": "VIOLATION" if violations else "COMPLIANT",
            "violations": violations,
            "alerts": alerts,
            "checked_at": datetime.now().isoformat(),
        }

    def generate_compliance_dashboard(self) -> Dict:
        """Generate real-time compliance dashboard"""

        # Calculate compliance metrics
        total_violations = len(self.violations)
        critical_violations = len(
            [v for v in self.violations if v.get("severity") == "CRITICAL"]
        )
        high_violations = len(
            [v for v in self.violations if v.get("severity") == "HIGH"]
        )

        # Violations by regulation
        regulation_breakdown = {}
        for violation in self.violations:
            reg = violation.get("regulation", "UNKNOWN")
            regulation_breakdown[reg] = regulation_breakdown.get(reg, 0) + 1

        # Recent violations (last 24 hours)
        cutoff_time = datetime.now() - timedelta(hours=24)
        recent_violations = [
            v
            for v in self.violations
            if datetime.fromisoformat(
                v.get("timestamp", datetime.now().isoformat())
            ).replace(tzinfo=None)
            > cutoff_time
        ]

        # Compliance score calculation
        if total_violations == 0:
            compliance_score = 100
        else:
            # Weighted scoring based on severity
            penalty_points = (
                (critical_violations * 10)
                + (high_violations * 5)
                + ((total_violations - critical_violations - high_violations) * 2)
            )
            compliance_score = max(0, 100 - penalty_points)

        return {
            "compliance_score": compliance_score,
            "total_violations": total_violations,
            "severity_breakdown": {
                "critical": critical_violations,
                "high": high_violations,
                "medium": total_violations - critical_violations - high_violations,
            },
            "regulation_breakdown": regulation_breakdown,
            "recent_violations_24h": len(recent_violations),
            "status": (
                "COMPLIANT"
                if compliance_score >= 90
                else "NON_COMPLIANT" if compliance_score < 70 else "NEEDS_ATTENTION"
            ),
            "last_updated": datetime.now().isoformat(),
        }


# Initialize compliance monitor
compliance_monitor = ComplianceMonitor()


@compliance_bp.route("/check-transaction", methods=["POST"])
def check_transaction_compliance():
    """Check transaction compliance against regulations"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No transaction data provided"}), 400

        result = compliance_monitor.check_transaction_compliance(data)

        # Store violations for tracking
        if result["violations"]:
            for violation in result["violations"]:
                violation["timestamp"] = datetime.now().isoformat()
                violation["transaction_id"] = data.get("transaction_id")
                compliance_monitor.violations.append(violation)

        logger.info(
            f"Transaction compliance check completed: {result['compliance_status']}"
        )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error checking transaction compliance: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@compliance_bp.route("/check-data-access", methods=["POST"])
def check_data_privacy_compliance():
    """Check data access compliance against privacy regulations"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data access request provided"}), 400

        result = compliance_monitor.check_data_privacy_compliance(data)

        # Store violations for tracking
        if result["violations"]:
            for violation in result["violations"]:
                violation["timestamp"] = datetime.now().isoformat()
                violation["request_id"] = data.get("request_id")
                compliance_monitor.violations.append(violation)

        logger.info(
            f"Data privacy compliance check completed: {result['compliance_status']}"
        )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error checking data privacy compliance: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@compliance_bp.route("/check-system-access", methods=["POST"])
def monitor_system_access():
    """Monitor system access for compliance violations"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No access data provided"}), 400

        result = compliance_monitor.monitor_system_access(data)

        # Store violations for tracking
        if result["violations"]:
            for violation in result["violations"]:
                violation["timestamp"] = datetime.now().isoformat()
                violation["access_id"] = data.get("access_id")
                compliance_monitor.violations.append(violation)

        logger.info(
            f"System access compliance check completed: {result['compliance_status']}"
        )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error monitoring system access: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@compliance_bp.route("/dashboard", methods=["GET"])
def get_compliance_dashboard():
    """Get real-time compliance dashboard"""
    try:
        dashboard = compliance_monitor.generate_compliance_dashboard()

        return jsonify(dashboard), 200

    except Exception as e:
        logger.error(f"Error generating compliance dashboard: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@compliance_bp.route("/violations", methods=["GET"])
def get_violations():
    """Get list of compliance violations"""
    try:
        # Get query parameters
        severity = request.args.get("severity")
        regulation = request.args.get("regulation")
        limit = int(request.args.get("limit", 50))

        violations = compliance_monitor.violations.copy()

        # Apply filters
        if severity:
            violations = [
                v for v in violations if v.get("severity") == severity.upper()
            ]

        if regulation:
            violations = [
                v for v in violations if v.get("regulation") == regulation.upper()
            ]

        # Sort by timestamp (newest first)
        violations.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

        # Limit results
        violations = violations[:limit]

        return (
            jsonify(
                {
                    "total_violations": len(violations),
                    "violations": violations,
                    "retrieved_at": datetime.now().isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error retrieving violations: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@compliance_bp.route("/rules", methods=["GET"])
def get_compliance_rules():
    """Get all compliance rules"""
    try:
        return (
            jsonify(
                {
                    "compliance_rules": compliance_monitor.compliance_rules,
                    "total_regulations": len(compliance_monitor.compliance_rules),
                    "retrieved_at": datetime.now().isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error retrieving compliance rules: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
