from pydantic import BaseModel, field_validator
from typing import List, Optional


class AnalyzeRequest(BaseModel):
    recipientUPI: str
    amount: float
    remarks: str = ""

    @field_validator("recipientUPI")
    @classmethod
    def upi_must_have_at(cls, v: str) -> str:
        if "@" not in v:
            raise ValueError("UPI ID must contain '@'")
        return v.strip()

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v


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
    analysisTimeMs: Optional[float] = None
    rulesEvaluated: Optional[int] = None