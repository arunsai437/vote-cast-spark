export interface BiometricCredential {
  id: string;
  userId: string;
  publicKey: string;
  counter: number;
  createdAt: Date;
}

export interface BiometricResult {
  success: boolean;
  credentialId?: string;
  error?: string;
}

class BiometricAuthService {
  private credentials: BiometricCredential[] = [];

  // Check if WebAuthn is supported
  isWebAuthnSupported(): boolean {
    return !!(navigator.credentials && window.PublicKeyCredential);
  }

  // Register fingerprint/biometric credential
  async registerBiometric(userId: string, userName: string): Promise<BiometricResult> {
    if (!this.isWebAuthnSupported()) {
      return { success: false, error: 'WebAuthn not supported on this device' };
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "VoteCast Spark",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: userName,
            displayName: userName,
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "preferred"
          },
          timeout: 60000,
          attestation: "direct"
        }
      }) as PublicKeyCredential;

      if (!credential) {
        return { success: false, error: 'Failed to create credential' };
      }

      // Store credential (in real app, this would be sent to server)
      const biometricCredential: BiometricCredential = {
        id: credential.id,
        userId,
        publicKey: 'mock_public_key_' + credential.id,
        counter: 0,
        createdAt: new Date()
      };

      this.credentials.push(biometricCredential);
      localStorage.setItem('biometric_credentials', JSON.stringify(this.credentials));

      return { success: true, credentialId: credential.id };
    } catch (error: any) {
      console.error('Biometric registration failed:', error);
      return { 
        success: false, 
        error: error.message || 'Biometric registration failed' 
      };
    }
  }

  // Authenticate using fingerprint/biometric
  async authenticateBiometric(userId: string): Promise<BiometricResult> {
    if (!this.isWebAuthnSupported()) {
      return { success: false, error: 'WebAuthn not supported on this device' };
    }

    // Load stored credentials
    const stored = localStorage.getItem('biometric_credentials');
    if (stored) {
      this.credentials = JSON.parse(stored);
    }

    const userCredentials = this.credentials.filter(c => c.userId === userId);
    if (userCredentials.length === 0) {
      return { success: false, error: 'No biometric credentials found. Please register first.' };
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const allowCredentials = userCredentials.map(cred => ({
        id: new TextEncoder().encode(cred.id),
        type: "public-key" as const,
        transports: ["internal"] as AuthenticatorTransport[]
      }));

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials,
          userVerification: "required",
          timeout: 60000
        }
      }) as PublicKeyCredential;

      if (!assertion) {
        return { success: false, error: 'Authentication failed' };
      }

      return { success: true, credentialId: assertion.id };
    } catch (error: any) {
      console.error('Biometric authentication failed:', error);
      return { 
        success: false, 
        error: error.message || 'Biometric authentication failed' 
      };
    }
  }

  // Check if user has registered biometric credentials
  hasRegisteredBiometric(userId: string): boolean {
    const stored = localStorage.getItem('biometric_credentials');
    if (stored) {
      this.credentials = JSON.parse(stored);
    }
    return this.credentials.some(c => c.userId === userId);
  }

  // Get user's biometric credentials
  getUserCredentials(userId: string): BiometricCredential[] {
    const stored = localStorage.getItem('biometric_credentials');
    if (stored) {
      this.credentials = JSON.parse(stored);
    }
    return this.credentials.filter(c => c.userId === userId);
  }
}

export const biometricAuthService = new BiometricAuthService();