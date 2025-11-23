'use client';

import { useState, FormEvent } from 'react';
import { isValidUrl } from '@/utils/urlUtils';
import { Requirement } from '@/types';

interface LinkProofProps {
  onSubmit: (result: { result: string }) => void;
  onError?: (error: string) => void;
  requirement?: Requirement;
  className?: string;
}

export default function LinkProof({ onSubmit, onError, requirement, className = '' }: LinkProofProps) {
  const [link, setLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get placeholder text based on requirement type
  const getPlaceholder = () => {
    if (!requirement) return 'Enter URL (e.g., https://example.com)';
    
    switch (requirement.type) {
      case 'twitter_like':
      case 'twitter_retweet':
      case 'twitter_comment':
        return 'Enter Twitter/X post URL';
      case 'discord':
        return 'Enter Discord invite or message URL';
      case 'reddit':
        return 'Enter Reddit post or comment URL';
      case 'youtube':
        return 'Enter YouTube video URL';
      case 'tiktok':
        return 'Enter TikTok video URL';
      case 'telegram':
        return 'Enter Telegram channel or message URL';
      case 'website':
        return 'Enter website URL';
      default:
        return 'Enter URL (e.g., https://example.com)';
    }
  };

  // Get helper text based on requirement type
  const getHelperText = () => {
    if (!requirement) return 'Please provide a valid URL as proof';
    
    switch (requirement.type) {
      case 'twitter_like':
        return 'Provide the URL of the tweet you liked';
      case 'twitter_retweet':
        return 'Provide the URL of the tweet you retweeted';
      case 'twitter_comment':
        return 'Provide the URL of your comment on the tweet';
      case 'discord':
        return 'Provide the Discord invite or message URL';
      case 'reddit':
        return 'Provide the URL of the Reddit post or your comment';
      case 'youtube':
        return 'Provide the URL of the YouTube video';
      case 'tiktok':
        return 'Provide the URL of the TikTok video';
      case 'telegram':
        return 'Provide the URL of the Telegram channel or message';
      case 'website':
        return 'Provide the URL of the website you visited';
      default:
        return 'Please provide a valid URL as proof';
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError(null);
    
    // Validate URL
    if (!link.trim()) {
      const errorMsg = 'Please enter a URL';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }
    
    // Check if URL is valid
    if (!isValidUrl(link)) {
      const errorMsg = 'Please enter a valid URL';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }
    
    // If there's a requirement with a specific domain, validate against it
    if (requirement?.domain) {
      const url = new URL(link);
      if (!url.hostname.includes(requirement.domain)) {
        const errorMsg = `URL must be from ${requirement.domain}`;
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      // Submit the link
      onSubmit({ result: link });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit link';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="link-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link Proof
          </label>
          
          <div className="relative">
            <input
              id="link-input"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={getPlaceholder()}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              disabled={isSubmitting}
            />
            
            {link && (
              <button
                type="button"
                onClick={() => setLink('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            )}
          </div>
          
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {getHelperText()}
          </p>
        </div>
        
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || !link.trim()}
          className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Link'}
        </button>
      </form>
    </div>
  );
}
