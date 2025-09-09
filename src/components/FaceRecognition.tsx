import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface FaceRecognitionProps {
  onComplete: (success: boolean, faceData?: string) => void;
  userName: string;
}

export const FaceRecognition = ({ onComplete, userName }: FaceRecognitionProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'preparing' | 'ready' | 'capturing' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setStatus('preparing');
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        setStatus('ready');
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      setStatus('error');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setStatus('idle');
  }, []);

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    setStatus('capturing');

    // Wait a moment for user to get ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);

    setStatus('processing');

    // Simulate face recognition processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock face recognition result (90% success rate)
    const success = Math.random() > 0.1;
    
    if (success) {
      setStatus('success');
      stopCamera();
      onComplete(true, imageData);
    } else {
      setStatus('error');
      setError('Face verification failed. Please try again with better lighting.');
      setIsCapturing(false);
    }
  }, [onComplete, stopCamera]);

  const retryCapture = useCallback(() => {
    setCapturedImage(null);
    setError('');
    setStatus('ready');
    setIsCapturing(false);
  }, []);

  const getStatusMessage = () => {
    switch (status) {
      case 'preparing': return 'Initializing camera...';
      case 'ready': return 'Position your face in the frame and click capture';
      case 'capturing': return 'Stay still, capturing...';
      case 'processing': return 'Verifying face...';
      case 'success': return 'Face verification successful!';
      case 'error': return 'Verification failed';
      default: return 'Click start to begin face verification';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <Camera className="w-5 h-5" />
          Face Verification
        </CardTitle>
        <CardDescription>
          Verify your identity for secure voting as {userName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
          {isActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onLoadedMetadata={() => setStatus('ready')}
              />
              {/* Face detection overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-60 border-2 border-primary rounded-lg opacity-50"></div>
              </div>
              {capturedImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Camera className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            {getStatusMessage()}
          </p>

          {status === 'success' && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-success">
                Face verification completed successfully!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-center">
            {!isActive && status !== 'success' && (
              <Button onClick={startCamera} disabled={status === 'preparing'}>
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            )}

            {isActive && status === 'ready' && !isCapturing && (
              <Button onClick={captureImage} variant="hero">
                <Camera className="w-4 h-4 mr-2" />
                Capture Face
              </Button>
            )}

            {status === 'error' && isActive && (
              <Button onClick={retryCapture} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}

            {isActive && status !== 'success' && (
              <Button onClick={stopCamera} variant="outline">
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};