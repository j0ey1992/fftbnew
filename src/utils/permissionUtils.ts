/**
 * Permission utilities for role-based access control
 */

import { isAdmin, isProject } from '@/lib/api/auth';
import { getCurrentUserWalletAddress } from '@/lib/api/auth';
import { normalizeAddress } from './addressUtils';
import { permissionDebug } from './debugUtils';

/**
 * Check if the current user has admin privileges
 * @returns Promise with boolean indicating if user is an admin
 */
export async function hasAdminPermission(): Promise<boolean> {
  try {
    permissionDebug.checkStart('admin', 'hasAdminPermission');
    const isAdminResult = await isAdmin();
    permissionDebug.checkResult('admin', isAdminResult, 'hasAdminPermission');
    return isAdminResult;
  } catch (error) {
    permissionDebug.error('hasAdminPermission', 'Error checking admin permission', error);
    return false;
  }
}

/**
 * Check if the current user has project privileges
 * @returns Promise with boolean indicating if user is a project owner
 */
export async function hasProjectPermission(): Promise<boolean> {
  try {
    permissionDebug.checkStart('project', 'hasProjectPermission');
    const isProjectResult = await isProject();
    permissionDebug.checkResult('project', isProjectResult, 'hasProjectPermission');
    return isProjectResult;
  } catch (error) {
    permissionDebug.error('hasProjectPermission', 'Error checking project permission', error);
    return false;
  }
}

/**
 * Check if the current user has either admin or project privileges
 * @returns Promise with boolean indicating if user has admin or project privileges
 */
export async function hasAdminOrProjectPermission(): Promise<boolean> {
  try {
    permissionDebug.checkStart('adminOrProject', 'hasAdminOrProjectPermission');
    const isAdminResult = await isAdmin();
    const isProjectResult = await isProject();
    const result = isAdminResult || isProjectResult;
    
    permissionDebug.checkResult('adminOrProject', result, 'hasAdminOrProjectPermission', {
      isAdmin: isAdminResult,
      isProject: isProjectResult
    });
    
    return result;
  } catch (error) {
    permissionDebug.error('hasAdminOrProjectPermission', 'Error checking admin or project permission', error);
    return false;
  }
}

/**
 * Check if the current user owns a specific project
 * @param projectOwnerAddress The wallet address of the project owner
 * @returns Promise with boolean indicating if user owns the project
 */
export async function isProjectOwner(projectOwnerAddress: string): Promise<boolean> {
  try {
    permissionDebug.checkStart('projectOwner', 'isProjectOwner');
    
    // If user has admin privileges, they can access any project
    const isAdminResult = await isAdmin();
    if (isAdminResult) {
      permissionDebug.checkResult('projectOwner', true, 'isProjectOwner', {
        reason: 'Admin privileges override',
        projectOwnerAddress
      });
      return true;
    }
    
    // Get the current user's wallet address
    const userWalletAddress = await getCurrentUserWalletAddress();
    permissionDebug.userInfo('isProjectOwner', userWalletAddress || undefined);
    
    if (!userWalletAddress) {
      permissionDebug.checkResult('projectOwner', false, 'isProjectOwner', {
        reason: 'No wallet address found',
        projectOwnerAddress
      });
      return false;
    }
    
    // Compare normalized addresses
    const normalizedUserAddress = normalizeAddress(userWalletAddress);
    const normalizedOwnerAddress = normalizeAddress(projectOwnerAddress);
    const isOwner = normalizedUserAddress === normalizedOwnerAddress;
    
    permissionDebug.checkResult('projectOwner', isOwner, 'isProjectOwner', {
      normalizedUserAddress,
      normalizedOwnerAddress,
      projectOwnerAddress
    });
    
    return isOwner;
  } catch (error) {
    permissionDebug.error('isProjectOwner', 'Error checking project ownership', error);
    return false;
  }
}

/**
 * Check if the current user can manage a specific contract
 * @param contractOwnerAddress The wallet address of the contract owner
 * @returns Promise with boolean indicating if user can manage the contract
 */
export async function canManageContract(contractOwnerAddress: string): Promise<boolean> {
  // This is essentially the same as isProjectOwner, but with a more specific name
  return isProjectOwner(contractOwnerAddress);
}

/**
 * Check if the current user can access admin features
 * @returns Promise with boolean indicating if user can access admin features
 */
export async function canAccessAdminFeatures(): Promise<boolean> {
  return hasAdminPermission();
}

/**
 * Check if the current user can access project features
 * @returns Promise with boolean indicating if user can access project features
 */
export async function canAccessProjectFeatures(): Promise<boolean> {
  return hasProjectPermission();
}

/**
 * Check if the current user can create a new project
 * @returns Promise with boolean indicating if user can create a project
 */
export async function canCreateProject(): Promise<boolean> {
  // Anyone with a wallet can create a project
  const userWalletAddress = await getCurrentUserWalletAddress();
  return !!userWalletAddress;
}

/**
 * Log permission check for audit purposes
 * @param permission The permission being checked
 * @param granted Whether the permission was granted
 * @param resource The resource being accessed (optional)
 */
export async function logPermissionCheck(
  permission: string,
  granted: boolean,
  resource?: string
): Promise<void> {
  try {
    const userWalletAddress = await getCurrentUserWalletAddress();
    
    // In a real implementation, this would send the log to the server
    console.log('Permission check:', {
      permission,
      granted,
      resource,
      userWalletAddress,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Implement server-side logging for permission checks
  } catch (error) {
    console.error('Error logging permission check:', error);
  }
}

/**
 * Add the current user as a collaborator to a project
 * @param projectId The ID of the project to add the user to
 * @returns Promise with boolean indicating success
 */
export async function addCurrentUserAsCollaborator(projectId: string): Promise<boolean> {
  try {
    console.log('COLLAB UTIL DEBUG: Starting addCurrentUserAsCollaborator for project:', projectId);
    permissionDebug.collaboratorAdd('addCurrentUserAsCollaborator', projectId);
    
    // Get the current user's wallet address directly from the DOM
    // This is a workaround for the getCurrentUserWalletAddress function not working correctly
    const appkitAddressElement = document.querySelector('[data-appkit-address]');
    const userWalletAddress = appkitAddressElement ? appkitAddressElement.getAttribute('data-appkit-address') : null;
    
    console.log('COLLAB UTIL DEBUG: Current user wallet address from DOM:', userWalletAddress);
    permissionDebug.userInfo('addCurrentUserAsCollaborator', userWalletAddress || undefined);
    
    if (!userWalletAddress) {
      // Fallback to the original method
      const fallbackAddress = await getCurrentUserWalletAddress();
      console.log('COLLAB UTIL DEBUG: Fallback wallet address:', fallbackAddress);
      
      if (!fallbackAddress) {
        console.log('COLLAB UTIL DEBUG: No wallet address found, cannot add as collaborator');
        permissionDebug.error('addCurrentUserAsCollaborator', 'No wallet address found');
        return false;
      }
      
      // Use the fallback address
      return await addCollaboratorWithAddress(projectId, fallbackAddress);
    }
    
    // Use the address from the DOM
    return await addCollaboratorWithAddress(projectId, userWalletAddress);
  } catch (error) {
    console.error('COLLAB UTIL DEBUG: Error adding collaborator:', error);
    permissionDebug.error('addCurrentUserAsCollaborator', 'Error adding collaborator', error);
    return false;
  }
}

/**
 * Helper function to add a collaborator with a specific wallet address
 * @param projectId The ID of the project to add the user to
 * @param userWalletAddress The wallet address to add as a collaborator
 * @returns Promise with boolean indicating success
 */
async function addCollaboratorWithAddress(projectId: string, userWalletAddress: string): Promise<boolean> {
  try {

    // Get the current project
    const endpoint = `/api/partners/projects/${projectId}`;
    console.log('COLLAB UTIL DEBUG: Fetching project data from endpoint:', endpoint);
    permissionDebug.apiRequest('addCurrentUserAsCollaborator', endpoint, 'GET');
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('COLLAB UTIL DEBUG: Project fetch response status:', response.status);
    
    if (!response.ok) {
      console.log('COLLAB UTIL DEBUG: Failed to fetch project, status:', response.status, response.statusText);
      permissionDebug.apiResponse('addCurrentUserAsCollaborator', endpoint, response.status, {
        statusText: response.statusText
      });
      return false;
    }

    const project = await response.json();
    console.log('COLLAB UTIL DEBUG: Project data received:', {
      id: project.id,
      name: project.name,
      ownerId: project.ownerId,
      collaboratorsCount: project.collaborators ? project.collaborators.length : 0,
      collaborators: project.collaborators
    });
    
    permissionDebug.apiResponse('addCurrentUserAsCollaborator', endpoint, response.status, {
      id: project.id,
      name: project.name,
      ownerId: project.ownerId,
      collaboratorsCount: project.collaborators ? project.collaborators.length : 0
    });
    
    // Create collaborators array if it doesn't exist
    const collaborators = project.collaborators || [];
    
    // Check if user is already a collaborator
    const normalizedUserAddress = normalizeAddress(userWalletAddress);
    const normalizedCollaborators = collaborators.map((c: any) =>
      typeof c === 'string' ? normalizeAddress(c) : c
    );
    
    // Also check if the project owner is the same as the current user
    const normalizedOwnerId = project.ownerId ? normalizeAddress(project.ownerId) : '';
    const isOwner = normalizedOwnerId === normalizedUserAddress;
    
    console.log('COLLAB UTIL DEBUG: Checking if already collaborator or owner:', {
      normalizedUserAddress,
      normalizedOwnerId,
      isOwner,
      normalizedCollaborators,
      isAlreadyCollaborator: normalizedCollaborators.includes(normalizedUserAddress)
    });
    
    // If user is the owner, they don't need to be added as a collaborator
    if (isOwner) {
      console.log('COLLAB UTIL DEBUG: User is the project owner, no need to add as collaborator');
      permissionDebug.collaboratorAdd('addCurrentUserAsCollaborator', projectId, userWalletAddress, true);
      permissionDebug.checkResult('collaborator', true, 'addCurrentUserAsCollaborator', {
        reason: 'User is the project owner',
        projectId,
        userWalletAddress
      });
      return true;
    }
    
    const isAlreadyCollaborator = normalizedCollaborators.includes(normalizedUserAddress);
    
    if (isAlreadyCollaborator) {
      console.log('COLLAB UTIL DEBUG: User is already a collaborator, no need to add');
      permissionDebug.collaboratorAdd('addCurrentUserAsCollaborator', projectId, userWalletAddress, true);
      permissionDebug.checkResult('collaborator', true, 'addCurrentUserAsCollaborator', {
        reason: 'Already a collaborator',
        projectId,
        userWalletAddress
      });
      return true;
    }
    
    // Add the user to collaborators
    collaborators.push(userWalletAddress);
    console.log('COLLAB UTIL DEBUG: Added user to collaborators array, new length:', collaborators.length);
    
    // Update the project with the new collaborators array
    console.log('COLLAB UTIL DEBUG: Updating project with new collaborators array:', {
      endpoint,
      method: 'PUT',
      collaboratorsCount: collaborators.length
    });
    
    permissionDebug.apiRequest('addCurrentUserAsCollaborator', endpoint, 'PUT', {
      collaboratorsCount: collaborators.length
    });
    
    const updateResponse = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collaborators }),
    });

    console.log('COLLAB UTIL DEBUG: Project update response status:', updateResponse.status);
    
    if (!updateResponse.ok) {
      console.log('COLLAB UTIL DEBUG: Failed to update project, status:', updateResponse.status, updateResponse.statusText);
      permissionDebug.apiResponse('addCurrentUserAsCollaborator', endpoint, updateResponse.status, {
        statusText: updateResponse.statusText
      });
      return false;
    }

    const result = await updateResponse.json();
    console.log('COLLAB UTIL DEBUG: Project update result:', result);
    permissionDebug.apiResponse('addCurrentUserAsCollaborator', endpoint, updateResponse.status, result);
    
    const success = result.success === true;
    console.log('COLLAB UTIL DEBUG: Collaborator add operation success:', success);
    permissionDebug.collaboratorAdd('addCurrentUserAsCollaborator', projectId, userWalletAddress, success);
    return success;
  } catch (error) {
    console.error('COLLAB UTIL DEBUG: Error adding collaborator with address:', error);
    permissionDebug.error('addCollaboratorWithAddress', 'Error adding collaborator', error);
    return false;
  }
}