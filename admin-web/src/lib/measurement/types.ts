/**
 * VINGT-TROIS — AI BODY MEASUREMENT ENGINE
 * Core Domain Types & Biometric Interfaces
 */

export type GenderProfile = 'mens' | 'womens' | 'unisex';
export type GarmentType = 'shirt' | 'blazer' | 'pant' | 'suit';
export type FitPreference = 'slim' | 'regular' | 'relaxed';
export type ActiveCaptureView = 'front' | 'side' | 'back';

export interface CustomerProfile {
  heightCm: number;
  gender: GenderProfile;
  garmentType: GarmentType;
  fitPreference: FitPreference;
  weightKg?: number;
  ageRange?: string;
}

export interface QualityCheckResult {
  passed: boolean;
  score: number; // 0.0 to 1.0
  reasons: string[];
  checks: {
    personDetected: boolean;
    headVisible: boolean;
    feetVisible: boolean;
    armsProperlyPositioned: boolean;
    tiltAngleDegrees: number;
    distanceAdequate: boolean;
    lightingQuality: 'good' | 'fair' | 'poor';
  };
}

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface CapturedViewData {
  view: ActiveCaptureView;
  imageBlob?: Blob;
  imageDataUrl?: string;
  landmarks: LandmarkPoint[];
  worldLandmarks?: LandmarkPoint[];
  aspectWidth: number;
  aspectHeight: number;
  scaleCmPerPixel: number;
  pixelHeight: number;
  quality: QualityCheckResult;
}

export interface BodyMeasurementsCm {
  // General
  height: number;
  shoulderWidth: number;
  crossBackWidth?: number;
  backLength?: number;
  neckCircumference: number;

  // Upper Body
  chestCircumference: number;
  upperChestCircumference?: number;
  waistCircumference: number;
  abdomenCircumference?: number;
  hipCircumference: number;
  bicepCircumference: number;
  wristCircumference: number;
  sleeveLength: number;
  jacketLength?: number;

  // Lower Body
  thighCircumference: number;
  kneeCircumference: number;
  calfCircumference: number;
  ankleCircumference: number;
  inseam: number;
  outseam: number;

  // Posture & Balance
  shoulderSlopeDegrees: number;
  shoulderAsymmetryDegrees: number;
  forwardHeadAngleDegrees: number;
}

export interface MeasurementConfidence {
  overall: number; // 0.0 to 1.0
  breakdown: Partial<Record<keyof BodyMeasurementsCm, number>>;
  frontSideConsistencyScore: number;
  scaleReliabilityScore: number;
}

export interface GarmentFitCalculation {
  garmentType: GarmentType;
  fitPreference: FitPreference;
  bodyMeasurements: BodyMeasurementsCm;
  easeAllowancesCm: Partial<Record<keyof BodyMeasurementsCm, number>>;
  finishedGarmentMeasurementsCm: Partial<Record<keyof BodyMeasurementsCm, number>>;
}

export interface MeasurementAnalysisResult {
  sessionId: string;
  timestamp: string;
  profile: CustomerProfile;
  frontView: CapturedViewData;
  sideView: CapturedViewData;
  backView?: CapturedViewData | null;
  bodyMeasurements: BodyMeasurementsCm;
  confidence: MeasurementConfidence;
  garmentFit: GarmentFitCalculation;
  isCalibrated: boolean;
  requiresTailorReview: boolean;
}
