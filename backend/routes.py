from fastapi import APIRouter
from models import AnalyzeRequest, RiskResult
from core.risk_engine import analyze_transaction
from core.friction_engine import map_friction
from core.stats_engine import calculate_dashboard_stats
from mock_data import get_mock_history, add_transaction, MOCK_USER
from datetime import datetime
import logging

logger = logging.getLogger("secureflow")

router = APIRouter(prefix="/api")

# ───────────────────────────────────────────────────
# POST /api/analyze — risk-check a potential txn
# ───────────────────────────────────────────────────
@router.post("/analyze", response_model=RiskResult)
def analyze(request: AnalyzeRequest):
    logger.info(f"Analyzing transaction: {request.recipientUPI} - {request.amount}")

    history = get_mock_history()

    score, reasons = analyze_transaction(request, history)

    if score > 0:
        for reason in reasons:
            reason.contributionPercent = round(
                (reason.scoreAdded / score) * 100, 2
            )

    level, action, friction = map_friction(score)

    return RiskResult(
        score=score,
        level=level,
        reasons=reasons,
        recommendedAction=action,
        friction=friction
    )


# ───────────────────────────────────────────────────
# POST /api/send — analyse, record, and "send" a txn
# ───────────────────────────────────────────────────
@router.post("/send")
def send(request: AnalyzeRequest):
    logger.info(f"Send request: {request.recipientUPI} - ₹{request.amount}")

    history = get_mock_history()
    score, reasons = analyze_transaction(request, history)

    if score > 0:
        for reason in reasons:
            reason.contributionPercent = round(
                (reason.scoreAdded / score) * 100, 2
            )

    level, action, friction = map_friction(score)

    # Determine status
    status = "blocked" if action == "BLOCK" else "completed"

    # Build risk result dict
    risk_result = {
        "score": score,
        "level": level,
        "reasons": [r.dict() for r in reasons],
        "recommendedAction": action,
        "friction": friction.dict(),
    }

    # Derive a display name from the UPI id
    upi_user = request.recipientUPI.split("@")[0].replace(".", " ").replace("_", " ").title()

    txn = add_transaction({
        "recipientUPI": request.recipientUPI,
        "recipientName": upi_user,
        "amount": request.amount,
        "remarks": request.remarks,
        "timestamp": datetime.utcnow().isoformat(),
        "status": status,
        "riskResult": risk_result,
    })

    # Deduct balance if completed
    if status == "completed":
        MOCK_USER["balance"] = round(MOCK_USER["balance"] - request.amount, 2)

    return txn


# ───────────────────────────────────────────────────
# GET /api/history — full transaction list
# ───────────────────────────────────────────────────
@router.get("/history")
def history():
    return get_mock_history()


# ───────────────────────────────────────────────────
# GET /api/user — current user profile
# ───────────────────────────────────────────────────
@router.get("/user")
def user():
    return MOCK_USER


# ───────────────────────────────────────────────────
# GET /api/dashboard-stats — aggregate metrics
# ───────────────────────────────────────────────────
@router.get("/dashboard-stats")
def dashboard_stats():
    history_data = get_mock_history()
    return calculate_dashboard_stats(history_data)


# ───────────────────────────────────────────────────
# GET /api/health
# ───────────────────────────────────────────────────
@router.get("/health")
def health():
    return {"status": "SecureFlow backend operational"}