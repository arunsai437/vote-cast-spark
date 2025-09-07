import { VoteRecord } from "@/types/auth";
import { mockAuthService } from "./mockAuth";

class VoteValidationService {
  private voteRecords: VoteRecord[] = [];
  
  constructor() {
    // Load vote records from localStorage
    const savedRecords = localStorage.getItem('vote_records');
    if (savedRecords) {
      this.voteRecords = JSON.parse(savedRecords);
    }
  }

  canUserVote(pollId: string): { canVote: boolean; reason?: string } {
    const user = mockAuthService.getCurrentUser();
    
    if (!user) {
      return { canVote: false, reason: 'User not authenticated' };
    }

    if (!user.isVerified) {
      return { canVote: false, reason: 'Email not verified' };
    }

    // Check if user already voted
    const existingVote = this.voteRecords.find(
      record => record.userId === user.id && record.pollId === pollId
    );
    
    if (existingVote) {
      return { canVote: false, reason: 'Already voted in this poll' };
    }

    // Rate limiting - max 5 votes per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentVotes = this.voteRecords.filter(
      record => record.userId === user.id && new Date(record.timestamp) > oneHourAgo
    );

    if (recentVotes.length >= 5) {
      return { canVote: false, reason: 'Rate limit exceeded. Max 5 votes per hour' };
    }

    return { canVote: true };
  }

  recordVote(pollId: string, option: string): boolean {
    const user = mockAuthService.getCurrentUser();
    if (!user) return false;

    const validation = this.canUserVote(pollId);
    if (!validation.canVote) {
      console.warn('Vote blocked:', validation.reason);
      return false;
    }

    const voteRecord: VoteRecord = {
      userId: user.id,
      pollId,
      option,
      timestamp: new Date(),
      ipAddress: this.getMockIP()
    };

    this.voteRecords.push(voteRecord);
    this.saveToStorage();

    console.log('Vote recorded:', voteRecord);
    return true;
  }

  getVoteRecords(pollId?: string): VoteRecord[] {
    if (pollId) {
      return this.voteRecords.filter(record => record.pollId === pollId);
    }
    return this.voteRecords;
  }

  private getMockIP(): string {
    // Simulate IP address for demo
    return `192.168.1.${Math.floor(Math.random() * 255)}`;
  }

  private saveToStorage(): void {
    localStorage.setItem('vote_records', JSON.stringify(this.voteRecords));
  }

  // Security monitoring
  detectSuspiciousActivity(): Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }> {
    const alerts = [];
    
    // Check for rapid voting patterns
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const userVoteCounts = new Map<string, number>();
    this.voteRecords
      .filter(record => new Date(record.timestamp) > fiveMinutesAgo)
      .forEach(record => {
        userVoteCounts.set(record.userId, (userVoteCounts.get(record.userId) || 0) + 1);
      });

    userVoteCounts.forEach((count, userId) => {
      if (count > 3) {
        alerts.push({
          type: 'rapid_voting',
          message: `User ${userId} voted ${count} times in 5 minutes`,
          severity: 'high' as const
        });
      }
    });

    // Check for IP clustering
    const ipCounts = new Map<string, number>();
    this.voteRecords.forEach(record => {
      ipCounts.set(record.ipAddress, (ipCounts.get(record.ipAddress) || 0) + 1);
    });

    ipCounts.forEach((count, ip) => {
      if (count > 10) {
        alerts.push({
          type: 'ip_clustering',
          message: `IP ${ip} has ${count} votes - possible bot activity`,
          severity: 'medium' as const
        });
      }
    });

    return alerts;
  }
}

export const voteValidationService = new VoteValidationService();