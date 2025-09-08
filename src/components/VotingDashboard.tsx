import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Vote, Users, BarChart3, Clock, CheckCircle, Shield, LogOut } from "lucide-react";
import { CreatePollDialog } from "./CreatePollDialog";
import { VotingInterface } from "./VotingInterface";
import { ResultsView } from "./ResultsView";
import { LoginDialog } from "./LoginDialog";
import { SecurityMonitor } from "./SecurityMonitor";
import { mockAuthService } from "@/services/mockAuth";
import { User } from "@/types/auth";
import { toast } from "sonner";

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: string[];
  votes: { [key: string]: number };
  totalVotes: number;
  status: 'active' | 'closed' | 'draft';
  endDate?: Date;
  createdBy: string;
}

const VotingDashboard = () => {
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: "1",
      title: "Favorite Programming Language",
      description: "Vote for your preferred programming language for web development",
      options: ["JavaScript", "TypeScript", "Python", "Java"],
      votes: { "JavaScript": 45, "TypeScript": 32, "Python": 28, "Java": 15 },
      totalVotes: 120,
      status: 'active',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: "admin"
    },
    {
      id: "2", 
      title: "Office Return Policy",
      description: "What should be our new office attendance policy?",
      options: ["Fully Remote", "Hybrid (2-3 days)", "Full Time Office", "Flexible"],
      votes: { "Fully Remote": 67, "Hybrid (2-3 days)": 89, "Full Time Office": 12, "Flexible": 43 },
      totalVotes: 211,
      status: 'closed',
      createdBy: "hr"
    }
  ]);

  const [currentView, setCurrentView] = useState<'dashboard' | 'vote' | 'results'>('dashboard');
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSecurityMonitor, setShowSecurityMonitor] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = mockAuthService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleCreatePoll = (newPoll: Omit<Poll, 'id' | 'votes' | 'totalVotes'>) => {
    if (!mockAuthService.isAuthenticated()) {
      toast.error("Please login to create polls");
      setShowLoginDialog(true);
      return;
    }

    const poll: Poll = {
      ...newPoll,
      id: Date.now().toString(),
      votes: newPoll.options.reduce((acc, option) => ({ ...acc, [option]: 0 }), {}),
      totalVotes: 0
    };
    setPolls([...polls, poll]);
    setShowCreateDialog(false);
    toast.success("Poll created successfully!");
  };

  const handleVote = (pollId: string, option: string) => {
    setPolls(polls.map(poll => {
      if (poll.id === pollId) {
        return {
          ...poll,
          votes: { ...poll.votes, [option]: poll.votes[option] + 1 },
          totalVotes: poll.totalVotes + 1
        };
      }
      return poll;
    }));
  };

  const handleLoginSuccess = () => {
    const user = mockAuthService.getCurrentUser();
    setCurrentUser(user);
    toast.success(`Welcome back, ${user?.name}!`);
  };

  const handleLogout = () => {
    mockAuthService.logout();
    setCurrentUser(null);
    toast.success("Logged out successfully");
  };

  const handleVoteClick = (poll: Poll) => {
    if (!mockAuthService.isAuthenticated()) {
      toast.error("Please login to vote");
      setShowLoginDialog(true);
      return;
    }
    setSelectedPoll(poll);
    setCurrentView('vote');
  };

  const getStatusColor = (status: Poll['status']) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'closed': return 'bg-muted text-muted-foreground';
      case 'draft': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (currentView === 'vote' && selectedPoll) {
    return (
      <VotingInterface 
        poll={selectedPoll}
        onVote={handleVote}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'results' && selectedPoll) {
    return (
      <ResultsView 
        poll={selectedPoll}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Voting Dashboard</h1>
              <p className="text-muted-foreground mt-2">Manage and participate in polls and elections</p>
            </div>
            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {currentUser.name}
                    </Badge>
                    {currentUser.role === 'admin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSecurityMonitor(true)}
                      >
                        <Shield className="w-4 h-4" />
                        Security
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="hero" 
                    size="lg"
                    onClick={() => setShowCreateDialog(true)}
                    className="gap-3"
                  >
                    <Plus className="w-5 h-5" />
                    Create Poll
                  </Button>
                </>
              ) : (
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={() => setShowLoginDialog(true)}
                  className="gap-3"
                >
                  <Shield className="w-5 h-5" />
                  Login to Vote
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <Card key={poll.id} className="gradient-card shadow-medium hover:shadow-large transition-all duration-300">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <Badge className={getStatusColor(poll.status)}>
                    {poll.status.toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Users className="w-4 h-4" />
                    {poll.totalVotes} votes
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl">{poll.title}</CardTitle>
                  <CardDescription className="mt-2">{poll.description}</CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {poll.options.slice(0, 3).map((option, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{option}</span>
                      <span className="font-medium">{poll.votes[option]} votes</span>
                    </div>
                  ))}
                  {poll.options.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{poll.options.length - 3} more options</span>
                  )}
                </div>

                {poll.endDate && poll.status === 'active' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Ends {poll.endDate.toLocaleDateString()}
                  </div>
                )}

                <div className="flex gap-2">
                  {poll.status === 'active' ? (
                    <Button 
                      variant="vote" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleVoteClick(poll)}
                    >
                      <Vote className="w-4 h-4" />
                      {currentUser ? "Vote Now" : "Login to Vote"}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled className="flex-1">
                      <CheckCircle className="w-4 h-4" />
                      Voting Closed
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedPoll(poll);
                      setCurrentView('results');
                    }}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <CreatePollDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreatePoll={handleCreatePoll}
        />

        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          onSuccess={handleLoginSuccess}
        />

        <SecurityMonitor
          isOpen={showSecurityMonitor}
          onClose={() => setShowSecurityMonitor(false)}
        />
      </div>
    </div>
  );
};

export default VotingDashboard;