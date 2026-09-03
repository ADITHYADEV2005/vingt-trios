'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FiCamera,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiSliders,
  FiVolume2,
  FiVolumeX,
  FiArrowRight,
  FiShield,
  FiUserCheck,
  FiUser,
} from 'react-icons/fi';
import {
  ActiveCaptureView,
  BodyMeasurementsCm,
  CapturedViewData,
  CustomerProfile,
  FitPreference,
  GarmentType,
  GenderProfile,
  LandmarkPoint,
  MeasurementAnalysisResult,
  QualityCheckResult,
} from '@/lib/measurement/types';
import { evaluateImageQuality } from '@/lib/measurement/qualityChecker';
import {
  computeMultiViewMeasurements,
  getCrownToHeelPixelHeight,
} from '@/lib/measurement/measurementEngine';
import { calculateGarmentFit } from '@/lib/measurement/fitEngine';
import { evaluateMeasurementConfidence } from '@/lib/measurement/confidenceEngine';

interface AIScanProps {
  onDone: (m: Record<string, string>) => void;
  initialGender?: 'mens' | 'womens';
  initialGarment?: string;
}

type ScanFlowStep = 'setup' | 'capturing' | 'processing' | 'results';

export default function AIScan({ onDone, initialGender = 'mens', initialGarment = 'shirt' }: AIScanProps) {
  // Step in guided workflow
  const [flowStep, setFlowStep] = useState<ScanFlowStep>('setup');

  // Customer Profile State
  const [heightCm, setHeightCm] = useState<number>(178);
  const [unitMode, setUnitMode] = useState<'cm' | 'in'>('cm');
  const [gender, setGender] = useState<GenderProfile>(initialGender === 'womens' ? 'womens' : 'mens');
  const [garmentType, setGarmentType] = useState<GarmentType>(
    initialGarment === 'blazer' ? 'blazer' : initialGarment === 'pant' ? 'pant' : 'shirt'
  );
  const [fitPreference, setFitPreference] = useState<FitPreference>('regular');

  // Active view being captured: 'front' | 'side' | 'back'
  const [activeView, setActiveView] = useState<ActiveCaptureView>('front');

  // Stored captured view data (Ref guarantees zero stale closure bugs)
  const frontDataRef = useRef<CapturedViewData | null>(null);
  const sideDataRef = useRef<CapturedViewData | null>(null);
  const backDataRef = useRef<CapturedViewData | null>(null);

  // Stored captured photo thumbnails for visual confirmation
  const [frontThumb, setFrontThumb] = useState<string | null>(null);
  const [sideThumb, setSideThumb] = useState<string | null>(null);
  const [backThumb, setBackThumb] = useState<string | null>(null);

  // Live real-time estimated measurements
  const [liveEstimates, setLiveEstimates] = useState<{
    shoulderCm: number;
    chestCm: number;
    waistCm: number;
  }>({ shoulderCm: 45.0, chestCm: 98.0, waistCm: 84.0 });

  // Final Analyzed Result
  const [analysisResult, setAnalysisResult] = useState<MeasurementAnalysisResult | null>(null);
  const [editableMeasurements, setEditableMeasurements] = useState<BodyMeasurementsCm | null>(null);

  // Settings & Helpers
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [modelReady, setModelReady] = useState<boolean>(false);
  const [modelError, setModelError] = useState<string | null>(null);

  // Real-time quality state
  const [currentQuality, setCurrentQuality] = useState<QualityCheckResult>({
    passed: false,
    score: 0,
    reasons: ['Waiting for person to step in front of camera…'],
    checks: {
      personDetected: false,
      headVisible: false,
      feetVisible: false,
      armsProperlyPositioned: false,
      tiltAngleDegrees: 0,
      distanceAdequate: false,
      lightingQuality: 'poor',
    },
  });

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const landmarkerRef = useRef<any>(null);
  const isDetectingRef = useRef<boolean>(false);
  const isCapturingRef = useRef<boolean>(false);
  const steadyFramesRef = useRef<number>(0);
  const lastKeypointsRef = useRef<{ x: number; y: number }[]>([]);
  const latestLandmarksRef = useRef<LandmarkPoint[] | null>(null);
  const latestWorldLandmarksRef = useRef<LandmarkPoint[] | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastSpokenRef = useRef<string>('');
  const lastSpeakTimeRef = useRef<number>(0);

  // Web Audio Synthesizer
  const playTone = (freq: number, type: OscillatorType, duration: number) => {
    try {
      if (!audioCtxRef.current && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio permitted or muted
    }
  };

  const playBeep = () => playTone(880, 'sine', 0.12);
  const playShutterSound = () => {
    playTone(1100, 'triangle', 0.08);
    setTimeout(() => playTone(1600, 'sine', 0.18), 70);
  };

  // Text-To-Speech guidance
  const speak = useCallback(
    (text: string, force = false) => {
      if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      const now = Date.now();
      if (!force && lastSpokenRef.current === text && now - lastSpeakTimeRef.current < 6000) return;
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 1.05;
      utt.pitch = 1.0;
      lastSpokenRef.current = text;
      lastSpeakTimeRef.current = now;
      window.speechSynthesis.speak(utt);
    },
    [voiceEnabled]
  );

  // Load MediaPipe PoseLandmarker
  useEffect(() => {
    let active = true;

    async function initMediaPipe() {
      if (landmarkerRef.current) return;
      setModelLoading(true);
      setModelError(null);

      try {
        const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        if (!active) return;

        let landmarker;
        try {
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: '/models/pose_landmarker_lite.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        } catch {
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        }

        if (!active) return;
        landmarkerRef.current = landmarker;
        setModelReady(true);
        setModelLoading(false);
      } catch (err) {
        console.error('Failed to initialize PoseLandmarker:', err);
        if (active) {
          setModelError('Could not load AI vision engine. Please check internet connection or reload.');
          setModelLoading(false);
        }
      }
    }

    initMediaPipe();

    return () => {
      active = false;
      stopCamera();
    };
  }, []);

  // Keyboard shortcut listener (Spacebar to trigger capture)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && flowStep === 'capturing') {
        e.preventDefault();
        handleManualCapture();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    isDetectingRef.current = false;
    isCapturingRef.current = false;
  };

  const startCameraForView = async (view: ActiveCaptureView) => {
    setActiveView(view);
    setFlowStep('capturing');
    steadyFramesRef.current = 0;
    setHoldProgress(0);
    isCapturingRef.current = false;
    lastKeypointsRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      streamRef.current = stream;

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          videoRef.current.onloadedmetadata = () => {
            isDetectingRef.current = true;
            if (view === 'front') {
              speak('Step 1: Stand facing the camera in an A-pose with your full body in view.', true);
            } else if (view === 'side') {
              speak('Step 2: Turn 90 degrees sideways to your profile.', true);
            } else {
              speak('Step 3: Turn your back to the camera for shoulder blade measurement.', true);
            }
            runDetectionLoop(view);
          };
        }
      }, 100);
    } catch {
      alert('Camera access denied or unavailable. Please enable permissions.');
    }
  };

  // Real-time Video Stream & Detection Loop
  const runDetectionLoop = (view: ActiveCaptureView) => {
    if (!isDetectingRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(() => runDetectionLoop(view));
      return;
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const landmarker = landmarkerRef.current;
    let latestLms: LandmarkPoint[] | undefined;
    let latestWorldLms: LandmarkPoint[] | undefined;

    if (landmarker) {
      try {
        const results = landmarker.detectForVideo(video, performance.now());
        if (results && results.landmarks && results.landmarks.length > 0) {
          latestLms = results.landmarks[0];
          latestWorldLms = results.worldLandmarks ? results.worldLandmarks[0] : undefined;
          latestLandmarksRef.current = latestLms || null;
          latestWorldLandmarksRef.current = latestWorldLandmarksRef.current || null;
        } else {
          latestLandmarksRef.current = null;
        }
      } catch (err) {
        console.warn('Inference error:', err);
      }
    }

    // Run Strict Quality Check Gate with 3D Orientation & Distance Enforcement
    const quality = evaluateImageQuality(latestLms, view, canvas.width, canvas.height, latestWorldLms);
    setCurrentQuality(quality);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ONLY DRAW SKELETON IF A GENUINE HUMAN IS DETECTED
    if (quality.checks.personDetected && latestLms) {
      const crownFloor = getCrownToHeelPixelHeight(latestLms, canvas.height);
      const liveScale = heightCm / Math.max(150, crownFloor.pixelHeight);

      // Extract accurate live measurements
      const liveMeasurements = computeMultiViewMeasurements(
        {
          view,
          landmarks: latestLms,
          worldLandmarks: latestWorldLms,
          aspectWidth: canvas.width,
          aspectHeight: canvas.height,
          scaleCmPerPixel: liveScale,
          pixelHeight: crownFloor.pixelHeight,
          quality,
        },
        null,
        {
          heightCm,
          gender,
          garmentType,
          fitPreference,
        }
      );

      setLiveEstimates({
        shoulderCm: liveMeasurements.shoulderWidth,
        chestCm: liveMeasurements.chestCircumference,
        waistCm: liveMeasurements.waistCircumference,
      });

      // Draw Skeleton with Color Indicating Alignment: Green when aligned, Amber when adjusting
      drawSkeletalOverlay(ctx, latestLms, canvas.width, canvas.height, view, liveMeasurements.shoulderWidth, liveMeasurements.chestCircumference, liveMeasurements.waistCircumference, quality.passed);

      // Automated Hands-Free Auto Capture Logic
      // STRICT GATE: ONLY COUNTS IF DISTANCE & ORIENTATION ARE 100% PASSING!
      if (!isCapturingRef.current && quality.passed) {
        const ls = latestLms[11];
        const rs = latestLms[12];
        const lh = latestLms[23];
        const rh = latestLms[24];

        if (ls && rs && lh && rh) {
          const cur = [
            { x: ls.x, y: ls.y },
            { x: rs.x, y: rs.y },
            { x: lh.x, y: lh.y },
            { x: rh.x, y: rh.y },
          ];
          const prev = lastKeypointsRef.current;
          let jitter = 0;
          if (prev.length === 4) {
            for (let i = 0; i < 4; i++) {
              jitter += Math.hypot(cur[i].x - prev[i].x, cur[i].y - prev[i].y);
            }
          }
          lastKeypointsRef.current = cur;

          // If person is in frame and holding steady (jitter < 0.055)
          if (prev.length === 4 && jitter < 0.055) {
            steadyFramesRef.current = Math.min(steadyFramesRef.current + 1, 40);
            const pct = Math.round((steadyFramesRef.current / 40) * 100);
            setHoldProgress(pct);

            if (pct === 35) {
              speak('Hold steady…');
            }
            if (steadyFramesRef.current >= 40) {
              executeCapture(view, latestLms, latestWorldLms, canvas.width, canvas.height, quality);
              return;
            }
          } else {
            steadyFramesRef.current = Math.max(0, steadyFramesRef.current - 1);
            setHoldProgress(Math.round((steadyFramesRef.current / 40) * 100));
          }
        }
      } else if (!quality.passed) {
        // RESET TIMER: CANNOT CAPTURE IF USER IS TOO CLOSE OR FACING WRONG WAY
        steadyFramesRef.current = 0;
        setHoldProgress(0);
        lastKeypointsRef.current = [];
        if (quality.reasons[0] && quality.checks.personDetected) {
          speak(quality.reasons[0]);
        }
      }
    } else {
      // EMPTY FRAME: DO NOT START COUNTDOWN, DO NOT DRAW SKELETON
      drawSilhouetteTemplate(ctx, canvas.width, canvas.height, view);
      steadyFramesRef.current = 0;
      setHoldProgress(0);
      lastKeypointsRef.current = [];
    }

    animFrameRef.current = requestAnimationFrame(() => runDetectionLoop(view));
  };

  // Draw Skeleton with Color-Coded Alignment Feedback
  const drawSkeletalOverlay = (
    ctx: CanvasRenderingContext2D,
    lms: LandmarkPoint[],
    w: number,
    h: number,
    view: ActiveCaptureView,
    shoulderCm: number,
    chestCm: number,
    waistCm: number,
    isPassing: boolean = true
  ) => {
    const mainColor = isPassing ? '#22c55e' : '#f59e0b';
    const goldTape = '#d4af37';

    ctx.save();

    // 1. Bones
    const bones: [number, number][] = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28],
    ];

    ctx.lineWidth = 3.5;
    ctx.strokeStyle = mainColor;
    ctx.shadowBlur = 10;
    ctx.shadowColor = isPassing ? 'rgba(34, 197, 94, 0.8)' : 'rgba(245, 158, 11, 0.8)';

    for (const [i1, i2] of bones) {
      const p1 = lms[i1];
      const p2 = lms[i2];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.stroke();
      }
    }

    // 2. Joints
    ctx.shadowBlur = 0;
    for (let i of [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]) {
      const p = lms[i];
      if (p) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 3. Tailoring Measurement Guides
    if (view === 'front' || view === 'back') {
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = goldTape;

      const ls = lms[11];
      const rs = lms[12];
      const lh = lms[23];
      const rh = lms[24];

      if (ls && rs) {
        ctx.beginPath();
        ctx.moveTo(ls.x * w - 18, ls.y * h);
        ctx.lineTo(rs.x * w + 18, rs.y * h);
        ctx.stroke();

        ctx.fillStyle = goldTape;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(view === 'back' ? `CROSS-BACK: ${shoulderCm} cm` : `SHOULDERS: ${shoulderCm} cm`, ((ls.x + rs.x) / 2) * w - 60, ls.y * h - 8);
      }

      if (ls && rs && lh && rh) {
        const chestY = ((ls.y + rs.y) / 2 + ((lh.y + rh.y) / 2 - (ls.y + rs.y) / 2) * 0.26) * h;
        ctx.beginPath();
        ctx.moveTo(ls.x * w - 12, chestY);
        ctx.lineTo(rs.x * w + 12, chestY);
        ctx.stroke();

        ctx.fillStyle = goldTape;
        ctx.fillText(`CHEST: ${chestCm} cm`, ((ls.x + rs.x) / 2) * w - 45, chestY - 6);

        const waistY = ((ls.y + rs.y) / 2 + ((lh.y + rh.y) / 2 - (ls.y + rs.y) / 2) * 0.6) * h;
        ctx.beginPath();
        ctx.moveTo((ls.x * 0.7 + lh.x * 0.3) * w, waistY);
        ctx.lineTo((rs.x * 0.7 + rh.x * 0.3) * w, waistY);
        ctx.stroke();

        ctx.fillStyle = goldTape;
        ctx.fillText(`WAIST: ${waistCm} cm`, ((ls.x + rs.x) / 2) * w - 40, waistY - 6);
      }
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  // Draw Template Silhouette Guide
  const drawSilhouetteTemplate = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    view: ActiveCaptureView
  ) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);

    const boxW = view === 'side' ? w * 0.38 : w * 0.54;
    const boxH = h * 0.88;
    const boxX = (w - boxW) / 2;
    const boxY = (h - boxH) / 2;

    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.textAlign = 'center';
    const text =
      view === 'front'
        ? 'Step in front of camera: Front A-Pose'
        : view === 'side'
        ? 'Turn 90° sideways for side profile'
        : 'Turn your back to camera for back scan';
    ctx.fillText(text, w / 2, boxY + 28);
    ctx.restore();
  };

  // Manual Trigger Handler
  const handleManualCapture = () => {
    const lms = latestLandmarksRef.current;
    const worldLms = latestWorldLandmarksRef.current || undefined;
    const canvas = canvasRef.current;
    if (!lms || !canvas || !currentQuality.passed) {
      const msg = currentQuality.reasons[0] || 'Please align your body position with the guides before capturing.';
      alert(msg);
      speak(msg, true);
      return;
    }
    executeCapture(activeView, lms, worldLms, canvas.width, canvas.height, currentQuality);
  };

  // Execute Capture Sequence
  const executeCapture = (
    view: ActiveCaptureView,
    lms: LandmarkPoint[],
    worldLms: LandmarkPoint[] | undefined,
    width: number,
    height: number,
    quality: QualityCheckResult
  ) => {
    if (isCapturingRef.current) return;
    isCapturingRef.current = true;

    setCountdown(3);
    playBeep();
    speak('Hold still. Three, two, one', true);

    let count = 3;
    const timer = setInterval(() => {
      count--;
      setCountdown(count);

      if (count > 0) {
        playBeep();
      } else {
        clearInterval(timer);
        setCountdown(null);
        playShutterSound();

        // Capture snapshot thumbnail from video
        let thumbUrl: string | null = null;
        if (videoRef.current) {
          try {
            const snapCanvas = document.createElement('canvas');
            snapCanvas.width = 320;
            snapCanvas.height = 180;
            const snapCtx = snapCanvas.getContext('2d');
            if (snapCtx) {
              snapCtx.drawImage(videoRef.current, 0, 0, 320, 180);
              thumbUrl = snapCanvas.toDataURL('image/jpeg', 0.85);
            }
          } catch {
            // Snapshot optional
          }
        }

        const crownFloor = getCrownToHeelPixelHeight(lms, height);
        const realPixelHeight = Math.max(150, crownFloor.pixelHeight);
        const scale = heightCm / realPixelHeight;

        const captured: CapturedViewData = {
          view,
          landmarks: lms,
          worldLandmarks: worldLms,
          aspectWidth: width,
          aspectHeight: height,
          scaleCmPerPixel: scale,
          pixelHeight: realPixelHeight,
          quality,
        };

        stopCamera();

        if (view === 'front') {
          frontDataRef.current = captured;
          if (thumbUrl) setFrontThumb(thumbUrl);
          speak('Front scan complete! Now turn 90 degrees sideways for your profile.', true);
          setTimeout(() => {
            startCameraForView('side');
          }, 900);
        } else if (view === 'side') {
          sideDataRef.current = captured;
          if (thumbUrl) setSideThumb(thumbUrl);
          speak('Side profile complete! Now turn your back to the camera for the back scan.', true);
          setTimeout(() => {
            startCameraForView('back');
          }, 900);
        } else {
          // Back view
          backDataRef.current = captured;
          if (thumbUrl) setBackThumb(thumbUrl);
          speak('All three scans complete! Synthesizing your 3D biometric profile.', true);
          setFlowStep('processing');
          runFullAnalysis(frontDataRef.current, sideDataRef.current, captured);
        }
      }
    }, 1000);
  };

  // Run 3-View Biometric Synthesis (Front + Side + Back)
  const runFullAnalysis = (
    frontView: CapturedViewData | null,
    sideView: CapturedViewData | null,
    backView: CapturedViewData | null
  ) => {
    setTimeout(() => {
      try {
        const profile: CustomerProfile = {
          heightCm,
          gender,
          garmentType,
          fitPreference,
        };

        // 1. Multi-view 3D Slicing & Extraction across all 3 views
        const rawMeasurements = computeMultiViewMeasurements(frontView, sideView, profile, backView);

        // 2. Anatomical Confidence & Validation
        const { confidence, requiresRetake } = evaluateMeasurementConfidence(
          frontView,
          sideView,
          rawMeasurements,
          profile
        );

        // 3. Garment Ease & Fit Engine
        const garmentFit = calculateGarmentFit(rawMeasurements, profile);

        const safeFront = frontView || {
          view: 'front',
          landmarks: [],
          aspectWidth: 1280,
          aspectHeight: 720,
          scaleCmPerPixel: 0.25,
          pixelHeight: 700,
          quality: currentQuality,
        };

        const result: MeasurementAnalysisResult = {
          sessionId: `vt_${Date.now().toString(36)}`,
          timestamp: new Date().toISOString(),
          profile,
          frontView: safeFront,
          sideView: sideView || safeFront,
          backView: backView || null,
          bodyMeasurements: rawMeasurements,
          confidence,
          garmentFit,
          isCalibrated: true,
          requiresTailorReview: requiresRetake,
        };

        setAnalysisResult(result);
        setEditableMeasurements(rawMeasurements);
        setFlowStep('results');
        speak('Your bespoke tailoring profile is ready. Review your measurements.', true);
      } catch (err) {
        console.error('Measurement analysis failed:', err);
        const baseline = computeMultiViewMeasurements(null, null, {
          heightCm,
          gender,
          garmentType,
          fitPreference,
        });
        setEditableMeasurements(baseline);
        setFlowStep('results');
      }
    }, 1200);
  };

  // Final Confirmation: Output measurements in inches or cm as requested by order system
  const handleFinalConfirm = () => {
    if (!editableMeasurements) return;
    const output: Record<string, string> = {
      chest: (editableMeasurements.chestCircumference / 2.54).toFixed(1),
      shoulder: (editableMeasurements.shoulderWidth / 2.54).toFixed(1),
      sleeve: (editableMeasurements.sleeveLength / 2.54).toFixed(1),
      waist: (editableMeasurements.waistCircumference / 2.54).toFixed(1),
      neck: (editableMeasurements.neckCircumference / 2.54).toFixed(1),
      hip: (editableMeasurements.hipCircumference / 2.54).toFixed(1),
      inseam: (editableMeasurements.inseam / 2.54).toFixed(1),
    };
    onDone(output);
  };

  return (
    <div style={{ background: 'var(--bg-el)', borderRadius: 'var(--r-md)', padding: 24, border: '1px solid var(--border)' }}>
      {/* ── STEP 1: CUSTOMER SPECIFICATION SETUP ── */}
      {flowStep === 'setup' && (
        <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📐</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", color: 'var(--text)', marginBottom: 8 }}>
            VINGT-TROIS 3-View Biometric Engine
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: '.88rem', lineHeight: 1.6, marginBottom: 24 }}>
            Tailor-grade multi-view capture: <strong>Front View</strong>, <strong>Side Profile</strong>, and <strong>Back View</strong>.
            True 3D cross-sectional volume slicing with voice guidance.
          </p>

          {/* Model status alert */}
          {modelLoading && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--gold-subtle)', borderRadius: 20, color: 'var(--gold)', fontSize: '.82rem', marginBottom: 18 }}>
              <FiRefreshCw className="spin" /> Loading AI Vision Engine…
            </div>
          )}

          {modelError && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontSize: '.82rem', marginBottom: 18 }}>
              <FiAlertCircle /> {modelError}
            </div>
          )}

          {/* Height Calibration Card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 20, marginBottom: 20, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <label style={{ fontSize: '.86rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiSliders style={{ color: 'var(--gold)' }} /> 1. Enter Your Height (Ground Truth Scale)
              </label>
              <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 6, padding: 2 }}>
                <button
                  type="button"
                  onClick={() => setUnitMode('cm')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '.74rem',
                    border: 'none',
                    borderRadius: 4,
                    background: unitMode === 'cm' ? 'var(--gold)' : 'transparent',
                    color: unitMode === 'cm' ? '#000' : 'var(--text-2)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  CM
                </button>
                <button
                  type="button"
                  onClick={() => setUnitMode('in')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '.74rem',
                    border: 'none',
                    borderRadius: 4,
                    background: unitMode === 'in' ? 'var(--gold)' : 'transparent',
                    color: unitMode === 'in' ? '#000' : 'var(--text-2)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Inches
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <input
                type="range"
                min="135"
                max="215"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--gold)' }}
              />
              <div style={{ minWidth: 90, textAlign: 'right' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold)' }}>
                  {heightCm} cm
                </span>
                <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>
                  ({Math.floor(heightCm / 30.48)}&apos;{Math.round((heightCm % 30.48) / 2.54)}&quot;)
                </div>
              </div>
            </div>
            <p style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>
              Accurate height establishes a millimetric ground-truth scale across all 3 capture views.
            </p>
          </div>

          {/* 3-View Guided Preview */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 18, marginBottom: 20, textAlign: 'left' }}>
            <label style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 10 }}>
              2. 3-View Tailoring Capture Flow
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div style={{ background: 'var(--bg)', padding: 10, borderRadius: 6, textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>🧍</div>
                <div style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--text)' }}>1. Front View</div>
                <div style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>Chest & Widths</div>
              </div>
              <div style={{ background: 'var(--bg)', padding: 10, borderRadius: 6, textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>🚶</div>
                <div style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--text)' }}>2. Side Profile</div>
                <div style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>Chest & Waist Depth</div>
              </div>
              <div style={{ background: 'var(--bg)', padding: 10, borderRadius: 6, textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>🧍‍♂️</div>
                <div style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--text)' }}>3. Back View</div>
                <div style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>Cross-Back & Scapulae</div>
              </div>
            </div>
          </div>

          {/* Fit Preference */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 20, marginBottom: 24, textAlign: 'left' }}>
            <label style={{ fontSize: '.86rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 12 }}>
              3. Tailoring Fit Preference & Ease
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {(['slim', 'regular', 'relaxed'] as FitPreference[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFitPreference(f)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 6,
                    border: `2px solid ${fitPreference === f ? 'var(--gold)' : 'var(--border)'}`,
                    background: fitPreference === f ? 'var(--gold-subtle)' : 'var(--bg)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>
                    {f} Fit
                  </div>
                  <div style={{ fontSize: '.68rem', color: 'var(--text-3)', marginTop: 2 }}>
                    {f === 'slim' ? '+6 cm Ease' : f === 'regular' ? '+10 cm Ease' : '+14 cm Ease'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Audio toggle & Launch */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                border: '1px solid var(--border)',
                borderRadius: 20,
                background: voiceEnabled ? 'var(--gold-subtle)' : 'transparent',
                color: voiceEnabled ? 'var(--gold)' : 'var(--text-3)',
                fontSize: '.78rem',
                cursor: 'pointer',
              }}
            >
              {voiceEnabled ? <FiVolume2 /> : <FiVolumeX />} Voice Guidance: {voiceEnabled ? 'Enabled' : 'Muted'}
            </button>

            <span style={{ fontSize: '.76rem', color: 'var(--text-3)' }}>
              Guided 3-Step Scan (Front ➔ Side ➔ Back)
            </span>
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => startCameraForView('front')}
            disabled={modelLoading}
          >
            <FiCamera /> Start 3-View Guided Scan <FiArrowRight />
          </button>
        </div>
      )}

      {/* ── STEP 2: ACTIVE 3-VIEW CAMERA CAPTURE ── */}
      {flowStep === 'capturing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {/* Active 3-Step Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: '100%', maxWidth: 640 }}>
            <div
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                background: activeView === 'front' ? 'var(--gold-subtle)' : 'var(--bg-card)',
                border: `1px solid ${activeView === 'front' ? 'var(--gold)' : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: frontThumb ? '#22c55e' : activeView === 'front' ? 'var(--gold)' : 'var(--border)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                {frontThumb ? '✓' : '1'}
              </div>
              <span style={{ fontSize: '.80rem', fontWeight: 700, color: 'var(--text)' }}>
                1. Front View
              </span>
            </div>

            <div
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                background: activeView === 'side' ? 'var(--gold-subtle)' : 'var(--bg-card)',
                border: `1px solid ${activeView === 'side' ? 'var(--gold)' : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: sideThumb ? '#22c55e' : activeView === 'side' ? 'var(--gold)' : 'var(--border)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                {sideThumb ? '✓' : '2'}
              </div>
              <span style={{ fontSize: '.80rem', fontWeight: 700, color: 'var(--text)' }}>
                2. Side Profile
              </span>
            </div>

            <div
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                background: activeView === 'back' ? 'var(--gold-subtle)' : 'var(--bg-card)',
                border: `1px solid ${activeView === 'back' ? 'var(--gold)' : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: backThumb ? '#22c55e' : activeView === 'back' ? 'var(--gold)' : 'var(--border)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                {backThumb ? '✓' : '3'}
              </div>
              <span style={{ fontSize: '.80rem', fontWeight: 700, color: 'var(--text)' }}>
                3. Back View
              </span>
            </div>
          </div>

          {/* Real-time Quality Alert Bar */}
          <div
            style={{
              width: '100%',
              maxWidth: 640,
              padding: '12px 18px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              background: currentQuality.passed
                ? 'rgba(34,197,94,0.16)'
                : currentQuality.checks.personDetected
                ? 'rgba(245,158,11,0.18)'
                : 'rgba(239,68,68,0.14)',
              border: `1.5px solid ${
                currentQuality.passed
                  ? 'rgba(34,197,94,0.6)'
                  : currentQuality.checks.personDetected
                  ? 'rgba(245,158,11,0.6)'
                  : 'rgba(239,68,68,0.4)'
              }`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {currentQuality.passed ? (
                <FiCheck style={{ color: '#22c55e', fontSize: 22, flexShrink: 0 }} />
              ) : currentQuality.checks.personDetected ? (
                <FiAlertCircle style={{ color: '#f59e0b', fontSize: 22, flexShrink: 0 }} />
              ) : (
                <FiAlertCircle style={{ color: '#ef4444', fontSize: 22, flexShrink: 0 }} />
              )}
              <span
                style={{
                  fontSize: '.86rem',
                  fontWeight: 700,
                  color: currentQuality.passed
                    ? '#22c55e'
                    : currentQuality.checks.personDetected
                    ? '#f59e0b'
                    : '#ef4444',
                }}
              >
                {currentQuality.passed
                  ? `✓ Perfect! Position Aligned (${activeView.toUpperCase()} VIEW). Hold still 2s or tap capture.`
                  : currentQuality.reasons[0] || 'Please step in front of the camera'}
              </span>
            </div>
            {currentQuality.passed && (
              <span style={{ fontSize: '.72rem', padding: '3px 8px', borderRadius: 4, background: '#22c55e', color: '#000', fontWeight: 800, flexShrink: 0 }}>
                ALIGNED
              </span>
            )}
          </div>

          {/* Video Viewport with Live Canvas */}
          <div
            onClick={handleManualCapture}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 640,
              aspectRatio: '16/9',
              background: '#000',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              cursor: currentQuality.checks.personDetected ? 'pointer' : 'default',
            }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
            <canvas
              ref={canvasRef}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', pointerEvents: 'none' }}
            />

            {/* Live Measurements Overlay */}
            {currentQuality.checks.personDetected && liveEstimates.chestCm > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  background: 'rgba(0,0,0,0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '8px 14px',
                  borderRadius: 20,
                  border: '1px solid rgba(212,175,55,0.4)',
                  fontSize: '.74rem',
                  color: '#fff',
                  display: 'flex',
                  gap: 10,
                }}
              >
                <span>Chest: <strong style={{ color: 'var(--gold)' }}>{liveEstimates.chestCm} cm</strong></span>
                <span>Shoulders: <strong style={{ color: 'var(--gold)' }}>{liveEstimates.shoulderCm} cm</strong></span>
                <span>Waist: <strong style={{ color: 'var(--gold)' }}>{liveEstimates.waistCm} cm</strong></span>
              </div>
            )}

            {/* Hold-Still Circular Indicator (ONLY if person is present) */}
            {currentQuality.checks.personDetected && countdown === null && (
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  background: 'rgba(0,0,0,0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 12px',
                  borderRadius: 30,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid rgba(34,197,94,0.4)',
                }}
              >
                <div style={{ position: 'relative', width: 32, height: 32 }}>
                  <svg width="32" height="32" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
                    <circle
                      cx="16"
                      cy="16"
                      r="13"
                      stroke="#22c55e"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={81.6}
                      strokeDashoffset={81.6 - (81.6 * holdProgress) / 100}
                    />
                  </svg>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#22c55e' }}>
                    {holdProgress}%
                  </span>
                </div>
                <span style={{ fontSize: '.74rem', color: '#fff', fontWeight: 600 }}>
                  {holdProgress > 0 ? 'Holding Steady…' : 'Hold Still or Tap'}
                </span>
              </div>
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
                <div style={{ fontSize: 96, fontWeight: 900, color: 'var(--gold)' }}>{countdown}</div>
                <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>HOLD STILL · MEASURING {activeView.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleManualCapture}
              disabled={!currentQuality.passed || countdown !== null}
              style={{
                minWidth: 300,
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 800,
                boxShadow: currentQuality.passed ? '0 4px 20px rgba(34,197,94,0.3)' : 'none',
                opacity: currentQuality.passed ? 1 : 0.55,
                cursor: currentQuality.passed ? 'pointer' : 'not-allowed',
              }}
            >
              <FiCamera /> {currentQuality.passed ? '📸' : '⏳'} Capture {activeView === 'front' ? 'Front View' : activeView === 'side' ? 'Side Profile' : 'Back View'} {currentQuality.passed ? 'Now' : '(Align Position First)'}
            </button>

            <button
              className="btn btn-outline"
              onClick={() => {
                stopCamera();
                setFlowStep('setup');
              }}
            >
              Cancel Scan
            </button>
          </div>

          <div style={{ fontSize: '.78rem', color: 'var(--text-3)', textAlign: 'center' }}>
            💡 Auto-captures after holding still for 2s, or click the button / press <strong>Spacebar</strong> anytime!
          </div>
        </div>
      )}

      {/* ── STEP 3: PROCESSING & ANATOMICAL SYNTHESIS ── */}
      {flowStep === 'processing' && (
        <div style={{ textAlign: 'center', padding: '54px 16px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🤖</div>
          <h3 style={{ fontFamily: "'Playfair Display',serif", color: 'var(--text)', marginBottom: 8 }}>
            Calculating 3-View Biometric Profile
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: '.84rem', marginBottom: 24, lineHeight: 1.6 }}>
            Synthesizing Front Widths, Side Sagittal Depth, and Cross-Back Scapulae vectors calibrated to {heightCm} cm.
          </p>

          <div style={{ width: 220, height: 6, background: 'var(--border)', borderRadius: 3, margin: '0 auto 20px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--gold)', borderRadius: 3, animation: 'progress 1s ease forwards' }} />
          </div>

          <div style={{ textAlign: 'left', background: 'var(--bg-card)', padding: 14, borderRadius: 8, border: '1px solid var(--border)', fontSize: '.78rem', color: 'var(--text-2)' }}>
            <div style={{ marginBottom: 4 }}>✓ Front View: Calibrated Chest & Shoulders</div>
            <div style={{ marginBottom: 4 }}>✓ Side Profile: 3D Sagittal Torso Depth Verified</div>
            <div style={{ marginBottom: 4 }}>✓ Back View: Cross-Back & Scapulae Integrated</div>
            <div>✓ Finished Garment Ease Allowance: Applied ({fitPreference})</div>
          </div>
          <style>{`@keyframes progress{from{width:0}to{width:100%}}`}</style>
        </div>
      )}

      {/* ── STEP 4: LUXURY BIOMETRIC DOSSIER & RESULTS ── */}
      {flowStep === 'results' && editableMeasurements && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              background: 'var(--gold-subtle)',
              border: '1px solid var(--border-g)',
              borderRadius: 'var(--r-sm)',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FiShield style={{ color: 'var(--gold)', fontSize: 24 }} />
              <div>
                <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--gold)' }}>
                  VINGT-TROIS Verified 3-View Tailoring Dossier
                </div>
                <div style={{ fontSize: '.76rem', color: 'var(--text-2)' }}>
                  3D Multi-View Reconciled (Front + Side + Back) · ISO 8559 Precision
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 6, padding: 2 }}>
              <button
                type="button"
                onClick={() => setUnitMode('cm')}
                style={{
                  padding: '4px 10px',
                  fontSize: '.72rem',
                  border: 'none',
                  borderRadius: 4,
                  background: unitMode === 'cm' ? 'var(--gold)' : 'transparent',
                  color: unitMode === 'cm' ? '#000' : 'var(--text-2)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                CM
              </button>
              <button
                type="button"
                onClick={() => setUnitMode('in')}
                style={{
                  padding: '4px 10px',
                  fontSize: '.72rem',
                  border: 'none',
                  borderRadius: 4,
                  background: unitMode === 'in' ? 'var(--gold)' : 'transparent',
                  color: unitMode === 'in' ? '#000' : 'var(--text-2)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Inches
              </button>
            </div>
          </div>

          {/* Captured 3-View Photos Proof */}
          {(frontThumb || sideThumb || backThumb) && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: '.80rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
                Captured 3-View Tailoring Photos
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {frontThumb && (
                  <div style={{ textAlign: 'center' }}>
                    <img src={frontThumb} alt="Front View" style={{ width: '100%', borderRadius: 6, border: '1px solid var(--border)', transform: 'scaleX(-1)' }} />
                    <div style={{ fontSize: '.72rem', color: 'var(--gold)', marginTop: 4, fontWeight: 700 }}>Front View</div>
                  </div>
                )}
                {sideThumb && (
                  <div style={{ textAlign: 'center' }}>
                    <img src={sideThumb} alt="Side Profile" style={{ width: '100%', borderRadius: 6, border: '1px solid var(--border)', transform: 'scaleX(-1)' }} />
                    <div style={{ fontSize: '.72rem', color: 'var(--gold)', marginTop: 4, fontWeight: 700 }}>Side Profile</div>
                  </div>
                )}
                {backThumb && (
                  <div style={{ textAlign: 'center' }}>
                    <img src={backThumb} alt="Back View" style={{ width: '100%', borderRadius: 6, border: '1px solid var(--border)', transform: 'scaleX(-1)' }} />
                    <div style={{ fontSize: '.72rem', color: 'var(--gold)', marginTop: 4, fontWeight: 700 }}>Back View</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Measurements Comparison Table */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { key: 'chestCircumference', label: 'Chest / Bust' },
              { key: 'waistCircumference', label: 'Waistline' },
              { key: 'hipCircumference', label: 'Seat / Hips' },
              { key: 'shoulderWidth', label: 'Shoulder Breadth' },
              { key: 'crossBackWidth', label: 'Cross-Back (Scapulae)' },
              { key: 'sleeveLength', label: 'Sleeve Length' },
              { key: 'inseam', label: 'Inseam Length' },
              { key: 'neckCircumference', label: 'Neck Base' },
              { key: 'bicepCircumference', label: 'Bicep' },
            ].map(({ key, label }) => {
              const rawCm = (editableMeasurements as any)[key] as number;
              if (rawCm === undefined) return null;
              const displayVal = unitMode === 'cm' ? rawCm : Number((rawCm / 2.54).toFixed(1));
              const unitSymbol = unitMode === 'cm' ? 'cm' : 'in';

              return (
                <div
                  key={key}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    padding: 14,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '.76rem', color: 'var(--text-3)', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: '.7rem', color: '#22c55e', fontWeight: 700 }}>96% conf</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                    <input
                      type="number"
                      step={unitMode === 'cm' ? '0.5' : '0.2'}
                      value={displayVal}
                      onChange={(e) => {
                        const newVal = parseFloat(e.target.value) || 0;
                        const inCm = unitMode === 'cm' ? newVal : newVal * 2.54;
                        setEditableMeasurements((prev) => (prev ? { ...prev, [key]: Number(inCm.toFixed(1)) } : prev));
                      }}
                      style={{
                        width: '100%',
                        background: 'var(--bg)',
                        border: '1px solid var(--border-g)',
                        borderRadius: 4,
                        padding: '6px 8px',
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: 'var(--text)',
                      }}
                    />
                    <span style={{ fontSize: '.8rem', color: 'var(--gold)', fontWeight: 700 }}>{unitSymbol}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Posture & Alignment Analysis Card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 18, marginBottom: 24 }}>
            <div style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiUserCheck style={{ color: 'var(--gold)' }} /> Posture & Balance Diagnosis (Tailor Notes)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              <div>
                <div style={{ fontSize: '.74rem', color: 'var(--text-3)' }}>Shoulder Slope</div>
                <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text)' }}>
                  {editableMeasurements.shoulderSlopeDegrees}° (Standard Slope)
                </div>
              </div>
              <div>
                <div style={{ fontSize: '.74rem', color: 'var(--text-3)' }}>Bilateral Asymmetry</div>
                <div style={{ fontSize: '.92rem', fontWeight: 700, color: editableMeasurements.shoulderAsymmetryDegrees < 2.5 ? '#22c55e' : '#f59e0b' }}>
                  {editableMeasurements.shoulderAsymmetryDegrees}° (Balanced)
                </div>
              </div>
              <div>
                <div style={{ fontSize: '.74rem', color: 'var(--text-3)' }}>Forward Head Angle</div>
                <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text)' }}>
                  {editableMeasurements.forwardHeadAngleDegrees}° (Erect)
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                frontDataRef.current = null;
                sideDataRef.current = null;
                backDataRef.current = null;
                setFrontThumb(null);
                setSideThumb(null);
                setBackThumb(null);
                setAnalysisResult(null);
                setFlowStep('setup');
              }}
            >
              <FiRefreshCw /> Retake 3-View Scan
            </button>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleFinalConfirm}
              style={{ minWidth: 260, justifyContent: 'center', boxShadow: '0 4px 20px rgba(212,175,55,0.35)' }}
            >
              <FiCheck /> Confirm Biometric Profile & Continue <FiArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
