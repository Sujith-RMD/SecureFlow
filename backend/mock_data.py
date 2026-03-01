from datetime import datetime, timedelta
import uuid

# ═══════════════════════════════════════════════════
# IN-MEMORY TRANSACTION STORE  (acts as DB for demo)
# ═══════════════════════════════════════════════════

_transactions: list[dict] = []
_initialized = False


def _seed():
    """Seed realistic transaction history on first access."""
    global _initialized
    if _initialized:
        return
    _initialized = True

    now = datetime.utcnow()

    def _ts(dt):
        return dt.isoformat() + "Z"

    seed_data = [
        # ── Low-risk, everyday payments ──
        {
            "recipientUPI": "rahul@okaxis",
            "recipientName": "Rahul Sharma",
            "amount": 500,
            "remarks": "Tea money",
            "timestamp": _ts(now - timedelta(minutes=8)),
            "status": "completed",
            "riskResult": {
                "score": 5,
                "level": "LOW",
                "reasons": [],
                "recommendedAction": "ALLOW",
                "friction": {"type": "TOAST", "delaySeconds": 0, "canOverride": True, "color": "green"},
            },
        },
        {
            "recipientUPI": "priya@upi",
            "recipientName": "Priya Menon",
            "amount": 800,
            "remarks": "Lunch split",
            "timestamp": _ts(now - timedelta(minutes=25)),
            "status": "completed",
            "riskResult": {
                "score": 8,
                "level": "LOW",
                "reasons": [],
                "recommendedAction": "ALLOW",
                "friction": {"type": "TOAST", "delaySeconds": 0, "canOverride": True, "color": "green"},
            },
        },
        {
            "recipientUPI": "rahul@okaxis",
            "recipientName": "Rahul Sharma",
            "amount": 2500,
            "remarks": "Birthday gift",
            "timestamp": _ts(now - timedelta(hours=1)),
            "status": "completed",
            "riskResult": {
                "score": 12,
                "level": "LOW",
                "reasons": [],
                "recommendedAction": "ALLOW",
                "friction": {"type": "TOAST", "delaySeconds": 0, "canOverride": True, "color": "green"},
            },
        },
        {
            "recipientUPI": "a.verma@okicici",
            "recipientName": "Ankit Verma",
            "amount": 1200,
            "remarks": "Cab fare",
            "timestamp": _ts(now - timedelta(hours=2)),
            "status": "completed",
            "riskResult": {
                "score": 10,
                "level": "LOW",
                "reasons": [],
                "recommendedAction": "ALLOW",
                "friction": {"type": "TOAST", "delaySeconds": 0, "canOverride": True, "color": "green"},
            },
        },
        {
            "recipientUPI": "merchant@hdfc",
            "recipientName": "HDFC Merchant",
            "amount": 3000,
            "remarks": "Online order",
            "timestamp": _ts(now - timedelta(hours=3)),
            "status": "completed",
            "riskResult": {
                "score": 18,
                "level": "LOW",
                "reasons": [],
                "recommendedAction": "ALLOW",
                "friction": {"type": "TOAST", "delaySeconds": 0, "canOverride": True, "color": "green"},
            },
        },
        {
            "recipientUPI": "priya@upi",
            "recipientName": "Priya Menon",
            "amount": 450,
            "remarks": "Coffee",
            "timestamp": _ts(now - timedelta(hours=5)),
            "status": "completed",
            "riskResult": {
                "score": 4,
                "level": "LOW",
                "reasons": [],
                "recommendedAction": "ALLOW",
                "friction": {"type": "TOAST", "delaySeconds": 0, "canOverride": True, "color": "green"},
            },
        },
        # ── Medium-risk activity ──
        {
            "recipientUPI": "newperson@paytm",
            "recipientName": "Unknown Contact",
            "amount": 8000,
            "remarks": "Freelance work",
            "timestamp": _ts(now - timedelta(hours=6)),
            "status": "completed",
            "riskResult": {
                "score": 48,
                "level": "MEDIUM",
                "reasons": [
                    {
                        "ruleId": "NEW_RECIPIENT",
                        "title": "New Recipient Detected",
                        "description": "You have never paid this UPI ID before.",
                        "severity": "MEDIUM",
                        "scoreAdded": 30,
                        "contributionPercent": 62.5,
                    },
                    {
                        "ruleId": "LARGE_ROUND_NUMBER",
                        "title": "Large Round Number",
                        "description": "Large clean round amounts are common in scams.",
                        "severity": "LOW",
                        "scoreAdded": 15,
                        "contributionPercent": 31.25,
                    },
                ],
                "recommendedAction": "WARN",
                "friction": {"type": "MODAL", "delaySeconds": 5, "canOverride": True, "color": "yellow"},
            },
        },
        {
            "recipientUPI": "new_recvr@ybl",
            "recipientName": "New Contact",
            "amount": 12000,
            "remarks": "Rent share",
            "timestamp": _ts(now - timedelta(hours=10)),
            "status": "completed",
            "riskResult": {
                "score": 54,
                "level": "MEDIUM",
                "reasons": [
                    {
                        "ruleId": "NEW_RECIPIENT",
                        "title": "New Recipient Detected",
                        "description": "You have never paid this UPI ID before.",
                        "severity": "MEDIUM",
                        "scoreAdded": 30,
                        "contributionPercent": 55.56,
                    },
                    {
                        "ruleId": "UNUSUAL_AMOUNT",
                        "title": "Unusual Transaction Amount",
                        "description": "Amount exceeds 3x your average transaction.",
                        "severity": "MEDIUM",
                        "scoreAdded": 25,
                        "contributionPercent": 46.3,
                    },
                ],
                "recommendedAction": "WARN",
                "friction": {"type": "MODAL", "delaySeconds": 5, "canOverride": True, "color": "yellow"},
            },
        },
        # ── High-risk / blocked ──
        {
            "recipientUPI": "claim.prize@upi",
            "recipientName": "Scam Suspect",
            "amount": 50000,
            "remarks": "Claim your prize now",
            "timestamp": _ts(now - timedelta(days=1)),
            "status": "blocked",
            "riskResult": {
                "score": 100,
                "level": "HIGH",
                "reasons": [
                    {
                        "ruleId": "SCAM_KEYWORD",
                        "title": "Suspicious Keyword Detected",
                        "description": "Remarks contain scam-related keywords.",
                        "severity": "HIGH",
                        "scoreAdded": 35,
                        "contributionPercent": 35.0,
                    },
                    {
                        "ruleId": "NEW_RECIPIENT",
                        "title": "New Recipient Detected",
                        "description": "You have never paid this UPI ID before.",
                        "severity": "MEDIUM",
                        "scoreAdded": 30,
                        "contributionPercent": 30.0,
                    },
                    {
                        "ruleId": "BEHAVIORAL_SHIFT",
                        "title": "Behavioral Spending Shift",
                        "description": "Transaction significantly exceeds median historical spending pattern.",
                        "severity": "HIGH",
                        "scoreAdded": 40,
                        "contributionPercent": 40.0,
                    },
                ],
                "recommendedAction": "BLOCK",
                "friction": {"type": "BLOCK", "delaySeconds": 10, "canOverride": False, "color": "red"},
            },
        },
        {
            "recipientUPI": "urgent.help@ybl",
            "recipientName": "Unknown",
            "amount": 25000,
            "remarks": "Urgent payment needed",
            "timestamp": _ts(now - timedelta(days=2)),
            "status": "blocked",
            "riskResult": {
                "score": 95,
                "level": "HIGH",
                "reasons": [
                    {
                        "ruleId": "SCAM_KEYWORD",
                        "title": "Suspicious Keyword Detected",
                        "description": "Remarks contain scam-related keywords.",
                        "severity": "HIGH",
                        "scoreAdded": 35,
                        "contributionPercent": 36.84,
                    },
                    {
                        "ruleId": "NEW_RECIPIENT",
                        "title": "New Recipient Detected",
                        "description": "You have never paid this UPI ID before.",
                        "severity": "MEDIUM",
                        "scoreAdded": 30,
                        "contributionPercent": 31.58,
                    },
                    {
                        "ruleId": "UNUSUAL_AMOUNT",
                        "title": "Unusual Transaction Amount",
                        "description": "Amount exceeds 3x your average transaction.",
                        "severity": "MEDIUM",
                        "scoreAdded": 25,
                        "contributionPercent": 26.32,
                    },
                ],
                "recommendedAction": "BLOCK",
                "friction": {"type": "BLOCK", "delaySeconds": 10, "canOverride": False, "color": "red"},
            },
        },
        # ── More safe history ──
        {
            "recipientUPI": "rahul@okaxis",
            "recipientName": "Rahul Sharma",
            "amount": 350,
            "remarks": "Snacks",
            "timestamp": _ts(now - timedelta(days=3)),
            "status": "completed",
            "riskResult": {
                "score": 3,
                "level": "LOW",
                "reasons": [],
                "recommendedAction": "ALLOW",
                "friction": {"type": "TOAST", "delaySeconds": 0, "canOverride": True, "color": "green"},
            },
        },
        {
            "recipientUPI": "a.verma@okicici",
            "recipientName": "Ankit Verma",
            "amount": 2000,
            "remarks": "Gym subscription",
            "timestamp": _ts(now - timedelta(days=4)),
            "status": "completed",
            "riskResult": {
                "score": 7,
                "level": "LOW",
                "reasons": [],
                "recommendedAction": "ALLOW",
                "friction": {"type": "TOAST", "delaySeconds": 0, "canOverride": True, "color": "green"},
            },
        },
        {
            "recipientUPI": "merchant@hdfc",
            "recipientName": "HDFC Merchant",
            "amount": 5500,
            "remarks": "Electronics",
            "timestamp": _ts(now - timedelta(days=5)),
            "status": "completed",
            "riskResult": {
                "score": 15,
                "level": "LOW",
                "reasons": [],
                "recommendedAction": "ALLOW",
                "friction": {"type": "TOAST", "delaySeconds": 0, "canOverride": True, "color": "green"},
            },
        },
        {
            "recipientUPI": "priya@upi",
            "recipientName": "Priya Menon",
            "amount": 600,
            "remarks": "Movie tickets",
            "timestamp": _ts(now - timedelta(days=6)),
            "status": "completed",
            "riskResult": {
                "score": 6,
                "level": "LOW",
                "reasons": [],
                "recommendedAction": "ALLOW",
                "friction": {"type": "TOAST", "delaySeconds": 0, "canOverride": True, "color": "green"},
            },
        },
        {
            "recipientUPI": "rahul@okaxis",
            "recipientName": "Rahul Sharma",
            "amount": 1500,
            "remarks": "Dinner",
            "timestamp": _ts(now - timedelta(days=7)),
            "status": "completed",
            "riskResult": {
                "score": 9,
                "level": "LOW",
                "reasons": [],
                "recommendedAction": "ALLOW",
                "friction": {"type": "TOAST", "delaySeconds": 0, "canOverride": True, "color": "green"},
            },
        },
    ]

    for item in seed_data:
        item["id"] = f"TXN-{uuid.uuid4().hex[:6].upper()}"
        _transactions.append(item)


def get_mock_history() -> list[dict]:
    """Return the full in-memory transaction list (most-recent first)."""
    _seed()
    return list(reversed(_transactions))


def add_transaction(txn: dict):
    """Append a new transaction and return it."""
    _seed()
    txn["id"] = f"TXN-{uuid.uuid4().hex[:6].upper()}"
    _transactions.append(txn)
    return txn


def reset_history():
    """Clear all transactions and reset user balance."""
    global _initialized
    _transactions.clear()
    _initialized = True          # skip re-seeding
    MOCK_USER["balance"] = 84750.50


# ═══════════════════════════════════════════════════
# MOCK USER
# ═══════════════════════════════════════════════════

MOCK_USER = {
    "id": "USR-001",
    "name": "Aarav Patel",
    "upiId": "aarav@secureflow",
    "balance": 84750.50,
    "trustedContacts": ["rahul@okaxis", "priya@upi", "a.verma@okicici", "merchant@hdfc"],
}
