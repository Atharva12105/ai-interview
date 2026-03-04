import { useEffect, useRef, useState, useCallback } from 'react';

export const useFaceDetection = ({ onFaceLost, onFaceReturned, enabled = true }) => {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const detectionRunningRef = useRef(false);
  const [facePresent, setFacePresent] = useState(true);
  const [faceCount, setFaceCount] = useState(0);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [eyesOpen, setEyesOpen] = useState(true);
  const [closedEyesFaceCount, setClosedEyesFaceCount] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState('');

  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const getEyeAspectRatio = (eyePoints) => {
    if (!eyePoints || eyePoints.length < 6) return null;
    const [p1, p2, p3, p4, p5, p6] = eyePoints;
    const vertical = distance(p2, p6) + distance(p3, p5);
    const horizontal = 2 * distance(p1, p4);
    if (!horizontal) return null;
    return vertical / horizontal;
  };

  useEffect(() => {
    // Load face-api.js models
    const loadModels = async () => {
      try {
        const faceapi = await import('face-api.js');
        const modelUris = ['/models', 'https://justadudewhohacks.github.io/face-api.js/models'];
        let loaded = false;

        for (const uri of modelUris) {
          try {
            await Promise.all([
              faceapi.nets.tinyFaceDetector.loadFromUri(uri),
              faceapi.nets.faceLandmark68Net.loadFromUri(uri),
            ]);
            loaded = true;
            break;
          } catch {
            // Try next model URI.
          }
        }

        if (!loaded) {
          throw new Error('Unable to load required face-api.js models from local or fallback URI.');
        }

        setModelLoaded(true);
        setModelError('');
      } catch (error) {
        console.error('Failed to load face detection models', error);
        setModelLoaded(false);
        setModelError('Face models failed to load. Put weights in /public/models or allow network for fallback.');
      }
    };
    loadModels();
  }, []);

  const startDetection = useCallback(async () => {
    if (!modelLoaded || !videoRef.current || !enabled) return;

    const faceapi = await import('face-api.js');
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || detectionRunningRef.current) return;
      if (videoRef.current.readyState < 2 || !videoRef.current.videoWidth) return;

      detectionRunningRef.current = true;
      try {
        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
          )
          .withFaceLandmarks();

        const nextFaceCount = detections.length;
        const hasFace = nextFaceCount > 0;

        let biggestFaceArea = -1;
        let primaryEyesOpen = true;
        let eyesClosedFaces = 0;

        detections.forEach((detection) => {
          const box = detection.detection.box;
          const area = box.width * box.height;
          const leftEAR = getEyeAspectRatio(detection.landmarks.getLeftEye());
          const rightEAR = getEyeAspectRatio(detection.landmarks.getRightEye());
          const threshold = 0.2;
          const faceEyesOpen = leftEAR !== null && rightEAR !== null
            ? leftEAR >= threshold && rightEAR >= threshold
            : true;

          if (!faceEyesOpen) eyesClosedFaces += 1;
          if (area > biggestFaceArea) {
            biggestFaceArea = area;
            primaryEyesOpen = faceEyesOpen;
          }
        });

        setFaceCount(nextFaceCount);
        setMultipleFaces(nextFaceCount > 1);
        setEyesOpen(primaryEyesOpen);
        setClosedEyesFaceCount(eyesClosedFaces);
        setFacePresent((prev) => {
          if (prev !== hasFace) {
            if (!hasFace) onFaceLost?.();
            else onFaceReturned?.();
          }
          return hasFace;
        });
      } catch (error) {
        console.error('Face detection failed', error);
      } finally {
        detectionRunningRef.current = false;
      }
    }, 1500);
  }, [modelLoaded, enabled, onFaceLost, onFaceReturned]);

  const stopDetection = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    detectionRunningRef.current = false;
  }, []);

  useEffect(() => () => stopDetection(), [stopDetection]);

  return {
    videoRef,
    facePresent,
    faceCount,
    multipleFaces,
    eyesOpen,
    closedEyesFaceCount,
    modelLoaded,
    modelError,
    startDetection,
    stopDetection,
  };
};
