// Canned caveat strings — appended to ModeResult.caveats for honesty in the UI.

export const CAVEATS = {
  ebikeRoutingApprox:
    "E-bike routing reuses the bicycle profile (no router offers a native e-bike). " +
    "Distance is identical; duration is scaled down by 30% to reflect typical e-bike commute speeds.",
  drivingNoTraffic:
    "Driving time is a free-flow estimate based on speed limits — it does not account for live traffic.",
  walkingLongRoute:
    "Routes longer than a few hours of walking are shown for comparison but unlikely to be practical.",
  activityEstimate:
    "Active minutes count moderate-or-greater movement (≥3 METs). The ~11% lower risk of early " +
    "death refers to regularly reaching the 150-minutes-per-week guideline — not to a single trip.",
  ebikeLighter:
    "E-bike pedalling still clears the moderate-activity threshold, but at a lighter intensity " +
    "than an analog bike — its minutes count, with that caveat.",
  evGridFallback:
    "EV pollution uses the US national-average grid intensity because no state is selected in Settings.",
  pollutionFootnote:
    "Pollution shown is operational only — what the trip emits into the air you breathe. Active modes " +
    "are ~zero. The lifecycle carbon of the extra food calories (~2.2 g CO₂e/kcal) is excluded here; see About.",
};
