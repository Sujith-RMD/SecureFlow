from models import FrictionConfig

def map_friction(score: int):

    if score <= 30:
        return (
            "LOW",
            "ALLOW",
            FrictionConfig(
                type="TOAST",
                delaySeconds=0,
                canOverride=True,
                color="green"
            )
        )

    elif score <= 60:
        return (
            "MEDIUM",
            "WARN",
            FrictionConfig(
                type="MODAL",
                delaySeconds=5,
                canOverride=True,
                color="yellow"
            )
        )

    else:
        return (
            "HIGH",
            "BLOCK",
            FrictionConfig(
                type="BLOCK",
                delaySeconds=10,
                canOverride=False,
                color="red"
            )
        )