import logging
from datetime import datetime
from typing import Any, Dict, List

import numpy as np
import pandas as pd
from flask import Blueprint, jsonify, request

analytics_bp = Blueprint("analytics", __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AnalyticsEngine:
    """Advanced analytics engine for financial data analysis and insights"""

    def __init__(self):
        self.supported_metrics = [
            "transaction_volume",
            "customer_acquisition",
            "revenue_analysis",
            "risk_metrics",
            "product_performance",
            "customer_segmentation",
        ]

    def analyze_transaction_patterns(self, transactions: List[Dict]) -> Dict[str, Any]:
        """Analyze transaction patterns and trends"""

        if not transactions:
            return {"error": "No transactions provided"}

        # Convert to DataFrame for easier analysis
        df = pd.DataFrame(transactions)
        df["date"] = pd.to_datetime(df["date"])
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce")

        # Basic statistics
        total_volume = df["amount"].sum()
        transaction_count = len(df)
        avg_transaction = df["amount"].mean()
        median_transaction = df["amount"].median()

        # Time-based analysis
        df["hour"] = df["date"].dt.hour
        df["day_of_week"] = df["date"].dt.day_name()
        df["month"] = df["date"].dt.month

        # Peak hours analysis
        hourly_volume = df.groupby("hour")["amount"].sum().to_dict()
        peak_hour = max(hourly_volume, key=hourly_volume.get)

        # Day of week analysis
        daily_volume = df.groupby("day_of_week")["amount"].sum().to_dict()
        peak_day = max(daily_volume, key=daily_volume.get)

        # Transaction type analysis
        type_analysis = (
            df.groupby("transaction_type")
            .agg({"amount": ["sum", "count", "mean"]})
            .round(2)
            .to_dict()
        )

        # Monthly trends
        df["year_month"] = df["date"].dt.to_period("M")
        monthly_trends = (
            df.groupby("year_month").agg({"amount": ["sum", "count", "mean"]}).round(2)
        )

        # Calculate growth rates
        monthly_volumes = monthly_trends["amount"]["sum"].values
        if len(monthly_volumes) >= 2:
            growth_rate = (
                (monthly_volumes[-1] - monthly_volumes[-2]) / monthly_volumes[-2]
            ) * 100
        else:
            growth_rate = 0

        # Anomaly detection (simple statistical approach)
        amount_mean = df["amount"].mean()
        amount_std = df["amount"].std()
        threshold = amount_mean + 3 * amount_std
        anomalies = df[df["amount"] > threshold]

        return {
            "summary": {
                "total_volume": round(total_volume, 2),
                "transaction_count": transaction_count,
                "average_transaction": round(avg_transaction, 2),
                "median_transaction": round(median_transaction, 2),
                "growth_rate_percent": round(growth_rate, 2),
            },
            "patterns": {
                "peak_hour": peak_hour,
                "peak_day": peak_day,
                "hourly_distribution": hourly_volume,
                "daily_distribution": daily_volume,
            },
            "type_analysis": type_analysis,
            "anomalies": {
                "count": len(anomalies),
                "threshold": round(threshold, 2),
                "suspicious_transactions": anomalies[
                    ["date", "amount", "transaction_type"]
                ].to_dict("records"),
            },
            "trends": {
                "monthly_volume": monthly_trends["amount"]["sum"].to_dict(),
                "monthly_count": monthly_trends["amount"]["count"].to_dict(),
            },
        }

    def customer_segmentation_analysis(self, customers: List[Dict]) -> Dict[str, Any]:
        """Perform customer segmentation analysis"""

        if not customers:
            return {"error": "No customer data provided"}

        # RFM Analysis (Recency, Frequency, Monetary)
        current_date = datetime.now()

        # Calculate RFM metrics
        rfm_data = []
        for customer in customers:
            customer_id = customer.get("customer_id")
            transactions = customer.get("transactions", [])

            if transactions:
                # Recency: days since last transaction
                last_transaction = max(
                    [datetime.fromisoformat(t["date"]) for t in transactions]
                )
                recency = (current_date - last_transaction).days

                # Frequency: number of transactions
                frequency = len(transactions)

                # Monetary: total transaction value
                monetary = sum([abs(t.get("amount", 0)) for t in transactions])

                rfm_data.append(
                    {
                        "customer_id": customer_id,
                        "recency": recency,
                        "frequency": frequency,
                        "monetary": monetary,
                    }
                )

        if not rfm_data:
            return {"error": "No valid transaction data for segmentation"}

        rfm_df = pd.DataFrame(rfm_data)

        # Calculate quintiles for each metric
        rfm_df["R_Score"] = pd.qcut(
            rfm_df["recency"], 5, labels=[5, 4, 3, 2, 1]
        )  # Lower recency = higher score
        rfm_df["F_Score"] = pd.qcut(
            rfm_df["frequency"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]
        )
        rfm_df["M_Score"] = pd.qcut(rfm_df["monetary"], 5, labels=[1, 2, 3, 4, 5])

        # Create RFM segments
        rfm_df["RFM_Score"] = (
            rfm_df["R_Score"].astype(str)
            + rfm_df["F_Score"].astype(str)
            + rfm_df["M_Score"].astype(str)
        )

        # BUG FIX: "At Risk" and "Cannot Lose Them" had identical score sets,
        # making "Cannot Lose Them" unreachable. Fixed with distinct score sets.
        def categorize_customer(row):
            if row["RFM_Score"] in ["555", "554", "544", "545", "454", "455", "445"]:
                return "Champions"
            elif row["RFM_Score"] in [
                "543",
                "444",
                "435",
                "355",
                "354",
                "345",
                "344",
                "335",
            ]:
                return "Loyal Customers"
            elif row["RFM_Score"] in ["512", "511", "422", "421", "412", "411", "311"]:
                return "Potential Loyalists"
            elif row["RFM_Score"] in [
                "533",
                "532",
                "531",
                "523",
                "522",
                "521",
                "515",
                "514",
                "513",
                "425",
                "424",
                "413",
                "414",
                "415",
                "315",
                "314",
                "313",
            ]:
                return "New Customers"
            elif row["RFM_Score"] in ["155", "154", "144", "214", "215", "115", "114"]:
                return "At Risk"
            elif row["RFM_Score"] in [
                "255",
                "254",
                "245",
                "244",
                "253",
                "252",
                "243",
                "242",
            ]:
                # BUG FIX: Previously identical to "At Risk" — now uses correct high-value
                # churning customer scores (high M/F, low R)
                return "Cannot Lose Them"
            else:
                return "Others"

        rfm_df["Segment"] = rfm_df.apply(categorize_customer, axis=1)

        # Calculate segment statistics
        segment_stats = (
            rfm_df.groupby("Segment")
            .agg(
                {
                    "customer_id": "count",
                    "recency": "mean",
                    "frequency": "mean",
                    "monetary": "mean",
                }
            )
            .round(2)
        )

        segment_distribution = rfm_df["Segment"].value_counts().to_dict()

        return {
            "total_customers": len(rfm_df),
            "segment_distribution": segment_distribution,
            "segment_statistics": segment_stats.to_dict(),
            "rfm_summary": {
                "avg_recency": round(rfm_df["recency"].mean(), 2),
                "avg_frequency": round(rfm_df["frequency"].mean(), 2),
                "avg_monetary": round(rfm_df["monetary"].mean(), 2),
            },
            "top_customers": rfm_df.nlargest(10, "monetary")[
                ["customer_id", "recency", "frequency", "monetary", "Segment"]
            ].to_dict("records"),
        }

    def risk_analytics(self, portfolio_data: List[Dict]) -> Dict[str, Any]:
        """Analyze portfolio risk metrics"""

        if not portfolio_data:
            return {"error": "No portfolio data provided"}

        df = pd.DataFrame(portfolio_data)

        # Basic risk metrics
        total_exposure = df["loan_amount"].sum()
        avg_credit_score = df["credit_score"].mean()
        avg_dti = df["debt_to_income_ratio"].mean()

        # Risk distribution
        risk_levels = df["risk_level"].value_counts().to_dict()

        # Calculate Value at Risk (VaR) - simplified
        default_probabilities = df["default_probability"].values
        loan_amounts = df["loan_amount"].values

        # Expected loss
        expected_losses = default_probabilities * loan_amounts
        total_expected_loss = expected_losses.sum()

        # VaR at 95% confidence level
        var_95 = np.percentile(expected_losses, 95)

        # Concentration risk by industry/sector
        if "industry" in df.columns:
            industry_concentration = (
                df.groupby("industry")["loan_amount"].sum().to_dict()
            )
            max_concentration = (
                max(industry_concentration.values()) / total_exposure * 100
            )
        else:
            industry_concentration = {}
            max_concentration = 0

        # Credit score distribution
        credit_score_bins = pd.cut(
            df["credit_score"],
            bins=[0, 580, 670, 740, 800, 850],
            labels=["Poor", "Fair", "Good", "Very Good", "Excellent"],
        )
        credit_distribution = credit_score_bins.value_counts().to_dict()

        return {
            "portfolio_summary": {
                "total_exposure": round(total_exposure, 2),
                "loan_count": len(df),
                "average_loan_size": round(df["loan_amount"].mean(), 2),
                "average_credit_score": round(avg_credit_score, 1),
                "average_dti": round(avg_dti, 3),
            },
            "risk_metrics": {
                "total_expected_loss": round(total_expected_loss, 2),
                "expected_loss_rate": round(
                    total_expected_loss / total_exposure * 100, 2
                ),
                "var_95": round(var_95, 2),
                "risk_level_distribution": risk_levels,
            },
            "concentration_risk": {
                "industry_concentration": industry_concentration,
                "max_concentration_percent": round(max_concentration, 2),
            },
            "credit_quality": {
                "distribution": {str(k): v for k, v in credit_distribution.items()},
                "high_risk_loans": len(df[df["credit_score"] < 580]),
                "prime_loans": len(df[df["credit_score"] >= 740]),
            },
        }

    def product_performance_analysis(self, product_data: List[Dict]) -> Dict[str, Any]:
        """Analyze product performance metrics"""

        if not product_data:
            return {"error": "No product data provided"}

        df = pd.DataFrame(product_data)

        # BUG FIX: Previously computed but discarded; now properly assigned.
        revenue_by_product = df.groupby("product_type")["revenue"].sum().to_dict()
        customer_count_by_product = (
            df.groupby("product_type")["customer_id"].nunique().to_dict()
        )

        # Calculate metrics
        total_revenue = df["revenue"].sum()
        total_customers = df["customer_id"].nunique()

        # Product profitability
        profitability = {}
        for product in df["product_type"].unique():
            product_df = df[df["product_type"] == product]
            revenue = product_df["revenue"].sum()
            customers = product_df["customer_id"].nunique()
            avg_revenue_per_customer = revenue / customers if customers > 0 else 0

            profitability[product] = {
                "total_revenue": round(revenue, 2),
                "customer_count": customers,
                "revenue_per_customer": round(avg_revenue_per_customer, 2),
                "market_share": round(revenue / total_revenue * 100, 2),
            }

        # Growth analysis (if date column exists)
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"])
            df["month"] = df["date"].dt.to_period("M")

            monthly_revenue = df.groupby("month")["revenue"].sum()
            if len(monthly_revenue) >= 2:
                growth_rate = (
                    (monthly_revenue.iloc[-1] - monthly_revenue.iloc[-2])
                    / monthly_revenue.iloc[-2]
                ) * 100
            else:
                growth_rate = 0
        else:
            growth_rate = 0

        return {
            "overview": {
                "total_revenue": round(total_revenue, 2),
                "total_customers": total_customers,
                "average_revenue_per_customer": round(
                    total_revenue / total_customers, 2
                ),
                "growth_rate_percent": round(growth_rate, 2),
                "revenue_by_product": revenue_by_product,
                "customer_count_by_product": customer_count_by_product,
            },
            "product_performance": profitability,
            "top_products": sorted(
                profitability.items(), key=lambda x: x[1]["total_revenue"], reverse=True
            )[:5],
        }

    def predictive_analytics(
        self, historical_data: List[Dict], prediction_type: str
    ) -> Dict[str, Any]:
        """Perform predictive analytics using simple time series forecasting"""

        if not historical_data:
            return {"error": "No historical data provided"}

        df = pd.DataFrame(historical_data)
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values("date")

        if prediction_type == "revenue_forecast":
            # Simple linear trend forecasting
            df["days"] = (df["date"] - df["date"].min()).dt.days

            # Calculate trend
            x = df["days"].values
            y = df["revenue"].values

            # Simple linear regression
            n = len(x)
            sum_x = np.sum(x)
            sum_y = np.sum(y)
            sum_xy = np.sum(x * y)
            sum_x2 = np.sum(x * x)

            slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
            intercept = (sum_y - slope * sum_x) / n

            # Forecast next 3 months (90 days)
            last_day = x[-1]
            forecast_days = [last_day + 30, last_day + 60, last_day + 90]
            forecasts = [slope * day + intercept for day in forecast_days]

            return {
                "prediction_type": prediction_type,
                "trend": {
                    "slope": round(slope, 2),
                    "direction": "increasing" if slope > 0 else "decreasing",
                },
                "forecasts": [
                    {"period": "1 month", "predicted_revenue": round(forecasts[0], 2)},
                    {"period": "2 months", "predicted_revenue": round(forecasts[1], 2)},
                    {"period": "3 months", "predicted_revenue": round(forecasts[2], 2)},
                ],
                "confidence": "medium",  # Simplified confidence level
            }

        elif prediction_type == "customer_churn":
            # Simple churn prediction based on recency
            current_date = datetime.now()

            churn_predictions = []
            for _, row in df.iterrows():
                last_activity = row["date"]
                days_since_activity = (current_date - last_activity).days

                # Simple rule-based churn prediction
                if days_since_activity > 90:
                    churn_probability = 0.8
                elif days_since_activity > 60:
                    churn_probability = 0.6
                elif days_since_activity > 30:
                    churn_probability = 0.3
                else:
                    churn_probability = 0.1

                churn_predictions.append(
                    {
                        "customer_id": row.get("customer_id"),
                        "days_since_activity": days_since_activity,
                        "churn_probability": churn_probability,
                        "risk_level": (
                            "high"
                            if churn_probability > 0.7
                            else "medium" if churn_probability > 0.4 else "low"
                        ),
                    }
                )

            high_risk_customers = [
                p for p in churn_predictions if p["churn_probability"] > 0.7
            ]

            return {
                "prediction_type": prediction_type,
                "total_customers": len(churn_predictions),
                "high_risk_customers": len(high_risk_customers),
                "average_churn_probability": round(
                    np.mean([p["churn_probability"] for p in churn_predictions]), 3
                ),
                "predictions": churn_predictions[:10],  # Top 10 for brevity
                "recommendations": [
                    "Engage high-risk customers with personalized offers",
                    "Implement retention campaigns for medium-risk customers",
                    "Monitor customer activity patterns regularly",
                ],
            }

        else:
            return {"error": f"Unsupported prediction type: {prediction_type}"}


# Initialize analytics engine
analytics_engine = AnalyticsEngine()


@analytics_bp.route("/transaction-patterns", methods=["POST"])
def analyze_transaction_patterns():
    """Analyze transaction patterns and trends"""
    try:
        data = request.get_json()
        transactions = data.get("transactions", [])

        if not transactions:
            return jsonify({"error": "No transactions provided"}), 400

        result = analytics_engine.analyze_transaction_patterns(transactions)
        result["analysis_timestamp"] = datetime.now().isoformat()

        logger.info(
            f"Transaction pattern analysis completed for {len(transactions)} transactions"
        )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error in transaction pattern analysis: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@analytics_bp.route("/customer-segmentation", methods=["POST"])
def customer_segmentation():
    """Perform customer segmentation analysis"""
    try:
        data = request.get_json()
        customers = data.get("customers", [])

        if not customers:
            return jsonify({"error": "No customer data provided"}), 400

        result = analytics_engine.customer_segmentation_analysis(customers)
        result["analysis_timestamp"] = datetime.now().isoformat()

        logger.info(
            f"Customer segmentation analysis completed for {len(customers)} customers"
        )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error in customer segmentation: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@analytics_bp.route("/risk-analytics", methods=["POST"])
def risk_analytics():
    """Analyze portfolio risk metrics"""
    try:
        data = request.get_json()
        portfolio_data = data.get("portfolio", [])

        if not portfolio_data:
            return jsonify({"error": "No portfolio data provided"}), 400

        result = analytics_engine.risk_analytics(portfolio_data)
        result["analysis_timestamp"] = datetime.now().isoformat()

        logger.info(
            f"Risk analytics completed for portfolio of {len(portfolio_data)} loans"
        )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error in risk analytics: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@analytics_bp.route("/product-performance", methods=["POST"])
def product_performance():
    """Analyze product performance metrics"""
    try:
        data = request.get_json()
        product_data = data.get("products", [])

        if not product_data:
            return jsonify({"error": "No product data provided"}), 400

        result = analytics_engine.product_performance_analysis(product_data)
        result["analysis_timestamp"] = datetime.now().isoformat()

        logger.info(
            f"Product performance analysis completed for {len(product_data)} records"
        )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error in product performance analysis: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@analytics_bp.route("/predictive-analytics", methods=["POST"])
def predictive_analytics():
    """Perform predictive analytics"""
    try:
        data = request.get_json()
        historical_data = data.get("historical_data", [])
        prediction_type = data.get("prediction_type", "revenue_forecast")

        if not historical_data:
            return jsonify({"error": "No historical data provided"}), 400

        result = analytics_engine.predictive_analytics(historical_data, prediction_type)
        result["analysis_timestamp"] = datetime.now().isoformat()

        logger.info(f"Predictive analytics completed: {prediction_type}")

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error in predictive analytics: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@analytics_bp.route("/dashboard-metrics", methods=["POST"])
def dashboard_metrics():
    """Generate comprehensive dashboard metrics"""
    try:
        data = request.get_json()

        # Combine multiple analytics
        metrics = {}

        # Transaction metrics
        if "transactions" in data:
            metrics["transaction_analytics"] = (
                analytics_engine.analyze_transaction_patterns(data["transactions"])
            )

        # Customer metrics
        if "customers" in data:
            metrics["customer_analytics"] = (
                analytics_engine.customer_segmentation_analysis(data["customers"])
            )

        # Risk metrics
        if "portfolio" in data:
            metrics["risk_analytics"] = analytics_engine.risk_analytics(
                data["portfolio"]
            )

        # Product metrics
        if "products" in data:
            metrics["product_analytics"] = (
                analytics_engine.product_performance_analysis(data["products"])
            )

        response = {
            "dashboard_metrics": metrics,
            "generated_at": datetime.now().isoformat(),
            "metrics_count": len(metrics),
        }

        logger.info(f"Dashboard metrics generated with {len(metrics)} metric types")

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error generating dashboard metrics: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
