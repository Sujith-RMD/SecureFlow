from typing import List
from datetime import datetime, timedelta, timezone
from collections import Counter

def _parse_ts(ts: str) -> datetime:
    """Parse an ISO timestamp (with optional Z suffix) into a UTC-aware datetime."""
    cleaned = ts.replace("Z", "+00:00") if ts.endswith("Z") else ts
    dt = datetime.fromisoformat(cleaned)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def calculate_dashboard_stats(history: List[dict]):

    total_transactions = len(history)
    flagged_count = 0
    blocked_count = 0
    money_saved = 0
    safe_count = 0
    total_amount = 0
    score_sum = 0

    # Track top triggered rules across all transactions
    rule_counter: Counter = Counter()
    # Track hourly transaction distribution
    hourly_dist = [0] * 24

    for txn in history:
        risk = txn.get("riskResult")
        if not risk:
            continue

        level = risk.get("level")
        action = risk.get("recommendedAction")
        amount = txn.get("amount", 0)
        score = risk.get("score", 0)

        total_amount += amount
        score_sum += score

        if level == "LOW":
            safe_count += 1

        if level in ["MEDIUM", "HIGH"]:
            flagged_count += 1

        if action == "BLOCK":
            blocked_count += 1
            money_saved += amount

        # Count rule triggers
        for reason in risk.get("reasons", []):
            rule_counter[reason.get("ruleId", "UNKNOWN")] += 1

        # Hourly distribution
        try:
            dt = _parse_ts(txn.get("timestamp", ""))
            hourly_dist[dt.hour] += 1
        except Exception:
            pass

    # Compute security score (inverse of average risk)
    avg_risk = (score_sum / total_transactions) if total_transactions > 0 else 0
    security_score = max(0, min(100, round(100 - avg_risk)))

    # Trust rate
    trust_rate = round((safe_count / total_transactions * 100), 1) if total_transactions > 0 else 100.0

    # Recent transactions (last 6, newest first — already newest-first from mock_data)
    recent = []
    for txn in history[:6]:
        risk = txn.get("riskResult", {})
        ts = txn.get("timestamp", "")
        # Calculate relative time
        try:
            dt = _parse_ts(ts)
            diff = datetime.now(timezone.utc) - dt
            if diff.total_seconds() < 60:
                time_str = f"{int(diff.total_seconds())}s ago"
            elif diff.total_seconds() < 3600:
                time_str = f"{int(diff.total_seconds() // 60)}m ago"
            elif diff.total_seconds() < 86400:
                time_str = f"{int(diff.total_seconds() // 3600)}h ago"
            else:
                time_str = f"{int(diff.total_seconds() // 86400)}d ago"
        except Exception:
            time_str = "—"

        recent.append({
            "id": txn.get("id", ""),
            "to": txn.get("recipientUPI", ""),
            "name": txn.get("recipientName", "Unknown"),
            "amount": txn.get("amount", 0),
            "risk": risk.get("level", "LOW"),
            "score": risk.get("score", 0),
            "time": time_str,
        })

    # Risk distribution
    low_count = safe_count
    med_count = sum(1 for t in history if t.get("riskResult", {}).get("level") == "MEDIUM")
    high_count = sum(1 for t in history if t.get("riskResult", {}).get("level") == "HIGH")
    low_pct = round(low_count / total_transactions * 100) if total_transactions else 0
    med_pct = round(med_count / total_transactions * 100) if total_transactions else 0
    high_pct = 100 - low_pct - med_pct if total_transactions else 0

    # Top triggered rules (for display)
    top_rules = [
        {"ruleId": rid, "count": cnt}
        for rid, cnt in rule_counter.most_common(5)
    ]

    # Threat trend — scores over last N transactions (newest last)
    threat_trend = [
        txn.get("riskResult", {}).get("score", 0)
        for txn in reversed(history[:12])
    ]

    return {
        "totalTransactions": total_transactions,
        "flaggedCount": flagged_count,
        "blockedCount": blocked_count,
        "moneySaved": money_saved,
        "safeCount": safe_count,
        "securityScore": security_score,
        "trustRate": trust_rate,
        "avgRiskScore": round(avg_risk, 1),
        "totalAmount": total_amount,
        "recentTransactions": recent,
        "riskDistribution": {
            "low": {"count": low_count, "pct": low_pct},
            "medium": {"count": med_count, "pct": med_pct},
            "high": {"count": high_count, "pct": high_pct},
        },
        "topRules": top_rules,
        "threatTrend": threat_trend,
        "hourlyDistribution": hourly_dist,
        "rulesEvaluated": 9,
    }