'use client';

import { db } from './firebase-config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { Project, ComponentStyle } from '@/types/project';

// Collection references
const projectsCollection = collection(db, 'projects');

/**
 * Get all projects
 * @returns Promise with array of projects
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    const querySnapshot = await getDocs(
      query(projectsCollection, orderBy('createdAt', 'desc'))
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
}

/**
 * Get projects by owner address
 * @param ownerAddress Owner's wallet address
 * @returns Promise with array of projects
 */
export async function getProjectsByOwner(ownerAddress: string): Promise<Project[]> {
  try {
    // Convert address to lowercase for consistent querying
    const normalizedAddress = ownerAddress.toLowerCase();
    
    const querySnapshot = await getDocs(
      query(
        projectsCollection, 
        where('owner', '==', normalizedAddress),
        orderBy('createdAt', 'desc')
      )
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
  } catch (error) {
    console.error('Error getting projects by owner:', error);
    throw error;
  }
}

/**
 * Get a project by ID
 * @param projectId Project ID
 * @returns Promise with project data or null if not found
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  try {
    const projectDoc = await getDoc(doc(projectsCollection, projectId));
    
    if (projectDoc.exists()) {
      return {
        id: projectDoc.id,
        ...projectDoc.data()
      } as Project;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting project by ID:', error);
    throw error;
  }
}

/**
 * Get a project by slug
 * @param slug Project slug
 * @returns Promise with project data or null if not found
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const querySnapshot = await getDocs(
      query(projectsCollection, where('slug', '==', slug), limit(1))
    );
    
    if (!querySnapshot.empty) {
      const projectDoc = querySnapshot.docs[0];
      return {
        id: projectDoc.id,
        ...projectDoc.data()
      } as Project;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting project by slug:', error);
    throw error;
  }
}

/**
 * Create a new project
 * @param projectData Project data
 * @returns Promise with the new project ID
 */
export async function createProject(projectData: Omit<Project, 'id'>): Promise<string> {
  try {
    // Add timestamp
    const projectWithTimestamp = {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(projectsCollection, projectWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

/**
 * Update a project
 * @param projectId Project ID
 * @param updateData Data to update
 * @returns Promise that resolves when the update is complete
 */
export async function updateProject(
  projectId: string, 
  updateData: Partial<Project>
): Promise<void> {
  try {
    // Add updated timestamp
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: serverTimestamp()
    };
    
    // Special handling for componentStyles to ensure we don't lose deleted components
    if (updateData.componentStyles) {
      // Get the current project data
      const currentProject = await getProjectById(projectId);
      
      if (currentProject && currentProject.componentStyles) {
        // Create a map of existing styles by ID
        const existingStylesMap = new Map<string, ComponentStyle>();
        currentProject.componentStyles.forEach(style => {
          existingStylesMap.set(style.id, style);
        });
        
        // Update the map with new styles
        updateData.componentStyles.forEach(style => {
          existingStylesMap.set(style.id, style);
        });
        
        // Convert map back to array
        dataWithTimestamp.componentStyles = Array.from(existingStylesMap.values());
      }
    }
    
    await updateDoc(doc(projectsCollection, projectId), dataWithTimestamp);
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

/**
 * Delete a project
 * @param projectId Project ID
 * @returns Promise that resolves when the deletion is complete
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    await deleteDoc(doc(projectsCollection, projectId));
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

/**
 * Get featured projects
 * @param count Number of projects to get
 * @returns Promise with array of featured projects
 */
export async function getFeaturedProjects(count: number = 6): Promise<Project[]> {
  try {
    const querySnapshot = await getDocs(
      query(
        projectsCollection, 
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(count)
      )
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
  } catch (error) {
    console.error('Error getting featured projects:', error);
    throw error;
  }
}

/**
 * Get recent projects
 * @param count Number of projects to get
 * @returns Promise with array of recent projects
 */
export async function getRecentProjects(count: number = 6): Promise<Project[]> {
  try {
    const querySnapshot = await getDocs(
      query(
        projectsCollection,
        orderBy('createdAt', 'desc'),
        limit(count)
      )
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
  } catch (error) {
    console.error('Error getting recent projects:', error);
    throw error;
  }
}

/**
 * Get public projects
 * @param count Optional limit on number of projects to return
 * @returns Promise with array of public projects
 */
export async function getPublicProjects(count?: number): Promise<Project[]> {
  try {
    let projectQuery = query(
      projectsCollection,
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    // Add limit if specified
    if (count && count > 0) {
      projectQuery = query(projectQuery, limit(count));
    }
    
    const querySnapshot = await getDocs(projectQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
  } catch (error) {
    console.error('Error getting public projects:', error);
    throw error;
  }
}

/**
 * Update component styles for a project
 * @param projectId Project ID
 * @param styles Component styles to update
 * @returns Promise that resolves when the update is complete
 */
export async function updateComponentStyles(
  projectId: string,
  styles: ComponentStyle[]
): Promise<void> {
  try {
    // Get the current project data
    const currentProject = await getProjectById(projectId);
    
    if (!currentProject) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    // Create a map of existing styles by ID
    const existingStylesMap = new Map<string, ComponentStyle>();
    if (currentProject.componentStyles) {
      currentProject.componentStyles.forEach(style => {
        existingStylesMap.set(style.id, style);
      });
    }
    
    // Update the map with new styles
    styles.forEach(style => {
      existingStylesMap.set(style.id, style);
    });
    
    // Convert map back to array
    const updatedStyles = Array.from(existingStylesMap.values());
    
    // Update the project
    await updateDoc(doc(projectsCollection, projectId), {
      componentStyles: updatedStyles,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating component styles:', error);
    throw error;
  }
}

/**
 * Check if a slug is available (not already used by another project)
 * @param slug The slug to check
 * @returns Promise that resolves to true if the slug is available, false otherwise
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  try {
    // Normalize the slug (lowercase, remove special characters)
    const normalizedSlug = slug.toLowerCase().trim();
    
    // Check if a project with this slug already exists
    const querySnapshot = await getDocs(
      query(projectsCollection, where('slug', '==', normalizedSlug), limit(1))
    );
    
    // If the query returns no documents, the slug is available
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking slug availability:', error);
    throw error;
  }
}

/**
 * Update a project's theme
 * @param projectId Project ID
 * @param theme Theme data to update
 * @param ownerAddress Owner's wallet address (for authorization)
 * @returns Promise that resolves when the update is complete
 */
export async function updateProjectTheme(
  projectId: string,
  theme: Partial<Project['theme']>,
  ownerAddress?: string
): Promise<void> {
  try {
    // If owner address is provided, verify ownership
    if (ownerAddress) {
      const project = await getProjectById(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Check if the caller is the owner
      if (project.owner.toLowerCase() !== ownerAddress.toLowerCase()) {
        throw new Error('Unauthorized: Only the project owner can update the theme');
      }
    }
    
    // Update the project theme
    await updateDoc(doc(projectsCollection, projectId), {
      'theme': theme,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating project theme:', error);
    throw error;
  }
}

/**
 * Update a project's modules
 * @param projectId Project ID
 * @param modules Modules data to update
 * @param ownerAddress Owner's wallet address (for authorization)
 * @returns Promise that resolves when the update is complete
 */
export async function updateProjectModules(
  projectId: string,
  modules: Partial<Project['modules']>,
  ownerAddress?: string
): Promise<void> {
  try {
    // If owner address is provided, verify ownership
    if (ownerAddress) {
      const project = await getProjectById(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Check if the caller is the owner
      if (project.owner.toLowerCase() !== ownerAddress.toLowerCase()) {
        throw new Error('Unauthorized: Only the project owner can update modules');
      }
    }
    
    // Update the project modules
    await updateDoc(doc(projectsCollection, projectId), {
      'modules': modules,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating project modules:', error);
    throw error;
  }
}

/**
 * Update a project's content
 * @param projectId Project ID
 * @param content Content data to update
 * @param ownerAddress Owner's wallet address (for authorization)
 * @returns Promise that resolves when the update is complete
 */
export async function updateProjectContent(
  projectId: string,
  content: Partial<Project['content']>,
  ownerAddress?: string
): Promise<void> {
  try {
    // If owner address is provided, verify ownership
    if (ownerAddress) {
      const project = await getProjectById(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Check if the caller is the owner
      if (project.owner.toLowerCase() !== ownerAddress.toLowerCase()) {
        throw new Error('Unauthorized: Only the project owner can update content');
      }
    }
    
    // Update the project content
    await updateDoc(doc(projectsCollection, projectId), {
      'content': content,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating project content:', error);
    throw error;
  }
}

/**
 * Update a project's domains
 * @param projectId Project ID
 * @param domains Domain data to update
 * @param ownerAddress Owner's wallet address (for authorization)
 * @returns Promise that resolves when the update is complete
 */
export async function updateProjectDomain(
  projectId: string,
  domains: Partial<Project['domains']>,
  ownerAddress?: string
): Promise<void> {
  try {
    // If owner address is provided, verify ownership
    if (ownerAddress) {
      const project = await getProjectById(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Check if the caller is the owner
      if (project.owner.toLowerCase() !== ownerAddress.toLowerCase()) {
        throw new Error('Unauthorized: Only the project owner can update domains');
      }
    }
    
    // Update the project domains
    await updateDoc(doc(projectsCollection, projectId), {
      'domains': domains,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating project domains:', error);
    throw error;
  }
}

/**
 * Update a project's visibility
 * @param projectId Project ID
 * @param visibility Visibility settings to update
 * @param ownerAddress Owner's wallet address (for authorization)
 * @returns Promise that resolves when the update is complete
 */
export async function updateProjectVisibility(
  projectId: string,
  visibility: { isPublic: boolean },
  ownerAddress?: string
): Promise<void> {
  try {
    // If owner address is provided, verify ownership
    if (ownerAddress) {
      const project = await getProjectById(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Check if the caller is the owner
      if (project.owner.toLowerCase() !== ownerAddress.toLowerCase()) {
        throw new Error('Unauthorized: Only the project owner can update visibility');
      }
    }
    
    // Update the project visibility
    await updateDoc(doc(projectsCollection, projectId), {
      'isPublic': visibility.isPublic,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating project visibility:', error);
    throw error;
  }
}
