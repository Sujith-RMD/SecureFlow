from typing import List, Tuple
from datetime import datetime, timedelta, timezone
import re
from models import RiskReason

def _parse_ts(ts: str) -> datetime:
    """Parse an ISO timestamp (with optional Z suffix) into a UTC-aware datetime."""
    cleaned = ts.replace("Z", "+00:00") if ts.endswith("Z") else ts
    dt = datetime.fromisoformat(cleaned)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt

SCAM_KEYWORDS = [
    # classic bait words
    "lottery", "prize", "urgent", "gift", "claim", "winner", "free",
    # pressure / fear tactics
    "otp", "verify", "suspend", "blocked", "expired", "deadline",
    "immediately", "hurry", "asap", "now", "quick",
    # impersonation / authority
    "rbi", "bank manager", "customer care", "kyc", "aadhar", "pan",
    "police", "court", "legal notice", "arrest",
    # money lure
    "cashback", "refund", "reward", "bonus", "offer", "discount",
    "investment", "guaranteed", "double", "profit", "returns",
    # social engineering
    "help me", "emergency", "hospital", "accident", "stranded",
    "send money", "transfer now", "pay now", "do it now",
    # crypto / job scams
    "bitcoin", "crypto", "trading", "work from home", "part time job",
    "commission", "registration fee", "processing fee",
]

# Regex patterns for suspicious UPI IDs
SUSPICIOUS_UPI_PATTERNS = [
    r"(claim|prize|win|lucky|reward|free|offer)",        # lure words in UPI
    r"(helpdesk|support|care|service)\d*@",              # fake support IDs
    r"(urgent|hurry|asap|quick)",                        # pressure in UPI ID
    r"\d{10,}@",                                         # random long numbers
    r"(scam|fraud|hack|steal|phish)",                    # obvious red flags
]

TOTAL_RULES = 9  # keep in sync with the count below


def _find_matched_keywords(text: str) -> List[str]:
    """Return all scam keywords found in the text for detailed reporting."""
    lower = text.lower()
    return [kw for kw in SCAM_KEYWORDS if kw in lower]


def analyze_transaction(
    payload, history: List[dict], trusted_contacts: List[str] | None = None
) -> Tuple[int, List[RiskReason]]:
    """
    Score a transaction against 9 behavioural + contextual rules.
    Returns (score 0-100, list[RiskReason]).
    """

    score = 0
    reasons: List[RiskReason] = []

    # ── RULE 1 — NEW_RECIPIENT ──────────────────────────────────
    is_new = not any(txn["recipientUPI"] == payload.recipientUPI for txn in history)
    if is_new:
        score += 20
        reasons.append(RiskReason(
            ruleId="NEW_RECIPIENT",
            title="New Recipient Detected",
            description="You have never paid this UPI ID before.",
            severity="MEDIUM",
            scoreAdded=20
        ))

    # ── RULE 2 — UNUSUAL_AMOUNT (3× average) ───────────────────
    if history:
        avg = sum(txn["amount"] for txn in history) / len(history)
        if payload.amount > avg * 3:
            score += 15
            reasons.append(RiskReason(
                ruleId="UNUSUAL_AMOUNT",
                title="Unusual Transaction Amount",
                description=f"Amount (₹{payload.amount:,.0f}) exceeds 3× your average (₹{avg:,.0f}).",
                severity="MEDIUM",
                scoreAdded=15
            ))

    # ── RULE 3 — HIGH_FREQUENCY (3+ in last 10 mins) ──────────
    now = datetime.now(timezone.utc)
    recent = [
        txn for txn in history
        if now - _parse_ts(txn["timestamp"]) <= timedelta(minutes=10)
    ]
    if len(recent) >= 3:
        score += 15
        reasons.append(RiskReason(
            ruleId="HIGH_FREQUENCY",
            title="High Transaction Frequency",
            description=f"{len(recent)} transactions in the last 10 minutes — potential rapid-fire fraud.",
            severity="MEDIUM",
            scoreAdded=15
        ))

    # ── RULE 4 — LARGE_ROUND_NUMBER ────────────────────────────
    if payload.amount >= 10000 and payload.amount % 10000 == 0:
        score += 10
        reasons.append(RiskReason(
            ruleId="LARGE_ROUND_NUMBER",
            title="Large Round Number",
            description="Large clean round amounts (₹10K+) are a common pattern in scam payments.",
            severity="LOW",
            scoreAdded=10
        ))

    # ── RULE 5 — SCAM_KEYWORD (with matched keyword details) ──
    matched_kws = _find_matched_keywords(payload.remarks)
    if matched_kws:
        score += 25
        kw_preview = ", ".join(f'"{ k}"' for k in matched_kws[:3])
        suffix = f" (+{len(matched_kws) - 3} more)" if len(matched_kws) > 3 else ""
        reasons.append(RiskReason(
            ruleId="SCAM_KEYWORD",
            title="Suspicious Keywords Detected",
            description=f"Remarks contain flagged terms: {kw_preview}{suffix}.",
            severity="HIGH",
            scoreAdded=25
        ))

    # ── RULE 6 — BEHAVIORAL_SHIFT (Median-based) ──────────────
    if history:
        amounts = sorted(txn["amount"] for txn in history)
        mid = len(amounts) // 2

        if len(amounts) % 2 == 0:
            median = (amounts[mid - 1] + amounts[mid]) / 2
        else:
            median = amounts[mid]

        if median > 0 and payload.amount > median * 4:
            score += 20
            reasons.append(RiskReason(
                ruleId="BEHAVIORAL_SHIFT",
                title="Behavioral Spending Shift",
                description=f"Amount is {payload.amount / median:.1f}× your median spend (₹{median:,.0f}). Significant deviation detected.",
                severity="HIGH",
                scoreAdded=20
            ))

    # ── RULE 7 — NIGHT_OWL (late-night transactions) ──────────
    hour = now.hour  # UTC
    ist_hour = (hour + 5) % 24  # rough IST conversion
    if ist_hour >= 23 or ist_hour < 5:
        score += 10
        reasons.append(RiskReason(
            ruleId="NIGHT_OWL",
            title="Late-Night Transaction",
            description=f"Payments between 11 PM – 5 AM carry higher fraud risk. Current IST hour: ~{ist_hour}:00.",
            severity="LOW",
            scoreAdded=10
        ))

    # ── RULE 8 — SUSPICIOUS_UPI (regex pattern check) ─────────
    upi_lower = payload.recipientUPI.lower()
    upi_flags = [p for p in SUSPICIOUS_UPI_PATTERNS if re.search(p, upi_lower)]
    if upi_flags:
        score += 20
        reasons.append(RiskReason(
            ruleId="SUSPICIOUS_UPI",
            title="Suspicious UPI ID Pattern",
            description="The recipient's UPI ID matches known fraudulent naming patterns.",
            severity="HIGH",
            scoreAdded=20
        ))

    # ── RULE 9 — TRUSTED_CONTACT (anti-rule: reduces score) ───
    if trusted_contacts and payload.recipientUPI in trusted_contacts:
        reduction = min(score, 15)  # reduce up to 15 pts, never below 0
        if reduction > 0:
            score -= reduction
            reasons.append(RiskReason(
                ruleId="TRUSTED_CONTACT",
                title="Trusted Contact Bonus",
                description="Recipient is in your trusted contacts list — risk score reduced.",
                severity="LOW",
                scoreAdded=-reduction
            ))

    score = max(0, min(100, score))

    return score, reasons