// Unit conversion + display formatters. Internal math stays canonical (meters, seconds, kg, USD);
// only the UI converts to imperial when settings.units === 'imperial'.

import { M_PER_MI, KG_PER_LB } from '../data/constants.js';

export const metersToMiles = (m) => m / M_PER_MI;
export const milesToMeters = (mi) => mi * M_PER_MI;
export const kgToLb = (kg) => kg / KG_PER_LB;
export const lbToKg = (lb) => lb * KG_PER_LB;

export function formatDistance(meters, units = 'imperial') {
  if (units === 'metric') {
    return meters >= 1000
      ? `${(meters / 1000).toFixed(1)} km`
      : `${Math.round(meters)} m`;
  }
  const mi = metersToMiles(meters);
  return mi >= 0.1 ? `${mi.toFixed(1)} mi` : `${Math.round(mi * 5280)} ft`;
}

export function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m} min`;
  if (h < 24) return m === 0 ? `${h} h` : `${h} h ${m} min`;
  const d = Math.floor(h / 24);
  return `${d} d ${h % 24} h`;
}

export function formatUsd(value) {
  if (value === 0) return 'free';
  if (Math.abs(value) < 0.01) return '<$0.01';
  if (Math.abs(value) < 10) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(0)}`;
}

export function formatKg(kg) {
  if (kg === 0) return '0 kg';
  if (Math.abs(kg) < 0.01) return '<0.01 kg';
  if (Math.abs(kg) < 1) return `${kg.toFixed(2)} kg`;
  return `${kg.toFixed(1)} kg`;
}

export function formatCalories(kcal) {
  return `${Math.round(kcal)} kcal`;
}
