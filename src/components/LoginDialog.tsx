import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Mail, Lock, User, Fingerprint, Camera, FileText, CheckCircle, ArrowRight } from "lucide-react";
import { BiometricVerification } from "./BiometricVerification";
import { mockAuthService } from "@/services/mockAuth";
import { toast } from "sonner";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const LoginDialog = ({ open, onOpenChange, onSuccess }: LoginDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState<'biometric' | 'auth'>('biometric');
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [showBiometricDialog, setShowBiometricDialog] = useState(false);
  
  // Login form
  const [loginForm, setLoginForm] = useState({
    email: "voter1@example.com", // Pre-filled for demo
    password: "password123"
  });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });

  const handleBiometricComplete = (verified: boolean) => {
    setBiometricVerified(verified);
    setShowBiometricDialog(false);
    if (verified) {
      setCurrentStep('auth');
      toast.success("Biometric verification completed! You can now login.");
    }
  };

  const handleStartBiometric = () => {
    setShowBiometricDialog(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!biometricVerified) {
      toast.error("Please complete biometric verification first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await mockAuthService.login(loginForm.email, loginForm.password);
      
      if (result.success) {
        toast.success("Login successful!");
        onSuccess();
        onOpenChange(false);
        // Reset state for next time
        setCurrentStep('biometric');
        setBiometricVerified(false);
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!biometricVerified) {
      toast.error("Please complete biometric verification first");
      return;
    }

    setIsLoading(true);
    setError("");

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await mockAuthService.register(
        registerForm.email, 
        registerForm.password, 
        registerForm.name
      );
      
      if (result.success) {
        toast.success("Registration successful! Please check your email for verification.");
        setRegisterForm({ email: "", password: "", confirmPassword: "", name: "" });
        // Reset state for next time
        setCurrentStep('biometric');
        setBiometricVerified(false);
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  const renderBiometricStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-16 h-16 mx-auto text-primary mb-4" />
        <h3 className="text-xl font-semibold mb-2">Biometric Verification Required</h3>
        <p className="text-muted-foreground">
          Complete multi-factor biometric verification before accessing your account
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Required Verification Steps:</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Fingerprint className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Fingerprint Authentication</p>
                <p className="text-muted-foreground text-xs">Secure biometric access</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Face Recognition</p>
                <p className="text-muted-foreground text-xs">Facial identity verification</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Aadhaar Verification</p>
                <p className="text-muted-foreground text-xs">Government ID verification</p>
              </div>
            </div>
          </div>
        </div>

        {biometricVerified && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-success">
              Biometric verification completed successfully! You can now proceed to login.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {!biometricVerified ? (
            <Button onClick={handleStartBiometric} variant="hero" className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Start Biometric Verification
            </Button>
          ) : (
            <Button onClick={() => setCurrentStep('auth')} variant="hero" className="w-full">
              <ArrowRight className="w-4 h-4 mr-2" />
              Proceed to Login
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Secure Voting Access
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'biometric' ? (
          renderBiometricStep()
        ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              {biometricVerified && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-success">
                    Biometric verification completed! You can now login securely.
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                <strong>Demo Credentials:</strong><br />
                Email: voter1@example.com<br />
                Password: password123
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !biometricVerified}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {!biometricVerified && <Shield className="mr-2 h-4 w-4" />}
                  {!biometricVerified ? "Complete Biometric Verification First" : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              {biometricVerified && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-success">
                    Biometric verification completed! You can now register securely.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      className="pl-10"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !biometricVerified}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {!biometricVerified && <Shield className="mr-2 h-4 w-4" />}
                  {!biometricVerified ? "Complete Biometric Verification First" : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        <BiometricVerification 
          isOpen={showBiometricDialog}
          onClose={() => setShowBiometricDialog(false)}
          onComplete={handleBiometricComplete}
          pollTitle="Account Access"
        />
      </DialogContent>
    </Dialog>
  );
};