import logging
from datetime import datetime, timedelta
from typing import Dict, List

from flask import Blueprint, jsonify, request

reporting_bp = Blueprint("reporting", __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ComplianceReporter:
    """Automated compliance reporting system for regulatory requirements"""

    def __init__(self):
        self.reports = []
        self.report_templates = self._initialize_report_templates()

    def _initialize_report_templates(self) -> Dict:
        """Initialize compliance report templates"""
        return {
            "SOX_QUARTERLY": {
                "name": "Sarbanes-Oxley Quarterly Report",
                "frequency": "quarterly",
                "sections": [
                    "internal_controls_assessment",
                    "financial_reporting_controls",
                    "management_certification",
                    "auditor_attestation",
                    "material_weaknesses",
                    "remediation_plans",
                ],
                "required_data": [
                    "financial_transactions",
                    "control_testing_results",
                    "management_assertions",
                    "audit_findings",
                ],
            },
            "PCI_DSS_ANNUAL": {
                "name": "PCI DSS Annual Report on Compliance",
                "frequency": "annual",
                "sections": [
                    "network_security_assessment",
                    "cardholder_data_protection",
                    "vulnerability_management",
                    "access_control_measures",
                    "network_monitoring",
                    "security_policies",
                ],
                "required_data": [
                    "network_scans",
                    "penetration_tests",
                    "access_logs",
                    "security_incidents",
                ],
            },
            "GDPR_PRIVACY_IMPACT": {
                "name": "GDPR Privacy Impact Assessment",
                "frequency": "as_needed",
                "sections": [
                    "data_processing_activities",
                    "legal_basis_assessment",
                    "privacy_risks_analysis",
                    "mitigation_measures",
                    "data_subject_rights",
                    "breach_notifications",
                ],
                "required_data": [
                    "data_processing_records",
                    "consent_records",
                    "data_breaches",
                    "subject_access_requests",
                ],
            },
            "BSA_SAR": {
                "name": "Bank Secrecy Act Suspicious Activity Report",
                "frequency": "as_needed",
                "sections": [
                    "suspicious_activity_description",
                    "customer_information",
                    "transaction_details",
                    "supporting_documentation",
                    "law_enforcement_notification",
                ],
                "required_data": [
                    "suspicious_transactions",
                    "customer_due_diligence",
                    "transaction_monitoring_alerts",
                ],
            },
            "FFIEC_CYBERSECURITY": {
                "name": "FFIEC Cybersecurity Assessment",
                "frequency": "annual",
                "sections": [
                    "cybersecurity_maturity",
                    "risk_assessment",
                    "threat_intelligence",
                    "incident_response",
                    "business_continuity",
                    "vendor_management",
                ],
                "required_data": [
                    "security_incidents",
                    "vulnerability_assessments",
                    "risk_assessments",
                    "business_continuity_tests",
                ],
            },
        }

    def generate_sox_report(self, quarter: str, year: int, data: Dict) -> Dict:
        """Generate SOX compliance report"""

        report_id = f"SOX_Q{quarter}_{year}_{datetime.now().strftime('%Y%m%d')}"

        # Analyze financial controls
        controls_assessment = self._assess_internal_controls(
            data.get("controls_data", {})
        )

        # Analyze financial reporting accuracy
        reporting_assessment = self._assess_financial_reporting(
            data.get("financial_data", {})
        )

        # Identify material weaknesses
        material_weaknesses = self._identify_material_weaknesses(
            controls_assessment, reporting_assessment
        )

        # Generate management certification
        management_cert = self._generate_management_certification(
            controls_assessment, material_weaknesses
        )

        sox_report = {
            "report_id": report_id,
            "report_type": "SOX_QUARTERLY",
            "period": f"Q{quarter} {year}",
            "generated_date": datetime.now().isoformat(),
            "executive_summary": {
                "overall_assessment": (
                    "EFFECTIVE" if len(material_weaknesses) == 0 else "DEFICIENT"
                ),
                "material_weaknesses_count": len(material_weaknesses),
                "controls_tested": controls_assessment.get("total_controls", 0),
                "controls_effective": controls_assessment.get("effective_controls", 0),
            },
            "internal_controls_assessment": controls_assessment,
            "financial_reporting_controls": reporting_assessment,
            "material_weaknesses": material_weaknesses,
            "management_certification": management_cert,
            "remediation_plans": self._generate_remediation_plans(material_weaknesses),
            "compliance_status": (
                "COMPLIANT" if len(material_weaknesses) == 0 else "NON_COMPLIANT"
            ),
        }

        self.reports.append(sox_report)
        return sox_report

    def _assess_internal_controls(self, controls_data: Dict) -> Dict:
        """Assess effectiveness of internal controls"""

        controls = controls_data.get("controls", [])
        total_controls = len(controls)
        effective_controls = 0
        deficient_controls = []

        for control in controls:
            control_id = control.get("control_id")
            test_results = control.get("test_results", [])

            # Determine control effectiveness
            passed_tests = len([t for t in test_results if t.get("result") == "PASS"])
            total_tests = len(test_results)

            if (
                total_tests > 0 and (passed_tests / total_tests) >= 0.95
            ):  # 95% pass rate
                effective_controls += 1
            else:
                deficient_controls.append(
                    {
                        "control_id": control_id,
                        "description": control.get("description"),
                        "pass_rate": (
                            (passed_tests / total_tests) if total_tests > 0 else 0
                        ),
                        "deficiency_type": (
                            "DESIGN" if total_tests == 0 else "OPERATING"
                        ),
                    }
                )

        return {
            "total_controls": total_controls,
            "effective_controls": effective_controls,
            "deficient_controls": deficient_controls,
            "effectiveness_rate": (
                (effective_controls / total_controls) if total_controls > 0 else 0
            ),
            "assessment_date": datetime.now().isoformat(),
        }

    def _assess_financial_reporting(self, financial_data: Dict) -> Dict:
        """Assess financial reporting controls"""

        transactions = financial_data.get("transactions", [])
        reconciliations = financial_data.get("reconciliations", [])
        financial_data.get("journal_entries", [])

        # Analyze transaction controls
        transaction_issues = []
        for transaction in transactions:
            if not transaction.get("approved_by"):
                transaction_issues.append(
                    {
                        "transaction_id": transaction.get("id"),
                        "issue": "Missing approval",
                        "severity": "HIGH",
                    }
                )

            if (
                transaction.get("amount", 0) > 10000
                and len(transaction.get("approvers", [])) < 2
            ):
                transaction_issues.append(
                    {
                        "transaction_id": transaction.get("id"),
                        "issue": "Insufficient approvals for high-value transaction",
                        "severity": "HIGH",
                    }
                )

        # Analyze reconciliation controls
        reconciliation_issues = []
        for recon in reconciliations:
            if not recon.get("reviewed_by"):
                reconciliation_issues.append(
                    {
                        "reconciliation_id": recon.get("id"),
                        "issue": "Missing review",
                        "severity": "MEDIUM",
                    }
                )

        return {
            "transaction_controls": {
                "total_transactions": len(transactions),
                "issues_identified": len(transaction_issues),
                "issues": transaction_issues,
            },
            "reconciliation_controls": {
                "total_reconciliations": len(reconciliations),
                "issues_identified": len(reconciliation_issues),
                "issues": reconciliation_issues,
            },
            "overall_assessment": (
                "EFFECTIVE"
                if len(transaction_issues) + len(reconciliation_issues) == 0
                else "DEFICIENT"
            ),
        }

    def _identify_material_weaknesses(
        self, controls_assessment: Dict, reporting_assessment: Dict
    ) -> List[Dict]:
        """Identify material weaknesses in internal controls"""

        weaknesses = []

        # Check control effectiveness threshold
        if (
            controls_assessment.get("effectiveness_rate", 0) < 0.90
        ):  # Less than 90% effective
            weaknesses.append(
                {
                    "weakness_id": "MW001",
                    "description": "Significant deficiencies in internal control design and operation",
                    "severity": "MATERIAL",
                    "impact": "Financial reporting reliability",
                    "root_cause": "Inadequate control design or operating effectiveness",
                }
            )

        # Check for high-severity transaction issues
        transaction_issues = reporting_assessment.get("transaction_controls", {}).get(
            "issues", []
        )
        high_severity_issues = [
            i for i in transaction_issues if i.get("severity") == "HIGH"
        ]

        if len(high_severity_issues) > 5:  # More than 5 high-severity issues
            weaknesses.append(
                {
                    "weakness_id": "MW002",
                    "description": "Inadequate controls over financial transaction processing",
                    "severity": "MATERIAL",
                    "impact": "Transaction accuracy and authorization",
                    "root_cause": "Insufficient approval controls and segregation of duties",
                }
            )

        return weaknesses

    def _generate_management_certification(
        self, controls_assessment: Dict, material_weaknesses: List[Dict]
    ) -> Dict:
        """Generate management certification statement"""

        is_effective = len(material_weaknesses) == 0

        return {
            "certification_statement": (
                "Management is responsible for establishing and maintaining adequate internal control over financial reporting. "
                f"Based on our assessment, we conclude that our internal control over financial reporting is "
                f"{'effective' if is_effective else 'not effective'} as of the assessment date."
            ),
            "management_conclusion": "EFFECTIVE" if is_effective else "NOT_EFFECTIVE",
            "certification_date": datetime.now().isoformat(),
            "certifying_officers": [
                {"name": "Chief Executive Officer", "title": "CEO"},
                {"name": "Chief Financial Officer", "title": "CFO"},
            ],
        }

    def _generate_remediation_plans(
        self, material_weaknesses: List[Dict]
    ) -> List[Dict]:
        """Generate remediation plans for material weaknesses"""

        remediation_plans = []

        for weakness in material_weaknesses:
            plan = {
                "weakness_id": weakness.get("weakness_id"),
                "remediation_actions": [],
                "responsible_party": "Management",
                "target_completion_date": (
                    datetime.now() + timedelta(days=90)
                ).isoformat(),
                "status": "PLANNED",
            }

            if "control design" in weakness.get("description", "").lower():
                plan["remediation_actions"].extend(
                    [
                        "Redesign control procedures",
                        "Implement additional control activities",
                        "Enhance control documentation",
                        "Provide additional training",
                    ]
                )

            if "transaction processing" in weakness.get("description", "").lower():
                plan["remediation_actions"].extend(
                    [
                        "Implement dual approval requirements",
                        "Enhance segregation of duties",
                        "Automate approval workflows",
                        "Implement transaction monitoring",
                    ]
                )

            remediation_plans.append(plan)

        return remediation_plans

    def generate_pci_report(self, assessment_data: Dict) -> Dict:
        """Generate PCI DSS compliance report"""

        report_id = f"PCI_DSS_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        # Assess each PCI DSS requirement
        requirements_assessment = self._assess_pci_requirements(assessment_data)

        # Calculate overall compliance score
        total_requirements = len(requirements_assessment)
        compliant_requirements = len(
            [r for r in requirements_assessment if r.get("status") == "COMPLIANT"]
        )
        compliance_score = (
            (compliant_requirements / total_requirements) * 100
            if total_requirements > 0
            else 0
        )

        pci_report = {
            "report_id": report_id,
            "report_type": "PCI_DSS_ANNUAL",
            "assessment_date": datetime.now().isoformat(),
            "merchant_level": assessment_data.get("merchant_level", 4),
            "compliance_score": round(compliance_score, 2),
            "overall_status": (
                "COMPLIANT" if compliance_score >= 100 else "NON_COMPLIANT"
            ),
            "requirements_assessment": requirements_assessment,
            "vulnerabilities": assessment_data.get("vulnerabilities", []),
            "remediation_timeline": self._generate_pci_remediation_timeline(
                requirements_assessment
            ),
            "next_assessment_date": (datetime.now() + timedelta(days=365)).isoformat(),
        }

        self.reports.append(pci_report)
        return pci_report

    def _assess_pci_requirements(self, assessment_data: Dict) -> List[Dict]:
        """Assess PCI DSS requirements compliance"""

        requirements = [
            {
                "requirement": "1",
                "description": "Install and maintain a firewall configuration",
                "status": (
                    "COMPLIANT"
                    if assessment_data.get("firewall_configured", False)
                    else "NON_COMPLIANT"
                ),
            },
            {
                "requirement": "2",
                "description": "Do not use vendor-supplied defaults for system passwords",
                "status": (
                    "COMPLIANT"
                    if assessment_data.get("default_passwords_changed", False)
                    else "NON_COMPLIANT"
                ),
            },
            {
                "requirement": "3",
                "description": "Protect stored cardholder data",
                "status": (
                    "COMPLIANT"
                    if assessment_data.get("data_encrypted", False)
                    else "NON_COMPLIANT"
                ),
            },
            {
                "requirement": "4",
                "description": "Encrypt transmission of cardholder data",
                "status": (
                    "COMPLIANT"
                    if assessment_data.get("transmission_encrypted", False)
                    else "NON_COMPLIANT"
                ),
            },
            {
                "requirement": "5",
                "description": "Protect all systems against malware",
                "status": (
                    "COMPLIANT"
                    if assessment_data.get("antivirus_installed", False)
                    else "NON_COMPLIANT"
                ),
            },
            {
                "requirement": "6",
                "description": "Develop and maintain secure systems and applications",
                "status": (
                    "COMPLIANT"
                    if assessment_data.get("secure_development", False)
                    else "NON_COMPLIANT"
                ),
            },
        ]

        return requirements

    def _generate_pci_remediation_timeline(
        self, requirements_assessment: List[Dict]
    ) -> List[Dict]:
        """Generate remediation timeline for PCI DSS non-compliance"""

        timeline = []
        non_compliant = [
            r for r in requirements_assessment if r.get("status") == "NON_COMPLIANT"
        ]

        for i, requirement in enumerate(non_compliant):
            timeline.append(
                {
                    "requirement": requirement.get("requirement"),
                    "description": requirement.get("description"),
                    "target_date": (
                        datetime.now() + timedelta(days=30 * (i + 1))
                    ).isoformat(),
                    "priority": (
                        "HIGH"
                        if requirement.get("requirement") in ["1", "3", "4"]
                        else "MEDIUM"
                    ),
                }
            )

        return timeline

    def generate_gdpr_report(self, privacy_data: Dict) -> Dict:
        """Generate GDPR privacy impact assessment report"""

        report_id = f"GDPR_PIA_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        # Assess data processing activities
        processing_assessment = self._assess_data_processing(
            privacy_data.get("processing_activities", [])
        )

        # Assess privacy risks
        privacy_risks = self._assess_privacy_risks(privacy_data)

        # Generate mitigation measures
        mitigation_measures = self._generate_privacy_mitigation_measures(privacy_risks)

        gdpr_report = {
            "report_id": report_id,
            "report_type": "GDPR_PRIVACY_IMPACT",
            "assessment_date": datetime.now().isoformat(),
            "data_controller": privacy_data.get("data_controller", "FinovaBank"),
            "processing_assessment": processing_assessment,
            "privacy_risks": privacy_risks,
            "mitigation_measures": mitigation_measures,
            "data_subject_rights": self._assess_data_subject_rights(privacy_data),
            "breach_notifications": privacy_data.get("breach_notifications", []),
            "overall_compliance": (
                "COMPLIANT"
                if len([r for r in privacy_risks if r.get("level") == "HIGH"]) == 0
                else "REVIEW_REQUIRED"
            ),
        }

        self.reports.append(gdpr_report)
        return gdpr_report

    def _assess_data_processing(self, processing_activities: List[Dict]) -> Dict:
        """Assess GDPR data processing activities"""

        total_activities = len(processing_activities)
        lawful_basis_documented = len(
            [a for a in processing_activities if a.get("lawful_basis")]
        )
        consent_obtained = len(
            [a for a in processing_activities if a.get("consent_obtained", False)]
        )

        return {
            "total_processing_activities": total_activities,
            "lawful_basis_documented": lawful_basis_documented,
            "consent_obtained": consent_obtained,
            "compliance_rate": (
                (lawful_basis_documented / total_activities) * 100
                if total_activities > 0
                else 0
            ),
        }

    def _assess_privacy_risks(self, privacy_data: Dict) -> List[Dict]:
        """Assess privacy risks under GDPR"""

        risks = []

        # Check for high-risk processing
        if privacy_data.get("processes_sensitive_data", False):
            risks.append(
                {
                    "risk_id": "GDPR_R001",
                    "description": "Processing of sensitive personal data",
                    "level": "HIGH",
                    "impact": "Significant privacy impact on data subjects",
                }
            )

        # Check for automated decision making
        if privacy_data.get("automated_decision_making", False):
            risks.append(
                {
                    "risk_id": "GDPR_R002",
                    "description": "Automated decision making including profiling",
                    "level": "MEDIUM",
                    "impact": "Potential for discriminatory outcomes",
                }
            )

        # Check for international transfers
        if privacy_data.get("international_transfers", False):
            risks.append(
                {
                    "risk_id": "GDPR_R003",
                    "description": "International data transfers",
                    "level": "MEDIUM",
                    "impact": "Reduced protection in third countries",
                }
            )

        return risks

    def _generate_privacy_mitigation_measures(
        self, privacy_risks: List[Dict]
    ) -> List[Dict]:
        """Generate mitigation measures for privacy risks"""

        measures = []

        for risk in privacy_risks:
            if "sensitive data" in risk.get("description", "").lower():
                measures.append(
                    {
                        "risk_id": risk.get("risk_id"),
                        "measure": "Implement additional safeguards for sensitive data processing",
                        "implementation_date": (
                            datetime.now() + timedelta(days=30)
                        ).isoformat(),
                    }
                )

            if "automated decision" in risk.get("description", "").lower():
                measures.append(
                    {
                        "risk_id": risk.get("risk_id"),
                        "measure": "Provide meaningful information about automated decision making",
                        "implementation_date": (
                            datetime.now() + timedelta(days=60)
                        ).isoformat(),
                    }
                )

        return measures

    def _assess_data_subject_rights(self, privacy_data: Dict) -> Dict:
        """Assess implementation of data subject rights"""

        return {
            "access_requests_processed": privacy_data.get("access_requests", 0),
            "rectification_requests_processed": privacy_data.get(
                "rectification_requests", 0
            ),
            "erasure_requests_processed": privacy_data.get("erasure_requests", 0),
            "portability_requests_processed": privacy_data.get(
                "portability_requests", 0
            ),
            "average_response_time_days": privacy_data.get("average_response_time", 30),
            "compliance_with_timelines": privacy_data.get("average_response_time", 30)
            <= 30,
        }


# Initialize compliance reporter
compliance_reporter = ComplianceReporter()


@reporting_bp.route("/generate-sox-report", methods=["POST"])
def generate_sox_report():
    """Generate SOX compliance report"""
    try:
        data = request.get_json()

        quarter = data.get("quarter", "1")
        year = data.get("year", datetime.now().year)

        report = compliance_reporter.generate_sox_report(quarter, year, data)

        logger.info(f"SOX report generated: {report['report_id']}")

        return jsonify(report), 200

    except Exception as e:
        logger.error(f"Error generating SOX report: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@reporting_bp.route("/generate-pci-report", methods=["POST"])
def generate_pci_report():
    """Generate PCI DSS compliance report"""
    try:
        data = request.get_json()

        report = compliance_reporter.generate_pci_report(data)

        logger.info(f"PCI DSS report generated: {report['report_id']}")

        return jsonify(report), 200

    except Exception as e:
        logger.error(f"Error generating PCI DSS report: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@reporting_bp.route("/generate-gdpr-report", methods=["POST"])
def generate_gdpr_report():
    """Generate GDPR privacy impact assessment report"""
    try:
        data = request.get_json()

        report = compliance_reporter.generate_gdpr_report(data)

        logger.info(f"GDPR report generated: {report['report_id']}")

        return jsonify(report), 200

    except Exception as e:
        logger.error(f"Error generating GDPR report: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@reporting_bp.route("/reports", methods=["GET"])
def get_reports():
    """Get list of generated compliance reports"""
    try:
        report_type = request.args.get("type")
        limit = int(request.args.get("limit", 50))

        reports = compliance_reporter.reports.copy()

        # Filter by type if specified
        if report_type:
            reports = [
                r for r in reports if r.get("report_type") == report_type.upper()
            ]

        # Sort by generation date (newest first)
        reports.sort(key=lambda x: x.get("generated_date", ""), reverse=True)

        # Limit results
        reports = reports[:limit]

        return (
            jsonify(
                {
                    "total_reports": len(reports),
                    "reports": reports,
                    "retrieved_at": datetime.now().isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error retrieving reports: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@reporting_bp.route("/report-templates", methods=["GET"])
def get_report_templates():
    """Get available compliance report templates"""
    try:
        return (
            jsonify(
                {
                    "report_templates": compliance_reporter.report_templates,
                    "total_templates": len(compliance_reporter.report_templates),
                    "retrieved_at": datetime.now().isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error retrieving report templates: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
