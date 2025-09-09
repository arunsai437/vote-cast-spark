import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, CheckCircle, XCircle, Camera } from 'lucide-react';

interface AadhaarVerificationProps {
  onComplete: (success: boolean, aadhaarData?: any) => void;
  userName: string;
}

export const AadhaarVerification = ({ onComplete, userName }: AadhaarVerificationProps) => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'verifying' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAadhaarNumber = (number: string): boolean => {
    // Remove spaces and check if it's 12 digits
    const cleaned = number.replace(/\s/g, '');
    return /^\d{12}$/.test(cleaned);
  };

  const formatAadhaarNumber = (value: string): string => {
    // Remove non-digits and limit to 12 digits
    const digits = value.replace(/\D/g, '').slice(0, 12);
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadhaarNumber(e.target.value);
    setAadhaarNumber(formatted);
    setError('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setStatus('uploading');
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setDocumentImage(result);
      setStatus('idle');
      setError('');
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setStatus('error');
    };

    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const verifyAadhaar = async () => {
    if (!validateAadhaarNumber(aadhaarNumber)) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    if (!documentImage) {
      setError('Please upload your Aadhaar document');
      return;
    }

    setIsVerifying(true);
    setStatus('verifying');
    setError('');

    try {
      // Simulate Aadhaar verification process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock verification result (85% success rate)
      const success = Math.random() > 0.15;
      
      if (success) {
        setStatus('success');
        const aadhaarData = {
          number: aadhaarNumber,
          documentImage,
          verifiedAt: new Date(),
          verificationId: `AADHAAR_${Date.now()}`
        };
        onComplete(true, aadhaarData);
      } else {
        setStatus('error');
        setError('Aadhaar verification failed. Please check your details and try again.');
      }
    } catch (err) {
      setStatus('error');
      setError('Verification service unavailable. Please try again later.');
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'uploading': return 'Uploading document...';
      case 'verifying': return 'Verifying Aadhaar details...';
      case 'success': return 'Aadhaar verification successful!';
      case 'error': return 'Verification failed';
      default: return 'Enter your Aadhaar details for verification';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <FileText className="w-5 h-5" />
          Aadhaar Verification
        </CardTitle>
        <CardDescription>
          Verify your identity with Aadhaar for secure voting as {userName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="aadhaar">Aadhaar Number</Label>
          <Input
            id="aadhaar"
            type="text"
            value={aadhaarNumber}
            onChange={handleAadhaarChange}
            placeholder="1234 5678 9012"
            maxLength={14} // 12 digits + 2 spaces
            disabled={isVerifying || status === 'success'}
            className="text-center text-lg tracking-wider"
          />
        </div>

        <div className="space-y-2">
          <Label>Aadhaar Document</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
            {documentImage ? (
              <div className="space-y-3">
                <img 
                  src={documentImage} 
                  alt="Aadhaar Document" 
                  className="w-full h-40 object-contain rounded border"
                />
                {status !== 'success' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={triggerFileUpload}
                    disabled={isVerifying}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Document
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Upload a clear photo of your Aadhaar card
                </p>
                <Button 
                  variant="outline" 
                  onClick={triggerFileUpload}
                  disabled={isVerifying}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            {getStatusMessage()}
          </p>

          {status === 'success' && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-success">
                Aadhaar verification completed successfully!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {status !== 'success' && (
            <Button 
              onClick={verifyAadhaar}
              disabled={!validateAadhaarNumber(aadhaarNumber) || !documentImage || isVerifying}
              variant="hero"
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Verify Aadhaar
                </>
              )}
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          <p>Your Aadhaar information is processed securely and used only for voter verification.</p>
        </div>
      </CardContent>
    </Card>
  );
};