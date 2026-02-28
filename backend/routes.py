from fastapi import APIRouter
from models import AnalyzeRequest, RiskResult
from core.risk_engine import analyze_transaction
from core.friction_engine import map_friction
from core.stats_engine import calculate_dashboard_stats
from mock_data import get_mock_history
import logging

logger = logging.getLogger("secureflow")

router = APIRouter()

@router.post("/analyze", response_model=RiskResult)
def analyze(request: AnalyzeRequest):

    logger.info(f"Analyzing transaction: {request.recipientUPI} - {request.amount}")

    history = get_mock_history()

    score, reasons = analyze_transaction(request, history)

    # Calculate contribution percentage
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

@router.get("/dashboard-stats")
def dashboard_stats():
    history = get_mock_history()
    return calculate_dashboard_stats(history)

@router.get("/health")
def health():
    return {"status": "SecureFlow backend operational"}