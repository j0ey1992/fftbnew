/**
 * Global authentication lock to prevent multiple concurrent authentication attempts
 * This prevents the bug where connecting a wallet creates multiple user accounts
 */

interface AuthLock {
  isAuthenticating: boolean;
  authPromise: Promise<void> | null;
  walletAddress: string | null;
}

class AuthenticationLock {
  private static instance: AuthenticationLock;
  private lock: AuthLock = {
    isAuthenticating: false,
    authPromise: null,
    walletAddress: null
  };

  private constructor() {}

  static getInstance(): AuthenticationLock {
    if (!AuthenticationLock.instance) {
      AuthenticationLock.instance = new AuthenticationLock();
    }
    return AuthenticationLock.instance;
  }

  /**
   * Acquire authentication lock for a specific wallet address
   * Returns a promise that resolves when authentication can proceed
   */
  async acquireLock(walletAddress: string): Promise<() => void> {
    // If already authenticating with the same wallet, wait for completion
    if (this.lock.isAuthenticating && this.lock.walletAddress === walletAddress && this.lock.authPromise) {
      console.log('WALLET DEBUG: Authentication already in progress for', walletAddress, '- waiting for completion');
      await this.lock.authPromise;
      throw new Error('Authentication already completed for this wallet');
    }

    // If authenticating with a different wallet, wait for current auth to complete
    if (this.lock.isAuthenticating && this.lock.authPromise) {
      console.log('WALLET DEBUG: Waiting for previous authentication to complete');
      await this.lock.authPromise;
    }

    // Acquire the lock
    this.lock.isAuthenticating = true;
    this.lock.walletAddress = walletAddress;

    let releaseLock: () => void;
    
    // Create a promise that will be resolved when authentication completes
    this.lock.authPromise = new Promise<void>((resolve) => {
      releaseLock = () => {
        this.lock.isAuthenticating = false;
        this.lock.authPromise = null;
        this.lock.walletAddress = null;
        resolve();
      };
    });

    console.log('WALLET DEBUG: Authentication lock acquired for', walletAddress);
    return releaseLock!;
  }

  /**
   * Check if authentication is currently in progress
   */
  isAuthenticating(): boolean {
    return this.lock.isAuthenticating;
  }

  /**
   * Check if authentication is in progress for a specific wallet
   */
  isAuthenticatingWallet(walletAddress: string): boolean {
    return this.lock.isAuthenticating && this.lock.walletAddress === walletAddress;
  }

  /**
   * Reset the lock (use with caution)
   */
  reset(): void {
    this.lock = {
      isAuthenticating: false,
      authPromise: null,
      walletAddress: null
    };
    console.log('WALLET DEBUG: Authentication lock reset');
  }
}

export const authLock = AuthenticationLock.getInstance();