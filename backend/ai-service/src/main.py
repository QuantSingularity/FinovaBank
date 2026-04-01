import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.analytics import analytics_bp
from src.routes.fraud_detection import fraud_bp
from src.routes.recommendations import recommendations_bp
from src.routes.risk_assessment import risk_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), "static"))

app.config["SECRET_KEY"] = os.environ.get(
    "SECRET_KEY", "FinovaBank-AI-Service-Secret-Key-change-in-production"
)

CORS(
    app,
    origins=os.environ.get("CORS_ORIGINS", "*"),
    allow_headers=["Content-Type", "Authorization"],
)

app.register_blueprint(fraud_bp, url_prefix="/api/ai/fraud")
app.register_blueprint(risk_bp, url_prefix="/api/ai/risk")
app.register_blueprint(recommendations_bp, url_prefix="/api/ai/recommendations")
app.register_blueprint(analytics_bp, url_prefix="/api/ai/analytics")

db_path = os.environ.get(
    "DATABASE_URL",
    f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}",
)
app.config["SQLALCHEMY_DATABASE_URI"] = db_path
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}

db.init_app(app)
with app.app_context():
    os.makedirs(os.path.join(os.path.dirname(__file__), "database"), exist_ok=True)
    db.create_all()


@app.route("/health")
def health_check():
    return {"status": "healthy", "service": "FinovaBank AI Service"}, 200


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404
    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    index_path = os.path.join(static_folder_path, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(static_folder_path, "index.html")
    return "AI Service is running", 200


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    port = int(os.environ.get("PORT", 8012))
    app.run(host="0.0.0.0", port=port, debug=debug)
