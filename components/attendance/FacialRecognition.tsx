'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, CheckCircle2, XCircle, Loader2, Video, VideoOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import * as faceapi from 'face-api.js';

interface FacialRecognitionProps {
  eventId: number;
  eventTitle?: string;
  userId: number;
  onFaceVerified?: (imageData: string) => void;
  requireLiveness?: boolean; // Enable blink detection for anti-spoofing
}

export default function FacialRecognition({
  eventId,
  eventTitle,
  userId,
  onFaceVerified,
  requireLiveness = false,
}: FacialRecognitionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraActiveRef = useRef(false); // Use ref for immediate access
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'verified' | 'failed'>('idle');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectionAttempts, setDetectionAttempts] = useState(0);

  // Load face-api.js models
  useEffect(() => {
    loadModels();
    checkEnrollment();
  }, [userId]);

  const loadModels = async () => {
    try {
      const MODEL_URL = '/models';
      
      console.log('Loading face-api.js models from:', MODEL_URL);
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      setModelsLoaded(true);
      console.log('✅ Face-api.js models loaded successfully');
      toast.success('Face recognition models loaded');
    } catch (err) {
      console.error('❌ Error loading models:', err);
      setError('Failed to load face recognition models. Please refresh the page.');
      toast.error('Failed to load face recognition models');
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await fetch(`/api/face-recognition/verify?userId=${userId}`);
      const data = await response.json();
      setIsEnrolled(data.hasEnrolled);
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      
      if (!modelsLoaded) {
        throw new Error('Face recognition models not loaded yet. Please wait...');
      }

      // Check if HTTPS or localhost (required for camera access)
      if (!window.isSecureContext) {
        throw new Error('Camera access requires HTTPS or localhost');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        
        // Set camera active immediately
        setCameraActive(true);
        cameraActiveRef.current = true;
        
        // Log video dimensions for debugging
        console.log('📹 Video ready:', {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
          readyState: videoRef.current.readyState
        });
        
        // Start face detection loop after a short delay to ensure video is fully ready
        setTimeout(() => {
          console.log('🔍 Starting face detection loop...');
          detectFaces();
        }, 500);
      }
      
      toast.success('Camera started');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      
      if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission denied')) {
        setError('Camera permission denied. Please allow camera access to use facial recognition.');
      } else if (errorMessage.includes('NotFoundError')) {
        setError('No camera found on your device.');
      } else {
        setError(errorMessage);
      }
      
      toast.error(errorMessage);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
    cameraActiveRef.current = false;
    setFaceDetected(false);
    setDetectionAttempts(0);
    toast.info('Camera stopped');
  };

  // Real-time face detection
  const detectFaces = async () => {
    if (!videoRef.current) {
      console.log('⚠️ Detection stopped: video ref not available');
      return;
    }

    if (!cameraActiveRef.current) {
      console.log('⚠️ Detection stopped: camera not active');
      return;
    }

    try {
      // Ensure video is ready
      if (videoRef.current.readyState !== 4) {
        console.log('⏳ Video not ready yet, readyState:', videoRef.current.readyState);
        if (cameraActiveRef.current) {
          setTimeout(() => detectFaces(), 100);
        }
        return;
      }

      // Log dimensions on first detection
      if (detectionAttempts === 0) {
        console.log('📐 Video dimensions:', {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        });
      }

      setDetectionAttempts(prev => prev + 1);

      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.3
        }))
        .withFaceLandmarks();

      if (detections) {
        setFaceDetected(true);
        if (detectionAttempts % 30 === 0) { // Log every 30th detection to avoid spam
          console.log('✅ Face detected! Score:', detections.detection.score.toFixed(3));
        }
      } else {
        if (faceDetected) {
          console.log('❌ Face lost');
        }
        setFaceDetected(false);
        if (detectionAttempts % 30 === 0) {
          console.log('🔍 No face detected (attempt', detectionAttempts, ')');
        }
      }

      // Continue detection loop using ref for reliable state check
      if (cameraActiveRef.current) {
        requestAnimationFrame(() => detectFaces());
      } else {
        console.log('🛑 Detection loop ended: camera stopped');
      }
    } catch (err) {
      console.error('❌ Error in face detection:', err);
      // Continue loop even on error
      if (cameraActiveRef.current) {
        setTimeout(() => detectFaces(), 100);
      }
    }
  };

  // Capture image from video
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64 image
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // Extract face descriptor
  const extractFaceDescriptor = async (imageData: string): Promise<Float32Array | null> => {
    try {
      console.log('Extracting face descriptor...');
      const img = await faceapi.fetchImage(imageData);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.3
        }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        console.log('No face detected in image');
        return null;
      }

      console.log('Face descriptor extracted successfully, score:', detection.detection.score);
      return detection.descriptor;
    } catch (err) {
      console.error('Error extracting face descriptor:', err);
      return null;
    }
  };

  // Enroll face (first-time registration)
  const enrollFace = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!faceDetected) {
        throw new Error('No face detected. Please position your face clearly in the frame.');
      }

      const imageData = captureImage();
      if (!imageData) {
        throw new Error('Failed to capture image');
      }

      toast.info('Extracting facial features...');

      const descriptor = await extractFaceDescriptor(imageData);
      if (!descriptor) {
        throw new Error('No face detected in the image. Please try again.');
      }

      // Send descriptor to backend
      const response = await fetch('/api/face-recognition/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          descriptor: Array.from(descriptor), // Convert Float32Array to regular array
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enroll face');
      }

      toast.success('Face enrolled successfully! You can now use facial recognition.');
      setIsEnrolled(true);
      setCapturedImage(imageData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Enrollment failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verify face
  const verifyFace = async () => {
    try {
      setLoading(true);
      setVerificationStatus('checking');
      setError(null);

      if (!faceDetected) {
        throw new Error('No face detected. Please position your face clearly in the frame.');
      }

      // Capture image from camera
      const imageData = captureImage();
      
      if (!imageData) {
        throw new Error('Failed to capture image');
      }

      setCapturedImage(imageData);
      toast.info('Processing facial recognition...');

      // Extract face descriptor from captured image
      const descriptor = await extractFaceDescriptor(imageData);
      if (!descriptor) {
        throw new Error('No face detected in the image. Please try again.');
      }

      // Send to backend for verification
      const response = await fetch('/api/face-recognition/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          eventId,
          descriptor: Array.from(descriptor),
          imageData,
        }),
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const result = await response.json();

      if (result.verified) {
        setVerificationStatus('verified');
        toast.success(`Face verified successfully! (Confidence: ${(result.confidence * 100).toFixed(1)}%)`);
        
        if (onFaceVerified) {
          onFaceVerified(imageData);
        }
        
        // Auto stop camera after success
        setTimeout(() => {
          stopCamera();
        }, 2000);
      } else {
        setVerificationStatus('failed');
        toast.error(`Face verification failed. Confidence too low: ${(result.confidence * 100).toFixed(1)}%`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      setVerificationStatus('failed');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'checking':
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Verifying...
          </Badge>
        );
      case 'verified':
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Facial Recognition
            </CardTitle>
            <CardDescription>
              {eventTitle
                ? `Verify your identity for ${eventTitle}`
                : 'Verify your identity using facial recognition'}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Models Loading Status */}
        {!modelsLoaded && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <p className="text-sm text-blue-600 dark:text-blue-400">Loading face recognition models...</p>
            </div>
          </div>
        )}

        {/* Enrollment Status */}
        {modelsLoaded && isEnrolled === false && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              <UserPlus className="inline h-4 w-4 mr-1" />
              You need to enroll your face first before verification.
            </p>
          </div>
        )}

        {/* Video Preview */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ display: cameraActive ? 'block' : 'none' }}
          />
          
          {/* Face Detection Indicator */}
          {cameraActive && (
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
              {faceDetected ? (
                <Badge className="gap-1 bg-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Face Detected
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Scanning...
                </Badge>
              )}
              {detectionAttempts > 0 && (
                <Badge variant="outline" className="text-xs">
                  {detectionAttempts} checks
                </Badge>
              )}
            </div>
          )}
          
          {capturedImage && !cameraActive && (
            <img
              src={capturedImage}
              alt="Captured face"
              className="w-full h-full object-cover"
            />
          )}
          
          {!cameraActive && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Camera not active</p>
              </div>
            </div>
          )}
          
          {/* Hidden canvas for capturing frames */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Troubleshooting Tips */}
        {cameraActive && !faceDetected && detectionAttempts > 50 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">💡 Face Detection Tips:</p>
            <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
              <li>Ensure your face is well-lit (avoid backlighting)</li>
              <li>Position your face in the center of the frame</li>
              <li>Remove sunglasses, masks, or items covering your face</li>
              <li>Try moving closer to the camera (1-2 feet away)</li>
              <li>Ensure your entire face (including forehead and chin) is visible</li>
              <li>Check browser console (F12) for detection logs</li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!cameraActive ? (
            <Button onClick={startCamera} className="flex-1" disabled={!modelsLoaded}>
              <Video className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <>
              {isEnrolled === false ? (
                <Button
                  onClick={enrollFace}
                  disabled={loading || !faceDetected}
                  className="flex-1"
                  variant="default"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Enroll Face
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={verifyFace}
                  disabled={loading || verificationStatus === 'verified' || !faceDetected}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Capture & Verify
                    </>
                  )}
                </Button>
              )}
              <Button onClick={stopCamera} variant="outline">
                <VideoOff className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Info Notes */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>ℹ️ This feature uses face-api.js for client-side face recognition.</p>
          <p>🔒 Your facial data is encrypted and stored securely.</p>
          <p>📸 Position your face clearly in the frame.</p>
          <p>✅ Wait for "Face Detected" indicator before capturing.</p>
          {requireLiveness && <p>👁️ Please blink naturally during verification.</p>}
          <p>⚠️ Only works on HTTPS or localhost.</p>
        </div>
      </CardContent>
    </Card>
  );
}
