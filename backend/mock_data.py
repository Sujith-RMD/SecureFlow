from datetime import datetime, timedelta

def get_mock_history():

    now = datetime.utcnow()

    return [
        {
            "recipientUPI": "rahul@upi",
            "amount": 500,
            "timestamp": (now - timedelta(minutes=30)).isoformat(),
            "riskResult": {
                "level": "LOW",
                "recommendedAction": "ALLOW"
            }
        },
        {
            "recipientUPI": "newperson@upi",
            "amount": 8000,
            "timestamp": (now - timedelta(hours=1)).isoformat(),
            "riskResult": {
                "level": "MEDIUM",
                "recommendedAction": "WARN"
            }
        },
        {
            "recipientUPI": "claim.prize@upi",
            "amount": 50000,
            "timestamp": (now - timedelta(days=1)).isoformat(),
            "riskResult": {
                "level": "HIGH",
                "recommendedAction": "BLOCK"
            }
        }
    ]