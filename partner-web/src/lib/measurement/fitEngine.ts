/**
 * VINGT-TROIS — AI BODY MEASUREMENT ENGINE
 * Garment Fit & Tailoring Ease Engine
 */

import {
  BodyMeasurementsCm,
  CustomerProfile,
  FitPreference,
  GarmentFitCalculation,
  GarmentType,
} from './types';

export interface EaseTable {
  chest: number;
  waist: number;
  hip: number;
  neck: number;
  bicep: number;
  wrist: number;
  thigh: number;
  knee: number;
  shoulder: number;
}

const EASE_RULES: Record<GarmentType, Record<FitPreference, EaseTable>> = {
  shirt: {
    slim: { chest: 6.0, waist: 6.0, hip: 6.0, neck: 1.5, bicep: 3.5, wrist: 3.0, thigh: 0, knee: 0, shoulder: 0.5 },
    regular: { chest: 10.0, waist: 10.0, hip: 10.0, neck: 2.0, bicep: 5.5, wrist: 4.0, thigh: 0, knee: 0, shoulder: 1.0 },
    relaxed: { chest: 14.0, waist: 14.0, hip: 14.0, neck: 2.5, bicep: 7.5, wrist: 5.0, thigh: 0, knee: 0, shoulder: 1.5 },
  },
  blazer: {
    slim: { chest: 8.0, waist: 8.0, hip: 7.0, neck: 2.0, bicep: 4.5, wrist: 3.5, thigh: 0, knee: 0, shoulder: 1.2 },
    regular: { chest: 12.0, waist: 12.0, hip: 10.0, neck: 2.5, bicep: 6.5, wrist: 4.5, thigh: 0, knee: 0, shoulder: 1.8 },
    relaxed: { chest: 16.0, waist: 16.0, hip: 14.0, neck: 3.0, bicep: 8.5, wrist: 5.5, thigh: 0, knee: 0, shoulder: 2.4 },
  },
  pant: {
    slim: { chest: 0, waist: 2.0, hip: 4.0, neck: 0, bicep: 0, wrist: 0, thigh: 4.0, knee: 3.0, shoulder: 0 },
    regular: { chest: 0, waist: 3.0, hip: 6.0, neck: 0, bicep: 0, wrist: 0, thigh: 6.0, knee: 5.0, shoulder: 0 },
    relaxed: { chest: 0, waist: 4.0, hip: 8.0, neck: 0, bicep: 0, wrist: 0, thigh: 8.0, knee: 7.0, shoulder: 0 },
  },
  suit: {
    slim: { chest: 8.0, waist: 8.0, hip: 7.0, neck: 2.0, bicep: 4.5, wrist: 3.5, thigh: 4.0, knee: 3.0, shoulder: 1.2 },
    regular: { chest: 12.0, waist: 12.0, hip: 10.0, neck: 2.5, bicep: 6.5, wrist: 4.5, thigh: 6.0, knee: 5.0, shoulder: 1.8 },
    relaxed: { chest: 16.0, waist: 16.0, hip: 14.0, neck: 3.0, bicep: 8.5, wrist: 5.5, thigh: 8.0, knee: 7.0, shoulder: 2.4 },
  },
};

export function calculateGarmentFit(
  body: BodyMeasurementsCm,
  profile: CustomerProfile
): GarmentFitCalculation {
  const gType = profile.garmentType || 'shirt';
  const fPref = profile.fitPreference || 'regular';
  const ease = EASE_RULES[gType]?.[fPref] || EASE_RULES.shirt.regular;

  const finished: Partial<Record<keyof BodyMeasurementsCm, number>> = {
    height: body.height,
    shoulderWidth: Number((body.shoulderWidth + ease.shoulder).toFixed(1)),
    neckCircumference: Number((body.neckCircumference + ease.neck).toFixed(1)),
    chestCircumference: Number((body.chestCircumference + ease.chest).toFixed(1)),
    waistCircumference: Number((body.waistCircumference + ease.waist).toFixed(1)),
    hipCircumference: Number((body.hipCircumference + ease.hip).toFixed(1)),
    bicepCircumference: Number((body.bicepCircumference + ease.bicep).toFixed(1)),
    wristCircumference: Number((body.wristCircumference + ease.wrist).toFixed(1)),
    sleeveLength: Number(body.sleeveLength.toFixed(1)),
    inseam: Number(body.inseam.toFixed(1)),
    outseam: Number(body.outseam.toFixed(1)),
    thighCircumference: Number((body.thighCircumference + ease.thigh).toFixed(1)),
    kneeCircumference: Number((body.kneeCircumference + ease.knee).toFixed(1)),
  };

  const easeAllowances: Partial<Record<keyof BodyMeasurementsCm, number>> = {
    chestCircumference: ease.chest,
    waistCircumference: ease.waist,
    hipCircumference: ease.hip,
    neckCircumference: ease.neck,
    shoulderWidth: ease.shoulder,
    bicepCircumference: ease.bicep,
    wristCircumference: ease.wrist,
    thighCircumference: ease.thigh,
    kneeCircumference: ease.knee,
  };

  return {
    garmentType: gType,
    fitPreference: fPref,
    bodyMeasurements: body,
    easeAllowancesCm: easeAllowances,
    finishedGarmentMeasurementsCm: finished,
  };
}
