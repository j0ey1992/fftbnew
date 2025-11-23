'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePartners } from '@/hooks/usePartners';
import { PartnerProject } from '@/lib/api/endpoints/quests';

interface ProjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelected: (projectId: string) => void;
}

export default function ProjectSelectionModal({
  isOpen,
  onClose,
  onProjectSelected
}: ProjectSelectionModalProps) {
  const router = useRouter();
  const { getPartnerProjects, loading, error } = usePartners();
  
  const [projects, setProjects] = useState<PartnerProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch projects when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  // Fetch projects from API
  const fetchProjects = async () => {
    setLoadingProjects(true);
    setErrorMessage(null);
    
    try {
      const projectsData = await getPartnerProjects();
      setProjects(projectsData);
    } catch (err: any) {
      console.error('Error fetching projects for selection:', err);
      setErrorMessage(err.message || 'Failed to load projects. Please try again.');
    } finally {
      setLoadingProjects(false);
    }
  };

  // Handle project selection
  const handleSelectProject = (projectId: string) => {
    if (!projectId) {
      console.error('ProjectSelectionModal: Attempted to select project with empty ID');
      return;
    }
    
    console.log('ProjectSelectionModal: Selected project with ID:', projectId);
    onProjectSelected(projectId);
    onClose();
  };

  // Handle create project
  const handleCreateProject = () => {
    router.push('/partner-dashboard/create-project');
    onClose();
  };

  // Filter projects based on search query
  const filteredProjects = searchQuery
    ? projects.filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              className="bg-[#0a1e3d] border border-blue-500/30 rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden z-10"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Modal header */}
              <div className="p-5 border-b border-blue-500/20 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Select Project for Quest</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Search input */}
              <div className="p-4 border-b border-blue-500/20">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0a1a2f] border border-blue-500/30 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Modal content */}
              <div className="overflow-y-auto max-h-[50vh]">
                {loadingProjects ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : errorMessage ? (
                  <div className="p-6 text-center">
                    <div className="text-red-400 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Error Loading Projects</h3>
                    <p className="text-gray-400 mb-4">{errorMessage}</p>
                    <button
                      onClick={fetchProjects}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="p-6 text-center">
                    {searchQuery ? (
                      <>
                        <p className="text-gray-300 mb-2">No projects found matching "{searchQuery}"</p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Clear search
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-blue-400 mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No Projects Yet</h3>
                        <p className="text-gray-400 mb-4">Create your first project to start building quests.</p>
                        <button
                          onClick={handleCreateProject}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                        >
                          Create Project
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredProjects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => {
                          if (project.id) {
                            handleSelectProject(project.id);
                          } else {
                            console.error('ProjectSelectionModal: Project has no ID:', project);
                          }
                        }}
                        className="w-full text-left p-3 hover:bg-blue-600/20 rounded-lg transition-colors mb-1 flex items-center"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex-shrink-0 mr-3">
                          {project.logo ? (
                            <img src={project.logo} alt={project.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold">
                              {project.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{project.name}</h3>
                          <p className="text-gray-400 text-sm truncate max-w-[250px]">
                            {project.description || 'No description'}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                            {project.embeddedQuests?.length || 0} Quests
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Modal footer */}
              <div className="p-4 border-t border-blue-500/20 flex justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Project
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}