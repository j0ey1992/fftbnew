import { motion } from 'framer-motion';
import Link from 'next/link';
import { PartnerProject } from '@/lib/api/endpoints/quests';

interface ProjectCardProps {
  project: PartnerProject;
  onClick?: (project: PartnerProject) => void;
  selected?: boolean;
  showControls?: boolean;
}

export default function ProjectCard({ 
  project, 
  onClick, 
  selected = false,
  showControls = true
}: ProjectCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(project);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-[#0a1e3d]/80 rounded-xl overflow-hidden border ${
        selected 
          ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
          : 'border-blue-500/20'
      } shadow-md transition-all duration-300 hover:shadow-lg`}
      onClick={handleClick}
    >
      {/* Project banner */}
      <div className="h-36 bg-center bg-cover relative overflow-hidden">
        {project.banner ? (
          <img 
            src={project.banner} 
            alt={`${project.name} banner`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <h2 className="text-xl font-bold text-white">{project.name}</h2>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1e3d]/90 to-transparent"></div>
      </div>
      
      <div className="p-4 relative">
        {/* Project logo and title */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-blue-600 flex-shrink-0 border-2 border-[#0a1e3d] -mt-10 relative z-10">
            {project.logo ? (
              <img 
                src={project.logo} 
                alt={`${project.name} logo`} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                {project.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="-mt-4">
            <h3 className="text-lg font-bold text-white">{project.name}</h3>
            <p className="text-gray-300 text-sm line-clamp-2 mt-1">{project.description}</p>
          </div>
        </div>
        
        {/* Project stats */}
        <div className="mt-4 pt-3 border-t border-gray-700/30 flex justify-between items-center">
          <div className="flex gap-2">
            <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
              {project.embeddedQuests?.length || 0} Quest{project.embeddedQuests?.length !== 1 ? 's' : ''}
            </span>
            
            {project.createdAt && (
              <span className="inline-block px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {showControls && (
            <div className="flex gap-2">
              <Link href={`/partners/${project.id}`} target="_blank">
                <motion.button 
                  className="p-2 text-gray-300 hover:text-white rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </motion.button>
              </Link>
              
              <Link href={`/partner-dashboard/edit-project/${project.id}`}>
                <motion.button 
                  className="p-2 text-gray-300 hover:text-white rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}