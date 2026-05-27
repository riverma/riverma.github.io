// Canned caveat strings — appended to ModeResult.caveats for honesty in the UI.

export const CAVEATS = {
  ebikeRoutingApprox:
    "E-bike routing reuses the bicycle profile (no router offers a native e-bike). " +
    "Distance is identical; duration is scaled down by 30% to reflect typical e-bike commute speeds.",
  drivingNoTraffic:
    "Driving time is a free-flow estimate based on speed limits — it does not account for live traffic.",
  walkingLongRoute:
    "Routes longer than a few hours of walking are shown for comparison but unlikely to be practical.",
  healthEstimate:
    "Health benefit is a simplified per-trip share of the WHO HEAT methodology, scaled by your assumed trip frequency. " +
    "It estimates monetized mortality-risk reduction if this trip is part of a regular pattern.",
  evGridFallback:
    "EV CO₂ uses the US national-average grid intensity because no state is selected in Settings.",
  carbonFromFood:
    "Active-mode CO₂ counts the lifecycle carbon of the extra food calories required, " +
    "using a global-average diet figure (~2.2 g CO₂e/kcal). Lower-impact diets reduce this proportionally.",
};
