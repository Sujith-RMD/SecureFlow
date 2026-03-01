from models import FrictionConfig

def map_friction(score: int):

    if score <= 20:
        return (
            "LOW",
            "ALLOW",
            FrictionConfig(
                type="NONE",
                delaySeconds=0,
                canOverride=True,
                color="green"
            )
        )

    elif score <= 45:
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

    elif score <= 65:
        return (
            "MEDIUM",
            "WARN",
            FrictionConfig(
                type="DELAY",
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