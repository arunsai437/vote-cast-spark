import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Eye, Users, Clock, Activity } from "lucide-react";
import { mockAuthService } from "@/services/mockAuth";
import { voteValidationService } from "@/services/voteValidation";

interface SecurityMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityMonitor = ({ isOpen, onClose }: SecurityMonitorProps) => {
  const [alerts, setAlerts] = useState<Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }>>([]);
  const [voteRecords, setVoteRecords] = useState(voteValidationService.getVoteRecords());
  const [securityLogs, setSecurityLogs] = useState(mockAuthService.getSecurityLogs());

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setAlerts(voteValidationService.detectSuspiciousActivity());
        setVoteRecords(voteValidationService.getVoteRecords());
        setSecurityLogs(mockAuthService.getSecurityLogs());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
    }
  };

  const getUniqueVoters = () => {
    const uniqueUsers = new Set(voteRecords.map(record => record.userId));
    return uniqueUsers.size;
  };

  const getRecentActivity = () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return voteRecords.filter(record => new Date(record.timestamp) > oneHourAgo);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Security Monitor</h2>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{voteRecords.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Voters</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getUniqueVoters()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Hour</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getRecentActivity().length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Security Alerts */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-muted-foreground">No security alerts detected</p>
              ) : (
                alerts.map((alert, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>{alert.message}</span>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Vote Records */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Recent Vote Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {voteRecords.slice(-10).reverse().map((record, index) => (
                  <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">User {record.userId}</span>
                      <span>voted for "{record.option}"</span>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Security Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {securityLogs.slice(-15).reverse().map((log, index) => (
                  <div key={index} className="text-sm p-2 bg-muted/50 rounded">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{log.type}</Badge>
                      <span className="text-muted-foreground text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1">{log.message}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};