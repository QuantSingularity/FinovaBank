import hashlib
import json
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List

from flask import Blueprint, jsonify, request

audit_bp = Blueprint("audit", __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AuditTrailManager:
    """Comprehensive audit trail management for regulatory compliance"""

    def __init__(self):
        self.audit_events = []  # In production, this would be a database
        self.sensitive_fields = ["password", "ssn", "account_number", "routing_number"]

    def log_event(self, event_data: Dict) -> str:
        """Log an audit event with comprehensive details"""

        audit_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()

        # Sanitize sensitive data
        sanitized_data = self._sanitize_data(event_data.get("data", {}))

        audit_event = {
            "audit_id": audit_id,
            "timestamp": timestamp,
            "event_type": event_data.get("event_type"),
            "user_id": event_data.get("user_id"),
            "session_id": event_data.get("session_id"),
            "ip_address": event_data.get("ip_address"),
            "user_agent": event_data.get("user_agent"),
            "service": event_data.get("service"),
            "action": event_data.get("action"),
            "resource": event_data.get("resource"),
            "resource_id": event_data.get("resource_id"),
            "status": event_data.get("status", "SUCCESS"),
            "error_message": event_data.get("error_message"),
            "data": sanitized_data,
            "risk_level": event_data.get("risk_level", "LOW"),
            "compliance_tags": event_data.get("compliance_tags", []),
            "data_hash": self._calculate_hash(sanitized_data),
            "geolocation": event_data.get("geolocation"),
            "device_fingerprint": event_data.get("device_fingerprint"),
        }

        # Add regulatory compliance fields
        audit_event.update(
            {
                "sox_relevant": self._is_sox_relevant(audit_event),
                "pci_relevant": self._is_pci_relevant(audit_event),
                "gdpr_relevant": self._is_gdpr_relevant(audit_event),
                "retention_period_years": self._get_retention_period(audit_event),
            }
        )

        self.audit_events.append(audit_event)

        # Log critical events immediately
        if audit_event["risk_level"] in ["HIGH", "CRITICAL"]:
            logger.warning(
                f"High-risk audit event: {audit_event['action']} by {audit_event['user_id']}"
            )

        return audit_id

    def _sanitize_data(self, data: Dict) -> Dict:
        """Remove or mask sensitive information"""
        sanitized = {}

        for key, value in data.items():
            if key.lower() in self.sensitive_fields:
                if isinstance(value, str) and len(value) > 4:
                    sanitized[key] = "*" * (len(value) - 4) + value[-4:]
                else:
                    sanitized[key] = "***MASKED***"
            else:
                sanitized[key] = value

        return sanitized

    def _calculate_hash(self, data: Dict) -> str:
        """Calculate hash for data integrity verification"""
        data_string = json.dumps(data, sort_keys=True)
        return hashlib.sha256(data_string.encode()).hexdigest()

    def _is_sox_relevant(self, event: Dict) -> bool:
        """Determine if event is relevant for SOX compliance"""
        sox_actions = [
            "financial_transaction",
            "account_creation",
            "balance_update",
            "loan_approval",
        ]
        return event.get("action") in sox_actions or event.get("service") in [
            "account-management",
            "transaction-service",
        ]

    def _is_pci_relevant(self, event: Dict) -> bool:
        """Determine if event is relevant for PCI DSS compliance"""
        pci_actions = [
            "payment_processing",
            "card_data_access",
            "payment_method_update",
        ]
        return (
            event.get("action") in pci_actions
            or "payment" in event.get("resource", "").lower()
        )

    def _is_gdpr_relevant(self, event: Dict) -> bool:
        """Determine if event is relevant for GDPR compliance"""
        gdpr_actions = [
            "personal_data_access",
            "data_export",
            "data_deletion",
            "consent_update",
        ]
        return (
            event.get("action") in gdpr_actions
            or "personal" in event.get("resource", "").lower()
        )

    def _get_retention_period(self, event: Dict) -> int:
        """Determine retention period based on regulatory requirements"""
        if event.get("sox_relevant"):
            return 7  # SOX requires 7 years
        elif event.get("pci_relevant"):
            return 3  # PCI DSS requires 3 years
        elif event.get("gdpr_relevant"):
            return 6  # GDPR allows up to 6 years for legitimate interests
        else:
            return 5  # Default 5 years for financial records

    def search_events(self, filters: Dict) -> List[Dict]:
        """Search audit events with various filters"""

        filtered_events = self.audit_events.copy()

        # Apply filters
        if filters.get("start_date"):
            start_date = datetime.fromisoformat(filters["start_date"])
            filtered_events = [
                e
                for e in filtered_events
                if datetime.fromisoformat(e["timestamp"]) >= start_date
            ]

        if filters.get("end_date"):
            end_date = datetime.fromisoformat(filters["end_date"])
            filtered_events = [
                e
                for e in filtered_events
                if datetime.fromisoformat(e["timestamp"]) <= end_date
            ]

        if filters.get("user_id"):
            filtered_events = [
                e for e in filtered_events if e.get("user_id") == filters["user_id"]
            ]

        if filters.get("event_type"):
            filtered_events = [
                e
                for e in filtered_events
                if e.get("event_type") == filters["event_type"]
            ]

        if filters.get("service"):
            filtered_events = [
                e for e in filtered_events if e.get("service") == filters["service"]
            ]

        if filters.get("risk_level"):
            filtered_events = [
                e
                for e in filtered_events
                if e.get("risk_level") == filters["risk_level"]
            ]

        if filters.get("compliance_type"):
            compliance_field = f"{filters['compliance_type'].lower()}_relevant"
            filtered_events = [
                e for e in filtered_events if e.get(compliance_field, False)
            ]

        # Sort by timestamp (newest first)
        filtered_events.sort(key=lambda x: x["timestamp"], reverse=True)

        return filtered_events

    def generate_compliance_report(
        self, compliance_type: str, start_date: str, end_date: str
    ) -> Dict:
        """Generate compliance-specific audit reports"""

        filters = {
            "start_date": start_date,
            "end_date": end_date,
            "compliance_type": compliance_type,
        }

        events = self.search_events(filters)

        # Calculate statistics
        total_events = len(events)
        risk_distribution = {}
        action_distribution = {}
        user_activity = {}

        for event in events:
            # Risk level distribution
            risk_level = event.get("risk_level", "UNKNOWN")
            risk_distribution[risk_level] = risk_distribution.get(risk_level, 0) + 1

            # Action distribution
            action = event.get("action", "UNKNOWN")
            action_distribution[action] = action_distribution.get(action, 0) + 1

            # User activity
            user_id = event.get("user_id", "UNKNOWN")
            user_activity[user_id] = user_activity.get(user_id, 0) + 1

        # Identify anomalies
        anomalies = [e for e in events if e.get("risk_level") in ["HIGH", "CRITICAL"]]

        return {
            "compliance_type": compliance_type.upper(),
            "report_period": {"start_date": start_date, "end_date": end_date},
            "summary": {
                "total_events": total_events,
                "high_risk_events": len(
                    [e for e in events if e.get("risk_level") == "HIGH"]
                ),
                "critical_events": len(
                    [e for e in events if e.get("risk_level") == "CRITICAL"]
                ),
                "unique_users": len(
                    set(e.get("user_id") for e in events if e.get("user_id"))
                ),
            },
            "distributions": {
                "risk_levels": risk_distribution,
                "actions": action_distribution,
                "top_users": sorted(
                    user_activity.items(), key=lambda x: x[1], reverse=True
                )[:10],
            },
            "anomalies": anomalies[:20],  # Top 20 anomalies
            "compliance_status": (
                "COMPLIANT" if len(anomalies) == 0 else "REVIEW_REQUIRED"
            ),
        }

    def verify_data_integrity(self, audit_id: str) -> Dict:
        """Verify the integrity of audit data"""

        event = next((e for e in self.audit_events if e["audit_id"] == audit_id), None)

        if not event:
            return {"status": "NOT_FOUND", "message": "Audit event not found"}

        # Recalculate hash
        current_hash = self._calculate_hash(event.get("data", {}))
        stored_hash = event.get("data_hash")

        integrity_status = "VERIFIED" if current_hash == stored_hash else "COMPROMISED"

        return {
            "audit_id": audit_id,
            "integrity_status": integrity_status,
            "stored_hash": stored_hash,
            "calculated_hash": current_hash,
            "timestamp": event.get("timestamp"),
            "verification_time": datetime.now().isoformat(),
        }


# Initialize audit trail manager
audit_manager = AuditTrailManager()


@audit_bp.route("/log", methods=["POST"])
def log_audit_event():
    """Log a new audit event"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Add request metadata
        data.update(
            {
                "ip_address": request.remote_addr,
                "user_agent": request.headers.get("User-Agent"),
                "timestamp": datetime.now().isoformat(),
            }
        )

        audit_id = audit_manager.log_event(data)

        logger.info(f"Audit event logged: {audit_id}")

        return (
            jsonify(
                {
                    "status": "success",
                    "audit_id": audit_id,
                    "message": "Audit event logged successfully",
                }
            ),
            201,
        )

    except Exception as e:
        logger.error(f"Error logging audit event: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@audit_bp.route("/search", methods=["POST"])
def search_audit_events():
    """Search audit events with filters"""
    try:
        filters = request.get_json() or {}

        events = audit_manager.search_events(filters)

        # Limit results for performance
        limit = filters.get("limit", 100)
        events = events[:limit]

        return (
            jsonify(
                {
                    "total_found": len(events),
                    "events": events,
                    "search_timestamp": datetime.now().isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error searching audit events: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@audit_bp.route("/compliance-report", methods=["POST"])
def generate_compliance_report():
    """Generate compliance-specific audit report"""
    try:
        data = request.get_json()

        compliance_type = data.get("compliance_type", "SOX")
        start_date = data.get(
            "start_date", (datetime.now() - timedelta(days=30)).isoformat()
        )
        end_date = data.get("end_date", datetime.now().isoformat())

        report = audit_manager.generate_compliance_report(
            compliance_type, start_date, end_date
        )
        report["generated_at"] = datetime.now().isoformat()

        logger.info(f"Compliance report generated: {compliance_type}")

        return jsonify(report), 200

    except Exception as e:
        logger.error(f"Error generating compliance report: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@audit_bp.route("/verify-integrity/<audit_id>", methods=["GET"])
def verify_data_integrity(audit_id):
    """Verify the integrity of a specific audit event"""
    try:
        result = audit_manager.verify_data_integrity(audit_id)

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error verifying data integrity: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@audit_bp.route("/statistics", methods=["GET"])
def get_audit_statistics():
    """Get overall audit statistics"""
    try:
        total_events = len(audit_manager.audit_events)

        if total_events == 0:
            return jsonify({"total_events": 0, "message": "No audit events found"}), 200

        # Calculate statistics
        risk_levels = {}
        services = {}
        recent_events = 0

        cutoff_time = datetime.now() - timedelta(hours=24)

        for event in audit_manager.audit_events:
            # Risk level distribution
            risk_level = event.get("risk_level", "UNKNOWN")
            risk_levels[risk_level] = risk_levels.get(risk_level, 0) + 1

            # Service distribution
            service = event.get("service", "UNKNOWN")
            services[service] = services.get(service, 0) + 1

            # Recent events (last 24 hours)
            if datetime.fromisoformat(event["timestamp"]) > cutoff_time:
                recent_events += 1

        return (
            jsonify(
                {
                    "total_events": total_events,
                    "recent_events_24h": recent_events,
                    "risk_distribution": risk_levels,
                    "service_distribution": services,
                    "compliance_coverage": {
                        "sox_events": len(
                            [
                                e
                                for e in audit_manager.audit_events
                                if e.get("sox_relevant")
                            ]
                        ),
                        "pci_events": len(
                            [
                                e
                                for e in audit_manager.audit_events
                                if e.get("pci_relevant")
                            ]
                        ),
                        "gdpr_events": len(
                            [
                                e
                                for e in audit_manager.audit_events
                                if e.get("gdpr_relevant")
                            ]
                        ),
                    },
                    "statistics_timestamp": datetime.now().isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error getting audit statistics: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
