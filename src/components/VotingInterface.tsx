import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Vote, Users, Clock, CheckCircle2, Shield, AlertTriangle, Fingerprint } from "lucide-react";
import { Poll } from "./VotingDashboard";
import { voteValidationService } from "@/services/voteValidation";
import { mockAuthService } from "@/services/mockAuth";
import { BiometricVerification } from "./BiometricVerification";
import { toast } from "sonner";

interface VotingInterfaceProps {
  poll: Poll;
  onVote: (pollId: string, option: string) => void;
  onBack: () => void;
}

export const VotingInterface = ({ poll, onVote, onBack }: VotingInterfaceProps) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [showBiometricVerification, setShowBiometricVerification] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(false);

  const currentUser = mockAuthService.getCurrentUser();
  
  // Check if user can vote when component loads
  const voteValidation = voteValidationService.canUserVote(poll.id);

  const handleStartBiometricVerification = () => {
    if (!selectedOption) {
      toast.error("Please select an option before proceeding to verification");
      return;
    }
    setShowBiometricVerification(true);
  };

  const handleBiometricComplete = (verified: boolean) => {
    setBiometricVerified(verified);
    if (verified) {
      handleVote();
    }
  };

  const handleVote = async () => {
    if (!selectedOption || hasVoted || isSubmitting) return;

    setIsSubmitting(true);
    setValidationError("");

    // Double-check validation
    const validation = voteValidationService.canUserVote(poll.id);
    if (!validation.canVote) {
      setValidationError(validation.reason || "Cannot vote at this time");
      setIsSubmitting(false);
      return;
    }

    // Record the vote
    const success = voteValidationService.recordVote(poll.id, selectedOption);
    if (!success) {
      setValidationError("Failed to record vote. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // Update the poll data
    onVote(poll.id, selectedOption);
    setHasVoted(true);
    setIsSubmitting(false);
    toast.success("Vote submitted successfully!");
  };

  const getPercentage = (votes: number) => {
    return poll.totalVotes > 0 ? ((votes / poll.totalVotes) * 100).toFixed(1) : "0";
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 hover:bg-accent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-3xl mx-auto">
          <Card className="gradient-card shadow-large">
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {poll.totalVotes} total votes
                </div>
                {poll.endDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Ends {poll.endDate.toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div>
                <CardTitle className="text-3xl mb-3">{poll.title}</CardTitle>
                {poll.description && (
                  <CardDescription className="text-lg">
                    {poll.description}
                  </CardDescription>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* User Authentication Status */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-success" />
                  <div className="flex-1">
                    <p className="font-medium text-success">Authenticated Voter</p>
                    <p className="text-sm text-muted-foreground">
                      Logged in as: {currentUser?.name} ({currentUser?.email})
                    </p>
                  </div>
                  {biometricVerified && (
                    <div className="flex items-center gap-1 text-xs text-success">
                      <Fingerprint className="w-3 h-3" />
                      Biometric Verified
                    </div>
                  )}
                </div>
              </div>

              {/* Vote Validation Status */}
              {!voteValidation.canVote && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {voteValidation.reason}
                  </AlertDescription>
                </Alert>
              )}

              {validationError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {validationError}
                  </AlertDescription>
                </Alert>
              )}

              {!hasVoted && poll.status === 'active' && voteValidation.canVote ? (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select your choice:</h3>
                    
                    <RadioGroup 
                      value={selectedOption} 
                      onValueChange={setSelectedOption}
                      className="space-y-3"
                    >
                      {poll.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label 
                            htmlFor={`option-${index}`} 
                            className="flex-1 cursor-pointer text-base font-medium"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        For maximum security, biometric verification is required before voting. This includes fingerprint, face recognition, and Aadhaar verification.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-center">
                      <Button
                        variant="hero"
                        size="lg"
                        onClick={handleStartBiometricVerification}
                        disabled={!selectedOption || isSubmitting || !voteValidation.canVote}
                        className="min-w-[250px] text-lg gap-3"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Fingerprint className="w-5 h-5" />
                            Verify & Cast Vote
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {hasVoted && (
                    <div className="text-center p-6 bg-success-light rounded-lg border border-success/20">
                      <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-success mb-2">Vote Submitted Successfully!</h3>
                      <p className="text-success/80">Thank you for participating in this poll.</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Current Results:</h3>
                    
                    <div className="space-y-4">
                      {poll.options.map((option, index) => {
                        const votes = poll.votes[option] || 0;
                        const percentage = parseFloat(getPercentage(votes));
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{option}</span>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{votes} votes</span>
                                <span>({percentage}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-3">
                              <div 
                                className="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <BiometricVerification 
          isOpen={showBiometricVerification}
          onClose={() => setShowBiometricVerification(false)}
          onComplete={handleBiometricComplete}
          pollTitle={poll.title}
        />
      </div>
    </div>
  );
};