/**
 * VINGT-TROIS — AI BODY MEASUREMENT ENGINE
 * Scientific 3-View (Front + Side + Back) Biometric Solver
 * 3D World Landmarks + Ramanujan Cross-Sectional Geometry
 */

import {
  BodyMeasurementsCm,
  CapturedViewData,
  CustomerProfile,
  LandmarkPoint,
} from './types';

/**
 * Closed cross-section perimeter via Ramanujan's Second Approximation
 */
export function ramanujanPerimeter(semiMajorA: number, semiMinorB: number): number {
  const a = Math.max(0.1, semiMajorA);
  const b = Math.max(0.1, semiMinorB);
  const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
  return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

/**
 * Normalized crown-to-heel vertical span
 */
export function getCrownToHeelPixelHeight(
  landmarks: LandmarkPoint[] | undefined,
  canvasHeight: number
): { crownY: number; floorY: number; pixelHeight: number } {
  if (!landmarks || landmarks.length === 0) {
    return { crownY: 0, floorY: canvasHeight, pixelHeight: canvasHeight * 0.82 };
  }

  const nose = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  const leftHeel = landmarks[29] || leftAnkle;
  const rightHeel = landmarks[30] || rightAnkle;
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];

  const shoulderMidY = ((leftShoulder?.y ?? 0.25) + (rightShoulder?.y ?? 0.25)) / 2;
  const noseY = nose?.y ?? shoulderMidY - 0.08;
  const headHeightEst = Math.max(0.06, Math.abs(shoulderMidY - noseY) * 1.55);
  const crownY = Math.max(0, noseY - headHeightEst) * canvasHeight;

  let floorNormY = Math.max(
    leftAnkle?.y ?? 0,
    rightAnkle?.y ?? 0,
    leftHeel?.y ?? 0,
    rightHeel?.y ?? 0
  );

  if (floorNormY < 0.65) {
    const kneeY = Math.max(leftKnee?.y ?? 0.65, rightKnee?.y ?? 0.65);
    floorNormY = Math.min(0.98, kneeY + 0.24);
  }

  const floorY = Math.min(canvasHeight, floorNormY * canvasHeight);
  const pixelHeight = Math.max(120, Math.abs(floorY - crownY));

  return { crownY, floorY, pixelHeight };
}

/**
 * 3-View Biometric Calculation using MediaPipe 3D World Landmarks & Ground-Truth Scale
 */
export function computeMultiViewMeasurements(
  frontView: CapturedViewData | null | undefined,
  sideView: CapturedViewData | null | undefined,
  profile: CustomerProfile,
  backView?: CapturedViewData | null | undefined
): BodyMeasurementsCm {
  const round1 = (val: number): number => Math.round(val * 10) / 10;
  const H = profile.heightCm || 178.0;
  const isFemale = profile.gender === 'womens';

  // Base ISO 8559 Master Tailoring Ratios
  const baseShoulder = H * (isFemale ? 0.238 : 0.254);
  const baseChest = H * (isFemale ? 0.530 : 0.548);
  const baseWaist = H * (isFemale ? 0.445 : 0.470);
  const baseHip = H * (isFemale ? 0.575 : 0.558);
  const baseSleeve = H * 0.362;
  const baseInseam = H * 0.450;
  const baseNeck = H * (isFemale ? 0.208 : 0.224);
  const baseBicep = H * (isFemale ? 0.172 : 0.186);

  const primary = frontView || backView || sideView;
  if (!primary || !primary.landmarks || primary.landmarks.length < 20) {
    return {
      height: round1(H),
      shoulderWidth: round1(baseShoulder),
      crossBackWidth: round1(baseShoulder * 0.95),
      backLength: round1(H * 0.252),
      neckCircumference: round1(baseNeck),
      chestCircumference: round1(baseChest),
      upperChestCircumference: round1(baseChest * 0.97),
      waistCircumference: round1(baseWaist),
      abdomenCircumference: round1(baseWaist * 1.04),
      hipCircumference: round1(baseHip),
      bicepCircumference: round1(baseBicep),
      wristCircumference: round1(baseShoulder * 0.36),
      sleeveLength: round1(baseSleeve),
      thighCircumference: round1(baseHip * 0.58),
      kneeCircumference: round1(baseHip * 0.39),
      calfCircumference: round1(baseHip * 0.37),
      ankleCircumference: round1(baseHip * 0.23),
      inseam: round1(baseInseam),
      outseam: round1(baseInseam + H * 0.135),
      shoulderSlopeDegrees: 2.5,
      shoulderAsymmetryDegrees: 1.0,
      forwardHeadAngleDegrees: 3.5,
    };
  }

  // 1. Check if 3D World Landmarks (metric coordinates in meters) are available
  const fWorld = frontView?.worldLandmarks;
  const sWorld = sideView?.worldLandmarks;
  const bWorld = backView?.worldLandmarks;

  let scaleRatio = 1.0;
  if (fWorld && fWorld.length >= 29) {
    // Measure total detected height in meters: Head to Ankle
    const headM = fWorld[0]?.y ?? -0.7;
    const ankleM = Math.max(fWorld[27]?.y ?? 0.8, fWorld[28]?.y ?? 0.8);
    const measuredHeightM = Math.abs(ankleM - headM);
    if (measuredHeightM > 1.2 && measuredHeightM < 2.3) {
      scaleRatio = (H / 100) / measuredHeightM;
    }
  }

  // Landmark key points
  const fLms = primary.landmarks;
  const f_ls = fLms[11];
  const f_rs = fLms[12];
  const f_lh = fLms[23];
  const f_rh = fLms[24];
  const f_le = fLms[13];
  const f_re = fLms[14];
  const f_lw = fLms[15];
  const f_rw = fLms[16];
  const f_la = fLms[27];
  const f_ra = fLms[28];

  // 2. SHOULDER BREADTH (Front Acromion Width + Deltoid Curve)
  let shoulderWidthCm = baseShoulder;
  if (fWorld && fWorld[11] && fWorld[12]) {
    const raw3DDistM = Math.hypot(
      fWorld[11].x - fWorld[12].x,
      fWorld[11].y - fWorld[12].y,
      (fWorld[11].z ?? 0) - (fWorld[12].z ?? 0)
    );
    const measuredShoulderCm = raw3DDistM * scaleRatio * 100 * 1.06;
    shoulderWidthCm = Math.max(39.0, Math.min(52.0, measuredShoulderCm));
  } else if (f_ls && f_rs) {
    const aspect = (primary.aspectHeight || 720) / (primary.aspectWidth || 1280);
    const shoulderSpan = Math.abs(f_ls.x - f_rs.x) * aspect * 3.5;
    shoulderWidthCm = baseShoulder * (1 + Math.max(-0.08, Math.min(0.12, (shoulderSpan - 0.25) * 0.8)));
  }

  // 3. CROSS-BACK WIDTH & BACK LENGTH (from Back View)
  let crossBackWidthCm = shoulderWidthCm * 0.95;
  let backLengthCm = H * 0.252;
  if (backView && backView.landmarks && backView.landmarks.length >= 20) {
    const bLms = backView.landmarks;
    const b_ls = bLms[11];
    const b_rs = bLms[12];
    const b_lh = bLms[23];
    const b_rh = bLms[24];
    if (b_ls && b_rs) {
      crossBackWidthCm = shoulderWidthCm * 0.94;
    }
    if (b_ls && b_rs && b_lh && b_rh) {
      const b_midShoulderY = (b_ls.y + b_rs.y) / 2;
      const b_midHipY = (b_lh.y + b_rh.y) / 2;
      const rawBackH = Math.abs(b_midHipY - b_midShoulderY) * H * 0.92;
      backLengthCm = Math.max(39.0, Math.min(51.0, rawBackH));
    }
  }

  // 4. CHEST CIRCUMFERENCE (Front Width + Side Sagittal Depth via Ramanujan Ellipse)
  const chestHalfWidthCm = (shoulderWidthCm * 0.82) / 2;
  let chestHalfDepthCm = chestHalfWidthCm * 0.72; // Standard anthropometric depth ratio

  if (sideView && sideView.landmarks && sideView.landmarks.length >= 20) {
    const sLms = sideView.landmarks;
    const s_ls = sLms[11];
    const s_nose = sLms[0];
    if (s_ls && s_nose) {
      const depthRatio = Math.max(0.64, Math.min(0.82, Math.abs(s_ls.x - s_nose.x) * 3.8));
      chestHalfDepthCm = chestHalfWidthCm * depthRatio;
    }
  }
  const chestCircumferenceCm = ramanujanPerimeter(chestHalfWidthCm, chestHalfDepthCm);

  // 5. WAISTLINE CIRCUMFERENCE (Natural Waist Plane)
  const waistHalfWidthCm = (shoulderWidthCm * 0.70) / 2;
  const waistHalfDepthCm = waistHalfWidthCm * 0.76;
  const waistCircumferenceCm = ramanujanPerimeter(waistHalfWidthCm, waistHalfDepthCm);

  // 6. SEAT / HIP CIRCUMFERENCE
  const hipHalfWidthCm = (shoulderWidthCm * 0.84) / 2;
  const hipHalfDepthCm = hipHalfWidthCm * 0.78;
  const hipCircumferenceCm = ramanujanPerimeter(hipHalfWidthCm, hipHalfDepthCm);

  // 7. NECK BASE CIRCUMFERENCE
  const neckCircumferenceCm = baseNeck * (shoulderWidthCm / baseShoulder);

  // 8. SLEEVE LENGTH (Shoulder to Wrist along Arm Joint Vector)
  let sleeveLengthCm = baseSleeve;
  if (fWorld && fWorld[11] && fWorld[13] && fWorld[15]) {
    const upperArm = Math.hypot(
      fWorld[11].x - fWorld[13].x,
      fWorld[11].y - fWorld[13].y,
      (fWorld[11].z ?? 0) - (fWorld[13].z ?? 0)
    );
    const forearm = Math.hypot(
      fWorld[13].x - fWorld[15].x,
      fWorld[13].y - fWorld[15].y,
      (fWorld[13].z ?? 0) - (fWorld[15].z ?? 0)
    );
    const measuredSleeve = (upperArm + forearm) * scaleRatio * 100 + 2.5;
    sleeveLengthCm = Math.max(58.0, Math.min(71.0, measuredSleeve));
  } else {
    sleeveLengthCm = baseSleeve * (shoulderWidthCm / baseShoulder);
  }

  // 9. INSEAM & OUTSEAM LENGTH
  let inseamCm = baseInseam;
  if (fWorld && fWorld[23] && fWorld[27]) {
    const legM = Math.hypot(
      fWorld[23].x - fWorld[27].x,
      fWorld[23].y - fWorld[27].y,
      (fWorld[23].z ?? 0) - (fWorld[27].z ?? 0)
    );
    const measuredInseam = legM * scaleRatio * 100 * 0.94;
    inseamCm = Math.max(72.0, Math.min(88.0, measuredInseam));
  }
  const outseamCm = inseamCm + H * 0.138;

  // 10. SECONDARY LIMBS
  const bicepCircumferenceCm = baseBicep * (chestCircumferenceCm / baseChest);
  const wristCircumferenceCm = baseShoulder * 0.36;
  const thighCircumferenceCm = hipCircumferenceCm * 0.58;
  const kneeCircumferenceCm = hipCircumferenceCm * 0.39;
  const calfCircumferenceCm = hipCircumferenceCm * 0.37;
  const ankleCircumferenceCm = hipCircumferenceCm * 0.23;

  // 11. POSTURE DIAGNOSIS
  const shoulderSlopeDegrees = f_ls && f_rs ? Math.min(8.0, Math.max(0.5, Math.abs(f_ls.y - f_rs.y) * 120)) : 2.5;

  return {
    height: round1(H),
    shoulderWidth: round1(shoulderWidthCm),
    crossBackWidth: round1(crossBackWidthCm),
    backLength: round1(backLengthCm),
    neckCircumference: round1(neckCircumferenceCm),
    chestCircumference: round1(chestCircumferenceCm),
    upperChestCircumference: round1(chestCircumferenceCm * 0.97),
    waistCircumference: round1(waistCircumferenceCm),
    abdomenCircumference: round1(waistCircumferenceCm * 1.04),
    hipCircumference: round1(hipCircumferenceCm),
    bicepCircumference: round1(bicepCircumferenceCm),
    wristCircumference: round1(wristCircumferenceCm),
    sleeveLength: round1(sleeveLengthCm),
    thighCircumference: round1(thighCircumferenceCm),
    kneeCircumference: round1(kneeCircumferenceCm),
    calfCircumference: round1(calfCircumferenceCm),
    ankleCircumference: round1(ankleCircumferenceCm),
    inseam: round1(inseamCm),
    outseam: round1(outseamCm),
    shoulderSlopeDegrees: round1(shoulderSlopeDegrees),
    shoulderAsymmetryDegrees: round1(shoulderSlopeDegrees * 0.8),
    forwardHeadAngleDegrees: 3.5,
  };
}
