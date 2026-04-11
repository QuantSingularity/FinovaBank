import logging
import math
from datetime import datetime
from typing import Any, Dict

import numpy as np
from flask import Blueprint, jsonify, request

risk_bp = Blueprint("risk", __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RiskAssessmentEngine:
    """Advanced risk assessment engine for credit scoring and loan underwriting"""

    def __init__(self):
        self.credit_score_weights = {
            "payment_history": 0.35,
            "credit_utilization": 0.30,
            "length_of_credit_history": 0.15,
            "credit_mix": 0.10,
            "new_credit": 0.10,
        }

        self.loan_risk_weights = {
            "credit_score": 0.25,
            "debt_to_income": 0.20,
            "employment_stability": 0.15,
            "loan_to_value": 0.15,
            "income_verification": 0.10,
            "collateral_value": 0.10,
            "market_conditions": 0.05,
        }

    def calculate_credit_score(self, customer_data: Dict) -> Dict[str, Any]:
        """Calculate credit score based on customer financial data"""

        # Payment History Score (35%)
        payment_history = customer_data.get("payment_history", {})
        on_time_payments = payment_history.get("on_time_payments", 0)
        total_payments = payment_history.get("total_payments", 1)
        late_payments = payment_history.get("late_payments", 0)

        payment_score = max(
            0, min(100, (on_time_payments / total_payments) * 100 - late_payments * 5)
        )

        # Credit Utilization Score (30%)
        total_credit_limit = customer_data.get("total_credit_limit", 1)
        total_credit_used = customer_data.get("total_credit_used", 0)
        utilization_ratio = (
            total_credit_used / total_credit_limit if total_credit_limit > 0 else 0
        )

        if utilization_ratio <= 0.1:
            utilization_score = 100
        elif utilization_ratio <= 0.3:
            utilization_score = 90 - (utilization_ratio - 0.1) * 100
        else:
            utilization_score = max(0, 70 - (utilization_ratio - 0.3) * 100)

        # Length of Credit History Score (15%)
        credit_history_months = customer_data.get("credit_history_months", 0)
        history_score = min(100, (credit_history_months / 120) * 100)  # 10 years = 100%

        # Credit Mix Score (10%)
        credit_types = customer_data.get("credit_types", [])
        mix_score = min(100, len(credit_types) * 20)  # Max 5 types

        # New Credit Score (10%)
        recent_inquiries = customer_data.get("recent_inquiries", 0)
        new_credit_score = max(0, 100 - recent_inquiries * 10)

        # Calculate weighted score
        weighted_score = (
            payment_score * self.credit_score_weights["payment_history"]
            + utilization_score * self.credit_score_weights["credit_utilization"]
            + history_score * self.credit_score_weights["length_of_credit_history"]
            + mix_score * self.credit_score_weights["credit_mix"]
            + new_credit_score * self.credit_score_weights["new_credit"]
        )

        # Convert to standard credit score range (300-850)
        credit_score = int(300 + (weighted_score / 100) * 550)

        # Determine credit grade
        if credit_score >= 800:
            grade = "Excellent"
        elif credit_score >= 740:
            grade = "Very Good"
        elif credit_score >= 670:
            grade = "Good"
        elif credit_score >= 580:
            grade = "Fair"
        else:
            grade = "Poor"

        return {
            "credit_score": credit_score,
            "grade": grade,
            "components": {
                "payment_history": round(payment_score, 1),
                "credit_utilization": round(utilization_score, 1),
                "credit_history_length": round(history_score, 1),
                "credit_mix": round(mix_score, 1),
                "new_credit": round(new_credit_score, 1),
            },
            "utilization_ratio": round(utilization_ratio * 100, 2),
        }

    def assess_loan_risk(self, loan_application: Dict) -> Dict[str, Any]:
        """Assess risk for loan application"""

        # Credit Score Component
        credit_score = loan_application.get("credit_score", 650)
        if credit_score >= 750:
            credit_score_factor = 1.0
        elif credit_score >= 700:
            credit_score_factor = 0.8
        elif credit_score >= 650:
            credit_score_factor = 0.6
        elif credit_score >= 600:
            credit_score_factor = 0.4
        else:
            credit_score_factor = 0.2

        # Debt-to-Income Ratio
        monthly_income = loan_application.get("monthly_income", 1)
        monthly_debt = loan_application.get("monthly_debt", 0)
        loan_payment = loan_application.get("estimated_monthly_payment", 0)

        dti_ratio = (
            (monthly_debt + loan_payment) / monthly_income if monthly_income > 0 else 1
        )

        if dti_ratio <= 0.28:
            dti_factor = 1.0
        elif dti_ratio <= 0.36:
            dti_factor = 0.8
        elif dti_ratio <= 0.43:
            dti_factor = 0.6
        else:
            dti_factor = 0.3

        # Employment Stability
        employment_months = loan_application.get("employment_months", 0)
        if employment_months >= 24:
            employment_factor = 1.0
        elif employment_months >= 12:
            employment_factor = 0.8
        elif employment_months >= 6:
            employment_factor = 0.6
        else:
            employment_factor = 0.4

        # Loan-to-Value Ratio (for secured loans)
        loan_amount = loan_application.get("loan_amount", 0)
        collateral_value = loan_application.get("collateral_value", loan_amount)
        ltv_ratio = loan_amount / collateral_value if collateral_value > 0 else 1

        if ltv_ratio <= 0.8:
            ltv_factor = 1.0
        elif ltv_ratio <= 0.9:
            ltv_factor = 0.8
        elif ltv_ratio <= 0.95:
            ltv_factor = 0.6
        else:
            ltv_factor = 0.3

        # Income Verification
        income_verified = loan_application.get("income_verified", False)
        income_factor = 1.0 if income_verified else 0.7

        # Collateral Value
        has_collateral = loan_application.get("has_collateral", False)
        collateral_factor = 1.0 if has_collateral else 0.8

        # Market Conditions (simplified)
        market_factor = 0.9  # Assume slightly unfavorable conditions

        # Calculate weighted risk score
        risk_score = (
            credit_score_factor * self.loan_risk_weights["credit_score"]
            + dti_factor * self.loan_risk_weights["debt_to_income"]
            + employment_factor * self.loan_risk_weights["employment_stability"]
            + ltv_factor * self.loan_risk_weights["loan_to_value"]
            + income_factor * self.loan_risk_weights["income_verification"]
            + collateral_factor * self.loan_risk_weights["collateral_value"]
            + market_factor * self.loan_risk_weights["market_conditions"]
        )

        # Convert to risk percentage (lower is better)
        risk_percentage = (1 - risk_score) * 100

        # Determine risk level and recommendation
        if risk_percentage <= 15:
            risk_level = "LOW"
            recommendation = "APPROVE"
            interest_rate_adjustment = 0.0
        elif risk_percentage <= 30:
            risk_level = "MEDIUM"
            recommendation = "APPROVE_WITH_CONDITIONS"
            interest_rate_adjustment = 1.0
        elif risk_percentage <= 50:
            risk_level = "HIGH"
            recommendation = "MANUAL_REVIEW"
            interest_rate_adjustment = 2.5
        else:
            risk_level = "VERY_HIGH"
            recommendation = "DECLINE"
            interest_rate_adjustment = 5.0

        return {
            "risk_score": round(risk_score, 3),
            "risk_percentage": round(risk_percentage, 2),
            "risk_level": risk_level,
            "recommendation": recommendation,
            "interest_rate_adjustment": interest_rate_adjustment,
            "factors": {
                "credit_score": round(credit_score_factor, 3),
                "debt_to_income": round(dti_factor, 3),
                "employment_stability": round(employment_factor, 3),
                "loan_to_value": round(ltv_factor, 3),
                "income_verification": round(income_factor, 3),
                "collateral_value": round(collateral_factor, 3),
                "market_conditions": round(market_factor, 3),
            },
            "ratios": {
                "debt_to_income": round(dti_ratio * 100, 2),
                "loan_to_value": round(ltv_ratio * 100, 2),
            },
        }

    def calculate_probability_of_default(self, customer_data: Dict) -> Dict[str, Any]:
        """Calculate probability of default using logistic regression-like approach"""

        # Feature extraction
        credit_score = customer_data.get("credit_score", 650)
        dti_ratio = customer_data.get("debt_to_income_ratio", 0.3)
        employment_months = customer_data.get("employment_months", 12)
        loan_amount = customer_data.get("loan_amount", 10000)
        annual_income = customer_data.get("annual_income", 50000)

        # Normalize features
        credit_score_norm = (credit_score - 300) / 550  # 300-850 range
        dti_norm = min(dti_ratio, 1.0)  # Cap at 100%
        employment_norm = min(employment_months / 60, 1.0)  # Cap at 5 years
        loan_to_income = loan_amount / annual_income if annual_income > 0 else 1

        # Logistic regression coefficients (simplified)
        intercept = -2.5
        coefficients = {
            "credit_score": 3.0,
            "dti_ratio": -2.0,
            "employment": 1.5,
            "loan_to_income": -1.0,
        }

        # Calculate linear combination
        linear_combination = (
            intercept
            + coefficients["credit_score"] * credit_score_norm
            + coefficients["dti_ratio"] * (1 - dti_norm)
            + coefficients["employment"] * employment_norm
            + coefficients["loan_to_income"] * (1 - min(loan_to_income, 1.0))
        )

        # Apply sigmoid function
        probability = 1 / (1 + math.exp(-linear_combination))

        # Convert to default probability (invert since higher score = lower default risk)
        default_probability = 1 - probability

        # Determine risk category
        if default_probability <= 0.05:
            category = "Very Low Risk"
        elif default_probability <= 0.15:
            category = "Low Risk"
        elif default_probability <= 0.30:
            category = "Medium Risk"
        elif default_probability <= 0.50:
            category = "High Risk"
        else:
            category = "Very High Risk"

        return {
            "default_probability": round(default_probability, 4),
            "default_percentage": round(default_probability * 100, 2),
            "risk_category": category,
            "confidence_interval": {
                "lower": round(max(0, default_probability - 0.05), 4),
                "upper": round(min(1, default_probability + 0.05), 4),
            },
        }


# Initialize risk assessment engine
risk_engine = RiskAssessmentEngine()


@risk_bp.route("/credit-score", methods=["POST"])
def calculate_credit_score():
    """Calculate credit score for a customer"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        result = risk_engine.calculate_credit_score(data)
        result["customer_id"] = data.get("customer_id")
        result["calculation_timestamp"] = datetime.now().isoformat()

        logger.info(
            f"Credit score calculated for customer {data.get('customer_id')}: {result['credit_score']}"
        )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error calculating credit score: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@risk_bp.route("/loan-assessment", methods=["POST"])
def assess_loan_risk():
    """Assess risk for loan application"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        result = risk_engine.assess_loan_risk(data)
        result["application_id"] = data.get("application_id")
        result["assessment_timestamp"] = datetime.now().isoformat()

        logger.info(
            f"Loan risk assessed for application {data.get('application_id')}: {result['risk_level']}"
        )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error assessing loan risk: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@risk_bp.route("/default-probability", methods=["POST"])
def calculate_default_probability():
    """Calculate probability of default"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        result = risk_engine.calculate_probability_of_default(data)
        result["customer_id"] = data.get("customer_id")
        result["calculation_timestamp"] = datetime.now().isoformat()

        logger.info(
            f"Default probability calculated for customer {data.get('customer_id')}: {result['default_percentage']}%"
        )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error calculating default probability: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@risk_bp.route("/portfolio-risk", methods=["POST"])
def assess_portfolio_risk():
    """Assess risk for a portfolio of loans"""
    try:
        data = request.get_json()
        loans = data.get("loans", [])

        if not loans:
            return jsonify({"error": "No loans provided"}), 400

        portfolio_results = []
        total_exposure = 0
        weighted_risk = 0

        for loan in loans:
            risk_result = risk_engine.assess_loan_risk(loan)
            default_prob = risk_engine.calculate_probability_of_default(loan)

            loan_amount = loan.get("loan_amount", 0)
            total_exposure += loan_amount
            weighted_risk += risk_result["risk_percentage"] * loan_amount

            portfolio_results.append(
                {
                    "loan_id": loan.get("loan_id"),
                    "loan_amount": loan_amount,
                    "risk_level": risk_result["risk_level"],
                    "risk_percentage": risk_result["risk_percentage"],
                    "default_probability": default_prob["default_percentage"],
                }
            )

        portfolio_risk = weighted_risk / total_exposure if total_exposure > 0 else 0

        # Calculate portfolio metrics
        high_risk_count = len(
            [l for l in portfolio_results if l["risk_level"] in ["HIGH", "VERY_HIGH"]]
        )
        avg_default_prob = np.mean(
            [l["default_probability"] for l in portfolio_results]
        )

        response = {
            "portfolio_id": data.get("portfolio_id"),
            "total_loans": len(loans),
            "total_exposure": total_exposure,
            "portfolio_risk_percentage": round(portfolio_risk, 2),
            "average_default_probability": round(avg_default_prob, 2),
            "high_risk_loans": high_risk_count,
            "risk_distribution": {
                "low": len([l for l in portfolio_results if l["risk_level"] == "LOW"]),
                "medium": len(
                    [l for l in portfolio_results if l["risk_level"] == "MEDIUM"]
                ),
                "high": len(
                    [l for l in portfolio_results if l["risk_level"] == "HIGH"]
                ),
                "very_high": len(
                    [l for l in portfolio_results if l["risk_level"] == "VERY_HIGH"]
                ),
            },
            "loans": portfolio_results,
            "assessment_timestamp": datetime.now().isoformat(),
        }

        logger.info(
            f"Portfolio risk assessed: {len(loans)} loans, {portfolio_risk:.2f}% risk"
        )

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error assessing portfolio risk: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
