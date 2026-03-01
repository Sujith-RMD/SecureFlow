from fastapi import APIRouter, HTTPException
from models import AnalyzeRequest, RiskResult
from core.risk_engine import analyze_transaction, TOTAL_RULES
from core.friction_engine import map_friction
from core.stats_engine import calculate_dashboard_stats
from mock_data import get_mock_history, add_transaction, reset_history, MOCK_USER
from datetime import datetime, timezone
import logging
import time

logger = logging.getLogger("secureflow")

router = APIRouter(prefix="/api")

# ───────────────────────────────────────────────────
# POST /api/analyze — risk-check a potential txn
# ───────────────────────────────────────────────────
@router.post("/analyze", response_model=RiskResult)
def analyze(request: AnalyzeRequest):
    logger.info(f"Analyzing transaction: {request.recipientUPI} - ₹{request.amount}")

    start = time.perf_counter()

    history = get_mock_history()

    score, reasons = analyze_transaction(
        request, history, trusted_contacts=MOCK_USER.get("trustedContacts")
    )

    if score > 0:
        for reason in reasons:
            reason.contributionPercent = round(
                (abs(reason.scoreAdded) / max(score, 1)) * 100, 2
            )

    level, action, friction = map_friction(score)

    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info(f"Risk score: {score} ({level}) — {elapsed_ms}ms")

    return RiskResult(
        score=score,
        level=level,
        reasons=reasons,
        recommendedAction=action,
        friction=friction,
        analysisTimeMs=elapsed_ms,
        rulesEvaluated=TOTAL_RULES,
    )


# ───────────────────────────────────────────────────
# POST /api/send — analyse, record, and "send" a txn
# ───────────────────────────────────────────────────
@router.post("/send")
def send(request: AnalyzeRequest):
    logger.info(f"Send request: {request.recipientUPI} - ₹{request.amount}")

    if request.amount > MOCK_USER["balance"]:
        raise HTTPException(status_code=400, detail="Insufficient balance.")

    start = time.perf_counter()

    history = get_mock_history()
    score, reasons = analyze_transaction(
        request, history, trusted_contacts=MOCK_USER.get("trustedContacts")
    )

    if score > 0:
        for reason in reasons:
            reason.contributionPercent = round(
                (abs(reason.scoreAdded) / max(score, 1)) * 100, 2
            )

    level, action, friction = map_friction(score)

    # Determine status
    status = "blocked" if action == "BLOCK" else "completed"

    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)

    # Build risk result dict
    risk_result = {
        "score": score,
        "level": level,
        "reasons": [r.model_dump() for r in reasons],
        "recommendedAction": action,
        "friction": friction.model_dump(),
        "analysisTimeMs": elapsed_ms,
        "rulesEvaluated": TOTAL_RULES,
    }

    # Derive a display name from the UPI id
    upi_user = request.recipientUPI.split("@")[0].replace(".", " ").replace("_", " ").title()

    txn = add_transaction({
        "recipientUPI": request.recipientUPI,
        "recipientName": upi_user,
        "amount": request.amount,
        "remarks": request.remarks,
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
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
# POST /api/reset — clear all history
# ───────────────────────────────────────────────────
@router.post("/reset")
def reset():
    reset_history()
    return {"status": "ok", "message": "History cleared"}


# ───────────────────────────────────────────────────
# GET /api/health
# ───────────────────────────────────────────────────
@router.get("/health")
def health():
    return {
        "status": "SecureFlow backend operational",
        "version": "1.2.0",
        "engines": {
            "risk":     {"rules": TOTAL_RULES, "status": "active"},
            "friction": {"tiers": 4, "status": "active"},
            "stats":    {"status": "active"},
        },
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }