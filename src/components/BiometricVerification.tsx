import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, Camera, FileText, Shield, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { FaceRecognition } from './FaceRecognition';
import { AadhaarVerification } from './AadhaarVerification';
import { biometricAuthService } from '@/services/biometricAuth';
import { mockAuthService } from '@/services/mockAuth';
import { toast } from 'sonner';

interface BiometricVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (verified: boolean) => void;
  pollTitle: string;
}

type VerificationStep = 'overview' | 'fingerprint' | 'face' | 'aadhaar' | 'complete';

interface VerificationStatus {
  fingerprint: boolean;
  face: boolean;
  aadhaar: boolean;
}

export const BiometricVerification = ({ 
  isOpen, 
  onClose, 
  onComplete, 
  pollTitle 
}: BiometricVerificationProps) => {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('overview');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    fingerprint: false,
    face: false,
    aadhaar: false
  });
  const [verificationData, setVerificationData] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const currentUser = mockAuthService.getCurrentUser();
  const hasFingerprint = currentUser ? biometricAuthService.hasRegisteredBiometric(currentUser.id) : false;

  const handleFingerprintAuth = async () => {
    if (!currentUser) return;

    setIsProcessing(true);
    
    try {
      let result;
      
      if (hasFingerprint) {
        // Authenticate existing fingerprint
        result = await biometricAuthService.authenticateBiometric(currentUser.id);
      } else {
        // Register new fingerprint
        result = await biometricAuthService.registerBiometric(currentUser.id, currentUser.name);
      }

      if (result.success) {
        setVerificationStatus(prev => ({ ...prev, fingerprint: true }));
        setVerificationData(prev => ({ ...prev, fingerprint: result }));
        toast.success('Fingerprint verification completed!');
        setCurrentStep('face');
      } else {
        toast.error(result.error || 'Fingerprint verification failed');
      }
    } catch (error) {
      toast.error('Fingerprint verification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFaceComplete = (success: boolean, faceData?: string) => {
    if (success) {
      setVerificationStatus(prev => ({ ...prev, face: true }));
      setVerificationData(prev => ({ ...prev, face: { image: faceData, timestamp: new Date() } }));
      toast.success('Face verification completed!');
      setCurrentStep('aadhaar');
    } else {
      toast.error('Face verification failed');
    }
  };

  const handleAadhaarComplete = (success: boolean, aadhaarData?: any) => {
    if (success) {
      setVerificationStatus(prev => ({ ...prev, aadhaar: true }));
      setVerificationData(prev => ({ ...prev, aadhaar: aadhaarData }));
      toast.success('Aadhaar verification completed!');
      setCurrentStep('complete');
    } else {
      toast.error('Aadhaar verification failed');
    }
  };

  const handleCompleteVerification = () => {
    const allVerified = verificationStatus.fingerprint && verificationStatus.face && verificationStatus.aadhaar;
    
    if (allVerified) {
      // Store verification data
      const verificationRecord = {
        userId: currentUser?.id,
        pollTitle,
        verificationData,
        completedAt: new Date(),
        verificationId: `VER_${Date.now()}`
      };
      
      localStorage.setItem(`verification_${currentUser?.id}_${Date.now()}`, JSON.stringify(verificationRecord));
      
      toast.success('Complete biometric verification successful! You can now vote.');
      onComplete(true);
      onClose();
    } else {
      toast.error('Please complete all verification steps');
    }
  };

  const handleSkipToNext = () => {
    if (currentStep === 'fingerprint') setCurrentStep('face');
    else if (currentStep === 'face') setCurrentStep('aadhaar');
    else if (currentStep === 'aadhaar') setCurrentStep('complete');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-16 h-16 mx-auto text-primary mb-4" />
        <h3 className="text-xl font-semibold mb-2">Multi-Factor Biometric Verification</h3>
        <p className="text-muted-foreground">
          Complete secure identity verification to vote in: <span className="font-medium">{pollTitle}</span>
        </p>
      </div>

      <div className="space-y-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Fingerprint className="w-5 h-5" />
              Fingerprint Authentication
              {verificationStatus.fingerprint && <CheckCircle className="w-4 h-4 text-success ml-auto" />}
            </CardTitle>
            <CardDescription>
              {hasFingerprint ? 'Use your registered fingerprint' : 'Register your fingerprint for secure access'}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Face Recognition
              {verificationStatus.face && <CheckCircle className="w-4 h-4 text-success ml-auto" />}
            </CardTitle>
            <CardDescription>
              Verify your identity using facial recognition technology
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Aadhaar Verification
              {verificationStatus.aadhaar && <CheckCircle className="w-4 h-4 text-success ml-auto" />}
            </CardTitle>
            <CardDescription>
              Upload your Aadhaar document for government ID verification
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This multi-layer verification ensures secure and authentic voting. All biometric data is processed locally and encrypted.
        </AlertDescription>
      </Alert>

      <Button onClick={() => setCurrentStep('fingerprint')} className="w-full" variant="hero">
        Begin Verification Process
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const renderFingerprint = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Fingerprint className="w-16 h-16 mx-auto text-primary mb-4" />
        <h3 className="text-xl font-semibold mb-2">Fingerprint Authentication</h3>
        <p className="text-muted-foreground">
          {hasFingerprint ? 'Place your finger on the sensor to authenticate' : 'Register your fingerprint for secure voting'}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Badge variant={verificationStatus.fingerprint ? "default" : "secondary"} className="mb-4">
              {verificationStatus.fingerprint ? "Verified" : "Pending"}
            </Badge>
            
            <p className="text-sm text-muted-foreground">
              {hasFingerprint 
                ? "Use your registered fingerprint to authenticate your identity"
                : "Your fingerprint will be securely registered for future voting sessions"
              }
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleFingerprintAuth}
                disabled={isProcessing || verificationStatus.fingerprint}
                variant="hero"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {hasFingerprint ? 'Authenticating...' : 'Registering...'}
                  </>
                ) : verificationStatus.fingerprint ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verified
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4 mr-2" />
                    {hasFingerprint ? 'Authenticate' : 'Register'} Fingerprint
                  </>
                )}
              </Button>
              
              {!verificationStatus.fingerprint && (
                <Button variant="outline" onClick={handleSkipToNext} className="w-full">
                  Skip for now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {!biometricAuthService.isWebAuthnSupported() && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Fingerprint authentication is not supported on this device or browser. Please use Face Recognition and Aadhaar verification.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderComplete = () => {
    const completedSteps = Object.values(verificationStatus).filter(Boolean).length;
    const allCompleted = completedSteps === 3;

    return (
      <div className="space-y-6">
        <div className="text-center">
          {allCompleted ? (
            <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
          ) : (
            <AlertTriangle className="w-16 h-16 mx-auto text-warning mb-4" />
          )}
          <h3 className="text-xl font-semibold mb-2">
            {allCompleted ? 'Verification Complete!' : 'Partial Verification'}
          </h3>
          <p className="text-muted-foreground">
            {allCompleted 
              ? 'You have successfully completed all security verifications'
              : `${completedSteps} of 3 verification steps completed`
            }
          </p>
        </div>

        <div className="grid gap-3">
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${verificationStatus.fingerprint ? 'bg-success/5 border-success/20' : 'bg-muted/50'}`}>
            <Fingerprint className={`w-5 h-5 ${verificationStatus.fingerprint ? 'text-success' : 'text-muted-foreground'}`} />
            <span className="flex-1">Fingerprint Authentication</span>
            {verificationStatus.fingerprint ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <span className="text-xs text-muted-foreground">Skipped</span>
            )}
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg border ${verificationStatus.face ? 'bg-success/5 border-success/20' : 'bg-muted/50'}`}>
            <Camera className={`w-5 h-5 ${verificationStatus.face ? 'text-success' : 'text-muted-foreground'}`} />
            <span className="flex-1">Face Recognition</span>
            {verificationStatus.face ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <span className="text-xs text-muted-foreground">Skipped</span>
            )}
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg border ${verificationStatus.aadhaar ? 'bg-success/5 border-success/20' : 'bg-muted/50'}`}>
            <FileText className={`w-5 h-5 ${verificationStatus.aadhaar ? 'text-success' : 'text-muted-foreground'}`} />
            <span className="flex-1">Aadhaar Verification</span>
            {verificationStatus.aadhaar ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <span className="text-xs text-muted-foreground">Skipped</span>
            )}
          </div>
        </div>

        {allCompleted ? (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Maximum security verification achieved. Your vote will be recorded with the highest level of authentication.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              For maximum security, we recommend completing all verification steps. You can still vote with partial verification.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button 
            onClick={handleCompleteVerification}
            variant="hero"
            className="w-full"
            disabled={completedSteps === 0}
          >
            <Shield className="w-4 h-4 mr-2" />
            {allCompleted ? 'Proceed to Vote' : `Continue with ${completedSteps}/3 Verifications`}
          </Button>
          
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel Verification
          </Button>
        </div>
      </div>
    );
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 'overview': return renderOverview();
      case 'fingerprint': return renderFingerprint();
      case 'face': return <FaceRecognition onComplete={handleFaceComplete} userName={currentUser?.name || 'User'} />;
      case 'aadhaar': return <AadhaarVerification onComplete={handleAadhaarComplete} userName={currentUser?.name || 'User'} />;
      case 'complete': return renderComplete();
      default: return renderOverview();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Biometric Verification
          </DialogTitle>
          <DialogDescription>
            Complete identity verification to ensure secure voting
          </DialogDescription>
        </DialogHeader>
        
        {getStepContent()}
      </DialogContent>
    </Dialog>
  );
};