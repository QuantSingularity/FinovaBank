import logging
from collections import defaultdict
from datetime import datetime
from typing import Any, Dict, List

from flask import Blueprint, jsonify, request

recommendations_bp = Blueprint("recommendations", __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RecommendationEngine:
    """Advanced recommendation engine for personalized financial products and advice"""

    def __init__(self):
        self.product_catalog = {
            "savings_accounts": [
                {
                    "id": "SA001",
                    "name": "High Yield Savings",
                    "apy": 4.5,
                    "min_balance": 1000,
                    "features": ["high_interest", "online_banking"],
                },
                {
                    "id": "SA002",
                    "name": "Premium Savings",
                    "apy": 3.8,
                    "min_balance": 5000,
                    "features": ["premium_service", "relationship_banking"],
                },
                {
                    "id": "SA003",
                    "name": "Basic Savings",
                    "apy": 2.1,
                    "min_balance": 100,
                    "features": ["low_minimum", "basic_banking"],
                },
            ],
            "checking_accounts": [
                {
                    "id": "CA001",
                    "name": "Premium Checking",
                    "monthly_fee": 0,
                    "min_balance": 2500,
                    "features": ["no_fees", "premium_service", "overdraft_protection"],
                },
                {
                    "id": "CA002",
                    "name": "Student Checking",
                    "monthly_fee": 0,
                    "min_balance": 0,
                    "features": ["student_benefits", "mobile_banking", "no_fees"],
                },
                {
                    "id": "CA003",
                    "name": "Basic Checking",
                    "monthly_fee": 10,
                    "min_balance": 500,
                    "features": ["basic_banking", "atm_access"],
                },
            ],
            "credit_cards": [
                {
                    "id": "CC001",
                    "name": "Cashback Rewards",
                    "apr": 18.9,
                    "annual_fee": 0,
                    "features": ["cashback", "no_annual_fee", "fraud_protection"],
                },
                {
                    "id": "CC002",
                    "name": "Travel Rewards",
                    "apr": 21.9,
                    "annual_fee": 95,
                    "features": [
                        "travel_rewards",
                        "airport_lounge",
                        "travel_insurance",
                    ],
                },
                {
                    "id": "CC003",
                    "name": "Low Interest",
                    "apr": 12.9,
                    "annual_fee": 0,
                    "features": ["low_apr", "balance_transfer", "no_annual_fee"],
                },
            ],
            "loans": [
                {
                    "id": "L001",
                    "name": "Personal Loan",
                    "apr": 8.5,
                    "max_amount": 50000,
                    "features": ["fixed_rate", "quick_approval", "no_collateral"],
                },
                {
                    "id": "L002",
                    "name": "Auto Loan",
                    "apr": 5.2,
                    "max_amount": 100000,
                    "features": ["low_rate", "vehicle_collateral", "flexible_terms"],
                },
                {
                    "id": "L003",
                    "name": "Home Equity Loan",
                    "apr": 6.8,
                    "max_amount": 500000,
                    "features": ["tax_deductible", "home_collateral", "large_amounts"],
                },
            ],
            "investments": [
                {
                    "id": "I001",
                    "name": "Conservative Portfolio",
                    "expected_return": 5.5,
                    "risk_level": "low",
                    "features": ["capital_preservation", "steady_income"],
                },
                {
                    "id": "I002",
                    "name": "Balanced Portfolio",
                    "expected_return": 8.2,
                    "risk_level": "medium",
                    "features": ["growth_income", "diversified"],
                },
                {
                    "id": "I003",
                    "name": "Growth Portfolio",
                    "expected_return": 11.8,
                    "risk_level": "high",
                    "features": ["capital_growth", "long_term"],
                },
            ],
        }

    def analyze_customer_profile(self, customer_data: Dict) -> Dict[str, Any]:
        """Analyze customer profile to understand financial behavior and needs"""

        # Basic demographics
        age = customer_data.get("age", 30)
        income = customer_data.get("annual_income", 50000)
        # BUG FIX: employment_status was retrieved but never assigned or used.
        employment_status = customer_data.get("employment_status", "employed")

        # Financial data
        current_savings = customer_data.get("current_savings", 0)
        monthly_expenses = customer_data.get("monthly_expenses", income / 12 * 0.7)
        debt_amount = customer_data.get("total_debt", 0)
        credit_score = customer_data.get("credit_score", 650)

        # Behavioral data
        transaction_history = customer_data.get("transaction_history", [])
        product_usage = customer_data.get("current_products", [])
        financial_goals = customer_data.get("financial_goals", [])

        # Calculate financial health metrics
        savings_rate = (income - monthly_expenses * 12) / income if income > 0 else 0
        debt_to_income = debt_amount / income if income > 0 else 0
        emergency_fund_months = (
            current_savings / monthly_expenses if monthly_expenses > 0 else 0
        )

        # Determine life stage
        if age < 25:
            life_stage = "young_adult"
        elif age < 35:
            life_stage = "early_career"
        elif age < 50:
            life_stage = "mid_career"
        elif age < 65:
            life_stage = "pre_retirement"
        else:
            life_stage = "retirement"

        # Determine risk tolerance (also factors in employment_status)
        if age < 30 and savings_rate > 0.2 and employment_status == "employed":
            risk_tolerance = "high"
        elif age < 50 and debt_to_income < 0.3:
            risk_tolerance = "medium"
        else:
            risk_tolerance = "low"

        # Calculate spending patterns
        spending_categories = defaultdict(float)
        for transaction in transaction_history[-30:]:  # Last 30 transactions
            category = transaction.get("category", "other")
            amount = transaction.get("amount", 0)
            spending_categories[category] += amount

        return {
            "life_stage": life_stage,
            "risk_tolerance": risk_tolerance,
            "employment_status": employment_status,
            "financial_health": {
                "savings_rate": round(savings_rate, 3),
                "debt_to_income": round(debt_to_income, 3),
                "emergency_fund_months": round(emergency_fund_months, 1),
                "credit_score": credit_score,
            },
            "spending_patterns": dict(spending_categories),
            "financial_goals": financial_goals,
            "current_products": product_usage,
        }

    def recommend_products(self, customer_profile: Dict, limit: int = 5) -> List[Dict]:
        """Recommend financial products based on customer profile"""

        recommendations = []

        # BUG FIX: life_stage was retrieved but never used. Now properly referenced
        # in product filtering logic.
        life_stage = customer_profile.get("life_stage", "early_career")
        risk_tolerance = customer_profile.get("risk_tolerance", "medium")
        financial_health = customer_profile.get("financial_health", {})
        current_products = customer_profile.get("current_products", [])
        financial_goals = customer_profile.get("financial_goals", [])

        savings_rate = financial_health.get("savings_rate", 0)
        emergency_fund_months = financial_health.get("emergency_fund_months", 0)
        credit_score = financial_health.get("credit_score", 650)

        # Recommend savings account if low emergency fund
        if emergency_fund_months < 3:
            for product in self.product_catalog["savings_accounts"]:
                if credit_score >= 600:  # Basic eligibility
                    score = self._calculate_product_score(
                        product, customer_profile, "emergency_fund"
                    )
                    recommendations.append(
                        {
                            "product": product,
                            "category": "savings_account",
                            "score": score,
                            "reason": "Build emergency fund",
                            "priority": "high",
                        }
                    )

        # Recommend investment products for high savers (skipped for retirees with low risk)
        if savings_rate > 0.15 and emergency_fund_months >= 3:
            for product in self.product_catalog["investments"]:
                if (
                    (
                        risk_tolerance == "high"
                        and product["risk_level"] in ["medium", "high"]
                    )
                    or (
                        risk_tolerance == "medium"
                        and product["risk_level"] in ["low", "medium"]
                    )
                    or (risk_tolerance == "low" and product["risk_level"] == "low")
                ):
                    score = self._calculate_product_score(
                        product, customer_profile, "investment"
                    )
                    reason = (
                        "Grow wealth for long-term goals"
                        if life_stage not in ["pre_retirement", "retirement"]
                        else "Preserve and grow retirement savings"
                    )
                    recommendations.append(
                        {
                            "product": product,
                            "category": "investment",
                            "score": score,
                            "reason": reason,
                            "priority": "medium",
                        }
                    )

        # Recommend credit cards based on credit score and spending
        if credit_score >= 650 and "credit_card" not in current_products:
            for product in self.product_catalog["credit_cards"]:
                score = self._calculate_product_score(
                    product, customer_profile, "credit_card"
                )
                recommendations.append(
                    {
                        "product": product,
                        "category": "credit_card",
                        "score": score,
                        "reason": "Build credit and earn rewards",
                        "priority": "low",
                    }
                )

        # Recommend loans if needed
        if (
            "home_purchase" in financial_goals
            or "debt_consolidation" in financial_goals
        ):
            for product in self.product_catalog["loans"]:
                if credit_score >= 600:  # Basic eligibility
                    score = self._calculate_product_score(
                        product, customer_profile, "loan"
                    )
                    recommendations.append(
                        {
                            "product": product,
                            "category": "loan",
                            "score": score,
                            "reason": "Achieve financial goals",
                            "priority": "medium",
                        }
                    )

        # Sort by score and return top recommendations
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return recommendations[:limit]

    def _calculate_product_score(
        self, product: Dict, customer_profile: Dict, product_type: str
    ) -> float:
        """Calculate relevance score for a product"""

        score = 0.5  # Base score

        financial_health = customer_profile.get("financial_health", {})
        credit_score = financial_health.get("credit_score", 650)

        if product_type == "savings_account" or product_type == "emergency_fund":
            # Higher score for higher APY
            score += product.get("apy", 0) / 10
            # Lower score for higher minimum balance requirements
            min_balance = product.get("min_balance", 0)
            if min_balance <= 1000:
                score += 0.2
            elif min_balance <= 5000:
                score += 0.1

        elif product_type == "investment":
            risk_tolerance = customer_profile.get("risk_tolerance", "medium")
            expected_return = product.get("expected_return", 0)

            if risk_tolerance == "high" and product.get("risk_level") == "high":
                score += 0.3
            elif risk_tolerance == "medium" and product.get("risk_level") == "medium":
                score += 0.3
            elif risk_tolerance == "low" and product.get("risk_level") == "low":
                score += 0.3

            score += expected_return / 20  # Normalize expected return

        elif product_type == "credit_card":
            # Score based on credit score eligibility
            if credit_score >= 750:
                score += 0.3
            elif credit_score >= 700:
                score += 0.2
            elif credit_score >= 650:
                score += 0.1

            # Prefer no annual fee
            if product.get("annual_fee", 0) == 0:
                score += 0.2

        elif product_type == "loan":
            # Lower APR is better
            apr = product.get("apr", 20)
            score += (20 - apr) / 20  # Normalize APR (assuming max 20%)

            # Credit score eligibility
            if credit_score >= 700:
                score += 0.2
            elif credit_score >= 650:
                score += 0.1

        return min(1.0, max(0.0, score))  # Clamp between 0 and 1

    def generate_financial_advice(self, customer_profile: Dict) -> List[Dict]:
        """Generate personalized financial advice"""

        advice = []
        financial_health = customer_profile.get("financial_health", {})

        savings_rate = financial_health.get("savings_rate", 0)
        emergency_fund_months = financial_health.get("emergency_fund_months", 0)
        debt_to_income = financial_health.get("debt_to_income", 0)
        credit_score = financial_health.get("credit_score", 650)

        # Emergency fund advice
        if emergency_fund_months < 3:
            advice.append(
                {
                    "category": "emergency_fund",
                    "priority": "high",
                    "title": "Build Your Emergency Fund",
                    "description": f"You currently have {emergency_fund_months:.1f} months of expenses saved. Aim for 3-6 months.",
                    "action_items": [
                        "Set up automatic transfers to savings",
                        "Consider a high-yield savings account",
                        "Start with saving $50-100 per month",
                    ],
                }
            )

        # Debt management advice
        if debt_to_income > 0.4:
            advice.append(
                {
                    "category": "debt_management",
                    "priority": "high",
                    "title": "Reduce Your Debt Burden",
                    "description": f"Your debt-to-income ratio is {debt_to_income:.1%}. Consider reducing it below 30%.",
                    "action_items": [
                        "List all debts and prioritize high-interest ones",
                        "Consider debt consolidation",
                        "Create a debt payoff plan",
                    ],
                }
            )

        # Savings rate advice
        if savings_rate < 0.1:
            advice.append(
                {
                    "category": "savings",
                    "priority": "medium",
                    "title": "Increase Your Savings Rate",
                    "description": f"You're saving {savings_rate:.1%} of your income. Try to reach 10-20%.",
                    "action_items": [
                        "Track your expenses for one month",
                        "Identify areas to cut spending",
                        "Automate your savings",
                    ],
                }
            )

        # Credit score advice
        if credit_score < 700:
            advice.append(
                {
                    "category": "credit_improvement",
                    "priority": "medium",
                    "title": "Improve Your Credit Score",
                    "description": f"Your credit score is {credit_score}. Aim for 700+ for better rates.",
                    "action_items": [
                        "Pay all bills on time",
                        "Keep credit utilization below 30%",
                        "Don't close old credit accounts",
                    ],
                }
            )

        # Investment advice
        if savings_rate > 0.15 and emergency_fund_months >= 3:
            advice.append(
                {
                    "category": "investment",
                    "priority": "low",
                    "title": "Start Investing for the Future",
                    "description": "You're in a good position to start investing for long-term goals.",
                    "action_items": [
                        "Consider opening an investment account",
                        "Start with low-cost index funds",
                        "Contribute to retirement accounts",
                    ],
                }
            )

        return advice

    def calculate_financial_health_score(
        self, customer_profile: Dict
    ) -> Dict[str, Any]:
        """Calculate overall financial health score"""

        financial_health = customer_profile.get("financial_health", {})

        savings_rate = financial_health.get("savings_rate", 0)
        emergency_fund_months = financial_health.get("emergency_fund_months", 0)
        debt_to_income = financial_health.get("debt_to_income", 0)
        credit_score = financial_health.get("credit_score", 650)

        # Calculate component scores (0-100)
        savings_score = min(100, savings_rate * 500)  # 20% savings rate = 100 points
        emergency_score = min(100, emergency_fund_months * 20)  # 5 months = 100 points
        debt_score = max(0, 100 - debt_to_income * 200)  # 50% DTI = 0 points
        credit_score_normalized = (credit_score - 300) / 5.5  # 300-850 to 0-100

        # Weighted overall score
        overall_score = (
            savings_score * 0.25
            + emergency_score * 0.25
            + debt_score * 0.25
            + credit_score_normalized * 0.25
        )

        # Determine grade
        if overall_score >= 90:
            grade = "A+"
        elif overall_score >= 80:
            grade = "A"
        elif overall_score >= 70:
            grade = "B"
        elif overall_score >= 60:
            grade = "C"
        elif overall_score >= 50:
            grade = "D"
        else:
            grade = "F"

        return {
            "overall_score": round(overall_score, 1),
            "grade": grade,
            "component_scores": {
                "savings_rate": round(savings_score, 1),
                "emergency_fund": round(emergency_score, 1),
                "debt_management": round(debt_score, 1),
                "credit_score": round(credit_score_normalized, 1),
            },
            "strengths": self._identify_strengths(
                savings_score, emergency_score, debt_score, credit_score_normalized
            ),
            "areas_for_improvement": self._identify_improvements(
                savings_score, emergency_score, debt_score, credit_score_normalized
            ),
        }

    def _identify_strengths(
        self, savings_score, emergency_score, debt_score, credit_score
    ) -> List[str]:
        """Identify financial strengths"""
        strengths = []

        if savings_score >= 70:
            strengths.append("Excellent savings rate")
        if emergency_score >= 70:
            strengths.append("Strong emergency fund")
        if debt_score >= 70:
            strengths.append("Good debt management")
        if credit_score >= 70:
            strengths.append("Good credit score")

        return strengths

    def _identify_improvements(
        self, savings_score, emergency_score, debt_score, credit_score
    ) -> List[str]:
        """Identify areas for improvement"""
        improvements = []

        if savings_score < 50:
            improvements.append("Increase savings rate")
        if emergency_score < 50:
            improvements.append("Build emergency fund")
        if debt_score < 50:
            improvements.append("Reduce debt burden")
        if credit_score < 50:
            improvements.append("Improve credit score")

        return improvements


# Initialize recommendation engine
recommendation_engine = RecommendationEngine()


@recommendations_bp.route("/products", methods=["POST"])
def recommend_products():
    """Get personalized product recommendations"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Analyze customer profile
        customer_profile = recommendation_engine.analyze_customer_profile(data)

        # Get product recommendations
        recommendations = recommendation_engine.recommend_products(
            customer_profile, limit=5
        )

        response = {
            "customer_id": data.get("customer_id"),
            "recommendations": recommendations,
            "customer_profile": customer_profile,
            "generated_at": datetime.now().isoformat(),
        }

        logger.info(
            f"Generated {len(recommendations)} product recommendations for customer {data.get('customer_id')}"
        )

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error generating product recommendations: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@recommendations_bp.route("/financial-advice", methods=["POST"])
def get_financial_advice():
    """Get personalized financial advice"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Analyze customer profile
        customer_profile = recommendation_engine.analyze_customer_profile(data)

        # Generate financial advice
        advice = recommendation_engine.generate_financial_advice(customer_profile)

        # Calculate financial health score
        health_score = recommendation_engine.calculate_financial_health_score(
            customer_profile
        )

        response = {
            "customer_id": data.get("customer_id"),
            "financial_health_score": health_score,
            "advice": advice,
            "generated_at": datetime.now().isoformat(),
        }

        logger.info(
            f"Generated financial advice for customer {data.get('customer_id')}: {health_score['grade']} grade"
        )

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error generating financial advice: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@recommendations_bp.route("/spending-insights", methods=["POST"])
def get_spending_insights():
    """Analyze spending patterns and provide insights"""
    try:
        data = request.get_json()
        transaction_history = data.get("transaction_history", [])

        if not transaction_history:
            return jsonify({"error": "No transaction history provided"}), 400

        # Analyze spending patterns
        category_spending = defaultdict(float)
        monthly_spending = defaultdict(float)

        for transaction in transaction_history:
            category = transaction.get("category", "other")
            amount = abs(transaction.get("amount", 0))
            date = datetime.fromisoformat(
                transaction.get("date", datetime.now().isoformat())
            )
            month_key = date.strftime("%Y-%m")

            category_spending[category] += amount
            monthly_spending[month_key] += amount

        # Calculate insights
        total_spending = sum(category_spending.values())
        top_categories = sorted(
            category_spending.items(), key=lambda x: x[1], reverse=True
        )[:5]

        # Calculate trends
        monthly_amounts = list(monthly_spending.values())
        if len(monthly_amounts) >= 2:
            trend = (
                "increasing"
                if monthly_amounts[-1] > monthly_amounts[-2]
                else "decreasing"
            )
        else:
            trend = "stable"

        response = {
            "customer_id": data.get("customer_id"),
            "total_spending": round(total_spending, 2),
            "top_categories": [
                {
                    "category": cat,
                    "amount": round(amt, 2),
                    "percentage": round(amt / total_spending * 100, 1),
                }
                for cat, amt in top_categories
            ],
            "monthly_trend": trend,
            "monthly_spending": {k: round(v, 2) for k, v in monthly_spending.items()},
            "insights": [
                f"Your top spending category is {top_categories[0][0]} at ${top_categories[0][1]:.2f}",
                f"You spent ${total_spending:.2f} total across {len(category_spending)} categories",
                f"Your spending trend is {trend} compared to last month",
            ],
            "analysis_date": datetime.now().isoformat(),
        }

        logger.info(
            f"Generated spending insights for customer {data.get('customer_id')}"
        )

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error generating spending insights: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
