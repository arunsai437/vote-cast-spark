import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Trophy, BarChart3, Download, Share2 } from "lucide-react";
import { Poll } from "./VotingDashboard";

interface ResultsViewProps {
  poll: Poll;
  onBack: () => void;
}

export const ResultsView = ({ poll, onBack }: ResultsViewProps) => {
  const getPercentage = (votes: number) => {
    return poll.totalVotes > 0 ? ((votes / poll.totalVotes) * 100).toFixed(1) : "0";
  };

  const sortedOptions = [...poll.options].sort((a, b) => (poll.votes[b] || 0) - (poll.votes[a] || 0));
  const winner = sortedOptions[0];

  const getStatusColor = (status: Poll['status']) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'closed': return 'bg-muted text-muted-foreground';
      case 'draft': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Poll Header */}
          <Card className="gradient-card shadow-large">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge className={getStatusColor(poll.status)}>
                  {poll.status.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {poll.totalVotes} total votes
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {poll.options.length} options
                  </div>
                </div>
              </div>
              
              <CardTitle className="text-2xl">{poll.title}</CardTitle>
              {poll.description && (
                <CardDescription className="text-base mt-2">
                  {poll.description}
                </CardDescription>
              )}
            </CardHeader>
          </Card>

          {/* Winner Highlight */}
          {poll.totalVotes > 0 && (
            <Card className="gradient-card shadow-medium border-success/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-warning" />
                  <h3 className="text-xl font-semibold">Leading Option</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">{winner}</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{getPercentage(poll.votes[winner])}%</div>
                    <div className="text-sm text-muted-foreground">{poll.votes[winner]} votes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Results */}
          <Card className="gradient-card shadow-medium">
            <CardHeader>
              <CardTitle className="text-xl">Detailed Results</CardTitle>
              <CardDescription>
                Complete breakdown of all votes cast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sortedOptions.map((option, index) => {
                  const votes = poll.votes[option] || 0;
                  const percentage = parseFloat(getPercentage(votes));
                  const isWinner = index === 0 && poll.totalVotes > 0;
                  
                  return (
                    <div key={option} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isWinner ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            #{index + 1}
                          </div>
                          <span className="font-medium text-lg">{option}</span>
                          {isWinner && (
                            <Trophy className="w-5 h-5 text-warning" />
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{percentage}%</div>
                          <div className="text-sm text-muted-foreground">{votes} votes</div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all duration-700 ease-out ${
                            isWinner ? 'bg-warning' : 'bg-primary'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {poll.totalVotes === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">No votes cast yet</p>
                  <p className="text-sm">Results will appear here once voting begins</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Poll Information */}
          <Card className="gradient-card shadow-medium">
            <CardHeader>
              <CardTitle className="text-xl">Poll Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-muted-foreground text-sm mb-1">Created By</h4>
                  <p className="capitalize">{poll.createdBy}</p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground text-sm mb-1">Status</h4>
                  <Badge className={getStatusColor(poll.status)}>
                    {poll.status.toUpperCase()}
                  </Badge>
                </div>
                {poll.endDate && (
                  <div>
                    <h4 className="font-medium text-muted-foreground text-sm mb-1">End Date</h4>
                    <p>{poll.endDate.toLocaleDateString()} at {poll.endDate.toLocaleTimeString()}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-muted-foreground text-sm mb-1">Total Participants</h4>
                  <p>{poll.totalVotes} people voted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};