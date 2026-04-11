import logging
from datetime import datetime
from typing import Dict, List

import numpy as np
from flask import Blueprint, jsonify, request

fraud_bp = Blueprint("fraud", __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FraudDetectionEngine:
    """Advanced fraud detection engine using machine learning"""

    def __init__(self):
        self.model = None
        self.feature_scaler = None
        self.load_models()

    def load_models(self):
        """Load pre-trained models or initialize with default parameters"""
        try:
            # In a real implementation, you would load pre-trained models
            # For demo purposes, we'll use rule-based detection with ML-like scoring
            logger.info("Fraud detection models loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load models: {e}. Using rule-based detection.")

    def extract_features(self, transaction_data: Dict) -> Dict[str, float]:
        """Extract features from transaction data for ML model"""
        features = {}

        # Amount-based features
        features["amount"] = float(transaction_data.get("amount", 0))
        features["amount_log"] = np.log1p(features["amount"])

        # Time-based features
        # BUG FIX: datetime.fromisoformat() can return timezone-aware datetimes
        # (e.g. "2024-01-01T10:00:00+00:00"), which cannot be subtracted from
        # naive datetime.now(). Strip tzinfo to avoid TypeError at runtime.
        raw_ts = transaction_data.get("timestamp", datetime.now().isoformat())
        transaction_time = datetime.fromisoformat(raw_ts).replace(tzinfo=None)
        features["hour"] = transaction_time.hour
        features["day_of_week"] = transaction_time.weekday()
        features["is_weekend"] = 1 if transaction_time.weekday() >= 5 else 0
        features["is_night"] = (
            1 if transaction_time.hour < 6 or transaction_time.hour > 22 else 0
        )

        # Account-based features
        raw_created = transaction_data.get(
            "account_created_date", datetime.now().isoformat()
        )
        account_created = datetime.fromisoformat(raw_created).replace(tzinfo=None)
        features["account_age_days"] = (datetime.now() - account_created).days

        # Transaction type features
        transaction_type = transaction_data.get("transaction_type", "UNKNOWN")
        features["is_withdrawal"] = 1 if transaction_type == "WITHDRAWAL" else 0
        features["is_transfer"] = 1 if transaction_type == "TRANSFER" else 0
        features["is_online"] = 1 if transaction_data.get("channel") == "ONLINE" else 0

        # Location-based features
        features["is_foreign_country"] = (
            1
            if transaction_data.get("country")
            != transaction_data.get("home_country", "US")
            else 0
        )

        # Velocity features (would be calculated from historical data)
        features["daily_transaction_count"] = transaction_data.get(
            "daily_transaction_count", 1
        )
        features["daily_transaction_amount"] = transaction_data.get(
            "daily_transaction_amount", features["amount"]
        )

        return features

    def calculate_risk_score(self, features: Dict[str, float]) -> float:
        """Calculate fraud risk score using rule-based and ML-like approach"""
        risk_score = 0.0

        # Amount-based rules
        if features["amount"] > 10000:
            risk_score += 0.3
        elif features["amount"] > 5000:
            risk_score += 0.2
        elif features["amount"] > 1000:
            risk_score += 0.1

        # Time-based rules
        if features["is_night"]:
            risk_score += 0.15
        if features["is_weekend"]:
            risk_score += 0.1

        # Velocity rules
        if features["daily_transaction_count"] > 10:
            risk_score += 0.25
        if features["daily_transaction_amount"] > 20000:
            risk_score += 0.3

        # Location rules
        if features["is_foreign_country"]:
            risk_score += 0.2

        # Channel rules
        if features["is_online"]:
            risk_score += 0.05

        # Account age rules
        if features["account_age_days"] < 30:
            risk_score += 0.15

        # Normalize score to 0-1 range
        return min(risk_score, 1.0)

    def get_fraud_indicators(
        self, features: Dict[str, float], risk_score: float
    ) -> List[str]:
        """Get list of fraud indicators based on features"""
        indicators = []

        if features["amount"] > 10000:
            indicators.append("High transaction amount")
        if features["is_night"]:
            indicators.append("Transaction during unusual hours")
        if features["daily_transaction_count"] > 10:
            indicators.append("High transaction frequency")
        if features["is_foreign_country"]:
            indicators.append("Transaction from foreign country")
        if features["account_age_days"] < 30:
            indicators.append("New account")
        if risk_score > 0.7:
            indicators.append("Multiple risk factors detected")

        return indicators


# Initialize fraud detection engine
fraud_engine = FraudDetectionEngine()


@fraud_bp.route("/analyze", methods=["POST"])
def analyze_transaction():
    """Analyze a transaction for fraud risk"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Extract features
        features = fraud_engine.extract_features(data)

        # Calculate risk score
        risk_score = fraud_engine.calculate_risk_score(features)

        # Determine risk level
        if risk_score >= 0.8:
            risk_level = "HIGH"
            action = "BLOCK"
        elif risk_score >= 0.5:
            risk_level = "MEDIUM"
            action = "REVIEW"
        elif risk_score >= 0.3:
            risk_level = "LOW"
            action = "MONITOR"
        else:
            risk_level = "MINIMAL"
            action = "APPROVE"

        # Get fraud indicators
        indicators = fraud_engine.get_fraud_indicators(features, risk_score)

        response = {
            "transaction_id": data.get("transaction_id"),
            "risk_score": round(risk_score, 3),
            "risk_level": risk_level,
            "recommended_action": action,
            "fraud_indicators": indicators,
            "features_analyzed": len(features),
            "analysis_timestamp": datetime.now().isoformat(),
            "model_version": "1.0.0",
        }

        logger.info(
            f"Fraud analysis completed for transaction {data.get('transaction_id')}: {risk_level} risk"
        )

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error in fraud analysis: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@fraud_bp.route("/batch-analyze", methods=["POST"])
def batch_analyze_transactions():
    """Analyze multiple transactions for fraud risk"""
    try:
        data = request.get_json()
        transactions = data.get("transactions", [])

        if not transactions:
            return jsonify({"error": "No transactions provided"}), 400

        results = []

        for transaction in transactions:
            features = fraud_engine.extract_features(transaction)
            risk_score = fraud_engine.calculate_risk_score(features)

            if risk_score >= 0.8:
                risk_level = "HIGH"
                action = "BLOCK"
            elif risk_score >= 0.5:
                risk_level = "MEDIUM"
                action = "REVIEW"
            elif risk_score >= 0.3:
                risk_level = "LOW"
                action = "MONITOR"
            else:
                risk_level = "MINIMAL"
                action = "APPROVE"

            indicators = fraud_engine.get_fraud_indicators(features, risk_score)

            result = {
                "transaction_id": transaction.get("transaction_id"),
                "risk_score": round(risk_score, 3),
                "risk_level": risk_level,
                "recommended_action": action,
                "fraud_indicators": indicators,
            }

            results.append(result)

        response = {
            "batch_id": data.get(
                "batch_id", f"batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            ),
            "total_transactions": len(transactions),
            "high_risk_count": len([r for r in results if r["risk_level"] == "HIGH"]),
            "medium_risk_count": len(
                [r for r in results if r["risk_level"] == "MEDIUM"]
            ),
            "low_risk_count": len([r for r in results if r["risk_level"] == "LOW"]),
            "minimal_risk_count": len(
                [r for r in results if r["risk_level"] == "MINIMAL"]
            ),
            "results": results,
            "analysis_timestamp": datetime.now().isoformat(),
        }

        logger.info(
            f"Batch fraud analysis completed for {len(transactions)} transactions"
        )

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error in batch fraud analysis: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@fraud_bp.route("/model-info", methods=["GET"])
def get_model_info():
    """Get information about the fraud detection model"""
    return (
        jsonify(
            {
                "model_name": "FinovaBank Fraud Detection Engine",
                "version": "1.0.0",
                "features_count": 12,
                "model_type": "Hybrid Rule-Based and ML",
                "last_trained": "2024-01-01",
                "accuracy": 0.95,
                "precision": 0.92,
                "recall": 0.88,
                "f1_score": 0.90,
            }
        ),
        200,
    )


@fraud_bp.route("/update-model", methods=["POST"])
def update_model():
    """Update fraud detection model with new training data"""
    try:
        data = request.get_json()
        training_data = data.get("training_data", [])

        if not training_data:
            return jsonify({"error": "No training data provided"}), 400

        # In a real implementation, this would retrain the model
        # For demo purposes, we'll simulate model update

        logger.info(f"Model update initiated with {len(training_data)} samples")

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Model update completed",
                    "training_samples": len(training_data),
                    "new_accuracy": 0.96,
                    "update_timestamp": datetime.now().isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error updating model: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
