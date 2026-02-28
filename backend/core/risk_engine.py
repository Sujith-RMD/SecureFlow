from typing import List
from datetime import datetime, timedelta
from models import RiskReason

SCAM_KEYWORDS = [
    "lottery", "prize", "urgent",
    "gift", "claim", "winner", "free"
]

def analyze_transaction(payload, history: List[dict]):

    score = 0
    reasons = []

    # RULE 1 — NEW_RECIPIENT
    if not any(txn["recipientUPI"] == payload.recipientUPI for txn in history):
        score += 30
        reasons.append(RiskReason(
            ruleId="NEW_RECIPIENT",
            title="New Recipient Detected",
            description="You have never paid this UPI ID before.",
            severity="MEDIUM",
            scoreAdded=30
        ))

    # RULE 2 — UNUSUAL_AMOUNT (3x average)
    if history:
        avg = sum(txn["amount"] for txn in history) / len(history)
        if payload.amount > avg * 3:
            score += 25
            reasons.append(RiskReason(
                ruleId="UNUSUAL_AMOUNT",
                title="Unusual Transaction Amount",
                description="Amount exceeds 3x your average transaction.",
                severity="MEDIUM",
                scoreAdded=25
            ))

    # RULE 3 — HIGH_FREQUENCY (3 in last 10 mins)
    now = datetime.utcnow()
    recent = [
        txn for txn in history
        if now - datetime.fromisoformat(txn["timestamp"]) <= timedelta(minutes=10)
    ]
    if len(recent) >= 3:
        score += 20
        reasons.append(RiskReason(
            ruleId="HIGH_FREQUENCY",
            title="High Transaction Frequency",
            description="Multiple transactions in last 10 minutes.",
            severity="MEDIUM",
            scoreAdded=20
        ))

    # RULE 4 — LARGE_ROUND_NUMBER
    if payload.amount >= 10000 and payload.amount % 10000 == 0:
        score += 15
        reasons.append(RiskReason(
            ruleId="LARGE_ROUND_NUMBER",
            title="Large Round Number",
            description="Large clean round amounts are common in scams.",
            severity="LOW",
            scoreAdded=15
        ))

    # RULE 5 — SCAM_KEYWORD
    if any(word in payload.remarks.lower() for word in SCAM_KEYWORDS):
        score += 35
        reasons.append(RiskReason(
            ruleId="SCAM_KEYWORD",
            title="Suspicious Keyword Detected",
            description="Remarks contain scam-related keywords.",
            severity="HIGH",
            scoreAdded=35
        ))

    # RULE 6 — BEHAVIORAL_SHIFT (Median-based)
    if history:
        amounts = sorted(txn["amount"] for txn in history)
        mid = len(amounts) // 2

        if len(amounts) % 2 == 0:
            median = (amounts[mid - 1] + amounts[mid]) / 2
        else:
            median = amounts[mid]

        if payload.amount > median * 4:
            score += 40
            reasons.append(RiskReason(
                ruleId="BEHAVIORAL_SHIFT",
                title="Behavioral Spending Shift",
                description="Transaction significantly exceeds median historical spending pattern.",
                severity="HIGH",
                scoreAdded=40
            ))

    if score > 100:
        score = 100

    return score, reasons