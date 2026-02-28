from pydantic import BaseModel
from typing import List, Optional


class AnalyzeRequest(BaseModel):
    recipientUPI: str
    amount: float
    remarks: str


class RiskReason(BaseModel):
    ruleId: str
    title: str
    description: str
    severity: str
    scoreAdded: int
    contributionPercent: Optional[float] = None


class FrictionConfig(BaseModel):
    type: str
    delaySeconds: int
    canOverride: bool
    color: str


class RiskResult(BaseModel):
    score: int
    level: str
    reasons: List[RiskReason]
    recommendedAction: str
    friction: FrictionConfig