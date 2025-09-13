import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Phone, Lock, User } from "lucide-react";
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
  
  // Login form
  const [loginForm, setLoginForm] = useState({
    phone: "9876543210", // Pre-filled for demo
    otp: "123456"
  });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    phone: "",
    name: "",
    otp: ""
  });
  
  const [otpSent, setOtpSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError("");

    try {
      const result = await mockAuthService.loginWithPhone(loginForm.phone, loginForm.otp);
      
      if (result.success) {
        toast.success("Login successful!");
        onSuccess();
        onOpenChange(false);
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!registerForm.phone || !registerForm.name) {
      setError("Please enter your name and phone number first");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Simulate sending OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpSent(true);
      toast.success("OTP sent to your phone number!");
      setError("");
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpSent) {
      await handleSendOtp();
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const result = await mockAuthService.registerWithPhone(
        registerForm.phone, 
        registerForm.name,
        registerForm.otp
      );
      
      if (result.success) {
        toast.success("Registration successful! You can now login.");
        setRegisterForm({ phone: "", name: "", otp: "" });
        setOtpSent(false);
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Secure Voting Access
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                <strong>Demo Credentials:</strong><br />
                Phone: 9876543210<br />
                OTP: 123456
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="pl-10"
                      value={loginForm.phone}
                      onChange={(e) => setLoginForm({...loginForm, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter OTP"
                      className="pl-10"
                      value={loginForm.otp}
                      onChange={(e) => setLoginForm({...loginForm, otp: e.target.value})}
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
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In with Phone
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                {!otpSent ? (
                  <>
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
                      <Label htmlFor="register-phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          className="pl-10"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
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
                      disabled={isLoading || !registerForm.phone || !registerForm.name}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send OTP
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                      <strong>OTP sent to:</strong> {registerForm.phone}<br />
                      <button 
                        type="button" 
                        onClick={() => setOtpSent(false)} 
                        className="text-primary underline mt-1"
                      >
                        Change phone number
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-otp">Enter OTP</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-otp"
                          type="text"
                          placeholder="Enter the 6-digit OTP"
                          className="pl-10"
                          value={registerForm.otp}
                          onChange={(e) => setRegisterForm({...registerForm, otp: e.target.value})}
                          maxLength={6}
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
                      disabled={isLoading || registerForm.otp.length !== 6}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify & Create Account
                    </Button>
                  </>
                )}
              </form>
            </TabsContent>
          </Tabs>
      </DialogContent>
    </Dialog>
  );
};