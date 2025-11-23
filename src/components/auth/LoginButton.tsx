'use client'

import { useState } from 'react';
import { signInWithGoogle, getCurrentUserIdToken } from '@/lib/auth-service';
import { refreshAuthToken } from '@/lib/auth-service';

interface LoginButtonProps {
  className?: string;
  onLoginSuccess?: () => void;
}

export default function LoginButton({ className = '', onLoginSuccess }: LoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign in with Google
      await signInWithGoogle();
      
      // Get the token and ensure it's stored in localStorage
      await getCurrentUserIdToken();
      
      // Call the onLoginSuccess callback if provided
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center"
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
        ) : (
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <path d="M11 7h2v6h-2zm0 8h2v2h-2z" />
          </svg>
        )}
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      
      {error && (
        <div className="text-red-500 mt-2 text-sm">{error}</div>
      )}
    </div>
  );
}
