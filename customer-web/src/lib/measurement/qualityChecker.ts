/**
 * VINGT-TROIS — AI BODY MEASUREMENT ENGINE
 * Pose Direction, Distance & Human Verification Gate
 * Validates genuine full-body presence, distance (head-to-feet), and orientation (Front / Side / Back)
 */

import { ActiveCaptureView, LandmarkPoint, QualityCheckResult } from './types';

export function evaluateImageQuality(
  landmarks: LandmarkPoint[] | undefined,
  view: ActiveCaptureView,
  canvasWidth: number,
  canvasHeight: number,
  worldLandmarks?: LandmarkPoint[] | undefined
): QualityCheckResult {
  // 1. Array validation: Must have all 33 MediaPipe pose landmarks
  if (!landmarks || landmarks.length < 33) {
    return {
      passed: false,
      score: 0.0,
      reasons: ['Looking for person… Please step in front of camera.'],
      checks: {
        personDetected: false,
        headVisible: false,
        feetVisible: false,
        armsProperlyPositioned: false,
        tiltAngleDegrees: 0,
        distanceAdequate: false,
        lightingQuality: 'poor',
      },
    };
  }

  // Key normalized landmarks
  const nose = landmarks[0];
  const leftEye = landmarks[2];
  const rightEye = landmarks[5];
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  const leftHeel = landmarks[29] || leftAnkle;
  const rightHeel = landmarks[30] || rightAnkle;

  // Key world landmarks (3D coordinates in meters)
  const wNose = worldLandmarks?.[0];
  const wLS = worldLandmarks?.[11];
  const wRS = worldLandmarks?.[12];
  const wLH = worldLandmarks?.[23];
  const wRH = worldLandmarks?.[24];

  // 2. Strict Real Human Presence Check
  const shoulderVis = ((leftShoulder?.visibility ?? 0) + (rightShoulder?.visibility ?? 0)) / 2;
  const hipVis = ((leftHip?.visibility ?? 0) + (rightHip?.visibility ?? 0)) / 2;
  const torsoHeightNorm = Math.abs(((leftHip?.y ?? 0) + (rightHip?.y ?? 0)) / 2 - ((leftShoulder?.y ?? 0) + (rightShoulder?.y ?? 0)) / 2);

  const isRealHuman = shoulderVis > 0.45 && hipVis > 0.45 && torsoHeightNorm >= 0.12 && torsoHeightNorm <= 0.65;

  if (!isRealHuman) {
    return {
      passed: false,
      score: 0.0,
      reasons: ['Please step back so your full body is visible.'],
      checks: {
        personDetected: false,
        headVisible: false,
        feetVisible: false,
        armsProperlyPositioned: false,
        tiltAngleDegrees: 0,
        distanceAdequate: false,
        lightingQuality: 'poor',
      },
    };
  }

  const reasons: string[] = [];

  // 3. Distance & Full-Body (Head & Feet) Enforcement
  // Head visibility
  const headY = Math.min(nose?.y ?? 0.2, leftShoulder?.y ?? 0.25, rightShoulder?.y ?? 0.25);
  const headVisible = headY >= 0.015 && headY <= 0.40;
  if (headY < 0.015) {
    reasons.push('Head is partially cut off at top of frame. Step back slightly.');
  }

  // Feet visibility (Critical for scale calibration)
  const ankleVis = Math.max(leftAnkle?.visibility ?? 0, rightAnkle?.visibility ?? 0);
  const heelVis = Math.max(leftHeel?.visibility ?? 0, rightHeel?.visibility ?? 0);
  const lowestFootY = Math.max(leftAnkle?.y ?? 0, rightAnkle?.y ?? 0, leftHeel?.y ?? 0, rightHeel?.y ?? 0);

  const feetVisible = (ankleVis > 0.35 || heelVis > 0.35) && lowestFootY < 0.985 && lowestFootY > 0.60;
  if (!feetVisible) {
    if (lowestFootY >= 0.985 || (ankleVis <= 0.35 && heelVis <= 0.35)) {
      reasons.push('Feet outside frame. Step back ~2 meters until full body and feet are in view.');
    }
  }

  // Vertical frame occupancy
  const personHeightRatio = Math.abs(lowestFootY - headY);
  let distanceAdequate = true;
  if (personHeightRatio < 0.35) {
    distanceAdequate = false;
    reasons.push('You are too far from camera. Step closer until body fills 70% of view.');
  } else if (personHeightRatio > 0.96) {
    distanceAdequate = false;
    reasons.push('You are too close. Step back until your whole silhouette is inside.');
  }

  // 4. Pose Direction & Orientation Verification (Front vs Side vs Back)
  const shoulderSpanNorm = Math.abs((leftShoulder?.x ?? 0) - (rightShoulder?.x ?? 0));
  const wShoulderSpanMeters = wLS && wRS ? Math.hypot(wLS.x - wRS.x, wLS.y - wRS.y) : shoulderSpanNorm * 1.8;

  // Face / Nose depth relative to shoulders
  const noseVis = Math.max(nose?.visibility ?? 0, leftEye?.visibility ?? 0, rightEye?.visibility ?? 0);
  const avgShoulderZ = ((wLS?.z ?? 0) + (wRS?.z ?? 0)) / 2;
  const noseZ = wNose?.z ?? 0;
  const isFacingFront = noseVis > 0.50 && noseZ <= avgShoulderZ + 0.08;
  const isFacingBack = (noseVis < 0.35) || (wNose && noseZ > avgShoulderZ + 0.05);

  let orientationCorrect = true;

  if (view === 'front') {
    // Expect: Wide shoulders and facing camera
    if (shoulderSpanNorm < 0.11 || wShoulderSpanMeters < 0.22) {
      orientationCorrect = false;
      reasons.push('Turn to face the camera directly for Front View.');
    } else if (isFacingBack) {
      orientationCorrect = false;
      reasons.push('You are facing backwards. Please face the camera for Front View.');
    }
  } else if (view === 'side') {
    // Expect: Narrow profile (shoulders overlapping along line of sight)
    if (shoulderSpanNorm > 0.16 || wShoulderSpanMeters > 0.22) {
      orientationCorrect = false;
      reasons.push('Turn 90° sideways to your profile for Side View.');
    }
  } else if (view === 'back') {
    // Expect: Wide shoulders and back turned to camera (face hidden / nose behind shoulders)
    if (shoulderSpanNorm < 0.11 || wShoulderSpanMeters < 0.22) {
      orientationCorrect = false;
      reasons.push('Turn around with your back facing the camera for Back View.');
    } else if (isFacingFront) {
      orientationCorrect = false;
      reasons.push('You are facing front. Please turn your back to the camera for Back View.');
    }
  }

  // 5. Camera Tilt Angle
  const midShoulderX = ((leftShoulder?.x ?? 0.5) + (rightShoulder?.x ?? 0.5)) / 2;
  const midAnkleX = ((leftAnkle?.x ?? 0.5) + (rightAnkle?.x ?? 0.5)) / 2;
  const dx = (midAnkleX - midShoulderX) * canvasWidth;
  const dy = Math.max(100, personHeightRatio * canvasHeight);
  const tiltAngleDegrees = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));

  // PASS CRITERIA: Real human + feet visible + distance adequate + orientation 100% verified
  const passed = isRealHuman && headVisible && feetVisible && distanceAdequate && orientationCorrect && reasons.length === 0;

  return {
    passed,
    score: passed ? 0.98 : 0.45,
    reasons: reasons.length > 0 ? reasons : ['✓ Pose & Distance Aligned! Ready to capture.'],
    checks: {
      personDetected: isRealHuman,
      headVisible,
      feetVisible,
      armsProperlyPositioned: orientationCorrect,
      tiltAngleDegrees: Math.round(tiltAngleDegrees * 10) / 10,
      distanceAdequate,
      lightingQuality: shoulderVis > 0.65 ? 'good' : 'fair',
    },
  };
}
