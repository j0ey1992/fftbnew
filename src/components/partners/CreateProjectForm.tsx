import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePartners } from '@/hooks/usePartners';
import { toast } from '@/components/ui/Toast';

interface CreateProjectFormProps {
  onSuccess?: (projectId: string) => void;
  onCancel?: () => void;
}

export default function CreateProjectForm({ onSuccess, onCancel }: CreateProjectFormProps) {
  const router = useRouter();
  const { createPartnerProject, loading, error } = usePartners();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    twitter: '',
    discord: '',
    telegram: '',
  });
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Logo and banner image upload state
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle banner upload
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBanner(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }
    
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }
    
    if (formData.twitter && !isValidUrl(formData.twitter)) {
      newErrors.twitter = 'Please enter a valid URL';
    }
    
    if (formData.discord && !isValidUrl(formData.discord)) {
      newErrors.discord = 'Please enter a valid URL';
    }
    
    if (formData.telegram && !isValidUrl(formData.telegram)) {
      newErrors.telegram = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Helper to check if a string is a valid URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Prepare project data for submission
      const projectData = {
        name: formData.name,
        description: formData.description,
        website: formData.website || undefined,
        socials: {
          twitter: formData.twitter || undefined,
          discord: formData.discord || undefined,
          telegram: formData.telegram || undefined,
        },
        // Add logo and banner URLs if available (will be handled by a separate upload service in a real implementation)
        logo: logoPreview || undefined,
        banner: bannerPreview || undefined,
      };
      
      // Create the project
      const result = await createPartnerProject(projectData);
      
      if (result.success) {
        toast.success('Project created successfully!');
        
        // Call the success callback if provided
        if (onSuccess) {
          onSuccess(result.id);
        } else {
          router.push(`/partner-dashboard?projectId=${result.id}`);
        }
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'An error occurred while creating your project.');
    }
  };
  
  return (
    <div className="bg-[#0a1e3d]/80 border border-blue-500/20 rounded-xl p-6 max-w-2xl mx-auto shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-[#041836]/60 border ${
                errors.name ? 'border-red-500' : 'border-gray-600'
              } rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors`}
              placeholder="Enter project name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          
          {/* Project Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2 bg-[#041836]/60 border ${
                errors.description ? 'border-red-500' : 'border-gray-600'
              } rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors`}
              placeholder="Enter project description"
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>
          
          {/* Logo Upload */}
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-300 mb-1">
              Project Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#041836]/60 border border-gray-600 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div>
                <label className="px-4 py-2 bg-blue-600/30 text-blue-300 rounded cursor-pointer hover:bg-blue-600/50 transition-colors">
                  Choose Logo
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                <p className="mt-1 text-xs text-gray-400">Recommended: Square image, at least 200x200px</p>
              </div>
            </div>
          </div>
          
          {/* Banner Upload */}
          <div>
            <label htmlFor="banner" className="block text-sm font-medium text-gray-300 mb-1">
              Project Banner
            </label>
            <div className="flex flex-col gap-2">
              <div className="h-32 bg-[#041836]/60 border border-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div>
                <label className="px-4 py-2 bg-blue-600/30 text-blue-300 rounded cursor-pointer hover:bg-blue-600/50 transition-colors">
                  Choose Banner
                  <input
                    type="file"
                    id="banner"
                    name="banner"
                    onChange={handleBannerUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                <p className="mt-1 text-xs text-gray-400">Recommended: 1200x400px banner image</p>
              </div>
            </div>
          </div>
          
          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1">
              Website
            </label>
            <input
              type="text"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-[#041836]/60 border ${
                errors.website ? 'border-red-500' : 'border-gray-600'
              } rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors`}
              placeholder="https://example.com"
            />
            {errors.website && <p className="mt-1 text-sm text-red-500">{errors.website}</p>}
          </div>
          
          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-300 mb-1">
                Twitter
              </label>
              <input
                type="text"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-[#041836]/60 border ${
                  errors.twitter ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors`}
                placeholder="https://twitter.com/username"
              />
              {errors.twitter && <p className="mt-1 text-sm text-red-500">{errors.twitter}</p>}
            </div>
            <div>
              <label htmlFor="discord" className="block text-sm font-medium text-gray-300 mb-1">
                Discord
              </label>
              <input
                type="text"
                id="discord"
                name="discord"
                value={formData.discord}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-[#041836]/60 border ${
                  errors.discord ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors`}
                placeholder="https://discord.gg/invite"
              />
              {errors.discord && <p className="mt-1 text-sm text-red-500">{errors.discord}</p>}
            </div>
            <div>
              <label htmlFor="telegram" className="block text-sm font-medium text-gray-300 mb-1">
                Telegram
              </label>
              <input
                type="text"
                id="telegram"
                name="telegram"
                value={formData.telegram}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-[#041836]/60 border ${
                  errors.telegram ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors`}
                placeholder="https://t.me/username"
              />
              {errors.telegram && <p className="mt-1 text-sm text-red-500">{errors.telegram}</p>}
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
            {onCancel && (
              <motion.button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 bg-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            )}
            <motion.button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Project'
              )}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}