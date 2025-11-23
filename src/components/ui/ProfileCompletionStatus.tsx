'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { checkProfileCompletion, PROFILE_REQUIREMENTS } from '@/lib/profileUtils';
import useDeviceType from '@/hooks/useDeviceType';
import useUserProfile from '@/hooks/useUserProfile';
import useEscrow from '@/hooks/useEscrow';

interface ProfileCompletionStatusProps {
  user?: User | null;
  showRequiredOnly?: boolean;
  className?: string;
  onComplete?: () => void;
}

/**
 * Component to display profile completion status
 */
export default function ProfileCompletionStatus({
  user: propUser,
  showRequiredOnly = false,
  className = '',
  onComplete
}: ProfileCompletionStatusProps) {
  const { user: hookUser } = useUserProfile();
  const { deviceType } = useDeviceType();
  const [completionStatus, setCompletionStatus] = useState<{
    isComplete: boolean;
    missingFields: string[];
    percentComplete: number;
  }>({ isComplete: false, missingFields: [], percentComplete: 0 });
  const [escrowRecords, setEscrowRecords] = useState<any[]>([]);
  const { getUserEscrowRecords } = useEscrow();
  
  // Use user from props if provided, otherwise use user from hook
  const user = propUser || hookUser;
  
  // Update completion status when user or device type changes
  useEffect(() => {
    if (user) {
      const status = checkProfileCompletion(user, deviceType);
      setCompletionStatus(status);
      
      // Call onComplete callback if profile is complete
      if (status.isComplete && onComplete) {
        onComplete();
      }
      
      // Fetch escrow records if user is authenticated
      const fetchEscrowRecords = async () => {
        try {
          const records = await getUserEscrowRecords();
          setEscrowRecords(records || []);
        } catch (err) {
          console.error('Error fetching escrow records:', err);
        }
      };
      
      fetchEscrowRecords();
    }
  }, [user, deviceType, onComplete, getUserEscrowRecords]);
  
  // Field labels for display
  const fieldLabels: Record<string, string> = {
    displayName: 'Display Name',
    bio: 'Bio',
    profilePicture: 'Profile Picture'
  };
  
  // Get all fields based on device type
  const allFields = [
    ...PROFILE_REQUIREMENTS[deviceType].required,
    ...PROFILE_REQUIREMENTS[deviceType].optional
  ];
  
  // Filter fields based on showRequiredOnly
  const fieldsToShow = showRequiredOnly
    ? PROFILE_REQUIREMENTS[deviceType].required
    : allFields;
  
  if (!user) {
    return (
      <div className={`p-4 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Connect your wallet to view profile completion status
        </p>
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Escrow Records Section (if any) */}
      {escrowRecords.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <div className="w-1.5 h-5 bg-yellow-500 rounded-full mr-3"></div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              Pending Escrow Rewards ({escrowRecords.length})
            </h3>
          </div>
          
          <div className="space-y-2">
            {escrowRecords.slice(0, 3).map((record) => (
              <div
                key={record.id}
                className={`p-3 rounded-lg border ${
                  record.status === 'pending'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : record.status === 'verified'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : record.status === 'released'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      record.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300'
                        : record.status === 'verified'
                          ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                          : record.status === 'released'
                            ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300'
                    }`}>
                      {record.status === 'pending' && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {record.status === 'verified' && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                      {record.status === 'released' && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {record.status === 'rejected' && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                        {record.questTitle || 'Quest Reward'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {record.reward} {record.tokenSymbol}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs px-2 py-1 rounded capitalize font-medium text-center min-w-[80px] whitespace-nowrap
                      ${record.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30' :
                      record.status === 'verified' ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30' :
                      record.status === 'released' ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' :
                      'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'}">
                      {record.status}
                    </div>
                  </div>
                </div>
                
                {record.status === 'pending' && !record.verificationLink && (
                  <div className="mt-2">
                    <a
                      href={`/profile?tab=escrow&id=${record.id}`}
                      className="text-xs text-center block w-full py-1.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded font-medium"
                    >
                      Verify to receive reward
                    </a>
                  </div>
                )}
              </div>
            ))}
            
            {escrowRecords.length > 3 && (
              <a
                href="/profile?tab=escrow"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline block text-center"
              >
                View all {escrowRecords.length} escrow records
              </a>
            )}
          </div>
        </div>
      )}
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700 dark:text-gray-300">
            Profile Completion
          </span>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {completionStatus.percentComplete}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              completionStatus.isComplete 
                ? 'bg-green-500' 
                : 'bg-blue-500'
            }`}
            style={{ width: `${completionStatus.percentComplete}%` }}
          ></div>
        </div>
      </div>
      
      {/* Field Status List */}
      <div className="space-y-2">
        {fieldsToShow.map(field => {
          const isRequired = PROFILE_REQUIREMENTS[deviceType].required.includes(field);
          const isComplete = !!user[field as keyof User];
          
          return (
            <div 
              key={field}
              className={`flex items-center justify-between p-2 rounded-lg ${
                isComplete 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30' 
                  : isRequired
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30'
                    : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                  isComplete 
                    ? 'bg-green-500' 
                    : isRequired
                      ? 'bg-yellow-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {isComplete ? (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {fieldLabels[field] || field}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isRequired ? 'Required' : 'Optional'}
                  </p>
                </div>
              </div>
              <div>
                {isComplete ? (
                  <span className="text-xs text-green-500 dark:text-green-400">
                    Complete
                  </span>
                ) : (
                  <span className="text-xs text-yellow-500 dark:text-yellow-400">
                    {isRequired ? 'Required' : 'Incomplete'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Complete Profile Button (if not complete) */}
      {!completionStatus.isComplete && (
        <a
          href="/profile"
          className="block w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-center rounded-lg transition-colors"
          onClick={() => {
            console.log("[DEBUG] ProfileCompletionStatus - 'Complete Your Profile' button clicked");
            console.log("[DEBUG] ProfileCompletionStatus - Navigating to /profile");
          }}
        >
          Complete Your Profile
        </a>
      )}
    </div>
  );
}