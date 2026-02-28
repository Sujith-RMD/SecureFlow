from typing import List

def calculate_dashboard_stats(history: List[dict]):

    total_transactions = len(history)
    flagged_count = 0
    blocked_count = 0
    money_saved = 0
    safe_count = 0

    for txn in history:
        risk = txn.get("riskResult")
        if not risk:
            continue

        level = risk.get("level")
        action = risk.get("recommendedAction")
        amount = txn.get("amount", 0)

        if level == "LOW":
            safe_count += 1

        if level in ["MEDIUM", "HIGH"]:
            flagged_count += 1

        if action == "BLOCK":
            blocked_count += 1
            money_saved += amount

    return {
        "totalTransactions": total_transactions,
        "flaggedCount": flagged_count,
        "blockedCount": blocked_count,
        "moneySaved": money_saved,
        "safeCount": safe_count
    }