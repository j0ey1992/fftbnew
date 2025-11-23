'use client'

import { useState } from 'react'
import { 
  Project, 
  ProjectContent, 
  ProjectContentSection, 
  SectionType,
  HeroSection,
  TextSection,
  FeaturesSection,
  FaqSection,
  CtaSection,
  SocialSection,
  FeatureItem,
  FaqItem,
  SocialLink
} from '@/types/project'
import { GlassCard, Button } from '@/components/ui'
import { v4 as uuidv4 } from 'uuid'

interface ContentEditorProps {
  project: Project
  onChange: (content: ProjectContent) => void
}

/**
 * Content editor component
 * Allows users to customize their project's content sections
 */
export function ContentEditor({ project, onChange }: ContentEditorProps) {
  const [content, setContent] = useState<ProjectContent>(project.content || {
    heroTitle: '',
    description: '',
    sections: []
  })
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [newSectionType, setNewSectionType] = useState<SectionType>('hero')

  // Handle content update
  const handleContentUpdate = (updatedContent: ProjectContent) => {
    setContent(updatedContent)
    onChange(updatedContent)
  }

  // Handle hero title update
  const handleHeroTitleUpdate = (heroTitle: string) => {
    handleContentUpdate({
      ...content,
      heroTitle
    })
  }

  // Handle description update
  const handleDescriptionUpdate = (description: string) => {
    handleContentUpdate({
      ...content,
      description
    })
  }

  // Handle section update
  const handleSectionUpdate = (updatedSection: ProjectContentSection) => {
    const updatedSections = content.sections.map(section => 
      section.id === updatedSection.id ? updatedSection : section
    )
    
    handleContentUpdate({
      ...content,
      sections: updatedSections
    })
  }

  // Handle section add
  const handleAddSection = () => {
    const newSection = createNewSection(newSectionType)
    
    handleContentUpdate({
      ...content,
      sections: [...content.sections, newSection]
    })
    
    setActiveSection(newSection.id)
  }

  // Handle section delete
  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = content.sections.filter(section => section.id !== sectionId)
    
    handleContentUpdate({
      ...content,
      sections: updatedSections
    })
    
    if (activeSection === sectionId) {
      setActiveSection(null)
    }
  }

  // Handle section position change
  const handleSectionPositionChange = (sectionId: string, position: 'top' | 'middle' | 'bottom') => {
    const updatedSections = content.sections.map(section => 
      section.id === sectionId ? { ...section, position } : section
    )
    
    handleContentUpdate({
      ...content,
      sections: updatedSections
    })
  }

  // Create a new section based on type
  const createNewSection = (type: SectionType): ProjectContentSection => {
    const id = uuidv4()
    
    switch (type) {
      case 'hero':
        return {
          id,
          type: 'hero',
          title: 'Welcome to Our Project',
          subtitle: 'A brief description of what we offer',
          position: 'top'
        } as HeroSection
      
      case 'text':
        return {
          id,
          type: 'text',
          title: 'About Us',
          content: 'Write your content here...',
          position: 'middle',
          alignment: 'left'
        } as TextSection
      
      case 'features':
        return {
          id,
          type: 'features',
          title: 'Features',
          features: [
            {
              title: 'Feature 1',
              description: 'Description of feature 1'
            },
            {
              title: 'Feature 2',
              description: 'Description of feature 2'
            },
            {
              title: 'Feature 3',
              description: 'Description of feature 3'
            }
          ],
          position: 'middle',
          layout: 'grid'
        } as FeaturesSection
      
      case 'faq':
        return {
          id,
          type: 'faq',
          title: 'Frequently Asked Questions',
          items: [
            {
              question: 'What is this project about?',
              answer: 'This project is about...'
            },
            {
              question: 'How can I get started?',
              answer: 'You can get started by...'
            }
          ],
          position: 'middle'
        } as FaqSection
      
      case 'cta':
        return {
          id,
          type: 'cta',
          title: 'Ready to Get Started?',
          subtitle: 'Join us today and experience the benefits',
          buttonText: 'Get Started',
          buttonLink: '#',
          position: 'bottom'
        } as CtaSection
      
      case 'social':
        return {
          id,
          type: 'social',
          title: 'Connect With Us',
          links: [
            {
              platform: 'twitter',
              url: 'https://twitter.com/',
              label: 'Twitter'
            },
            {
              platform: 'discord',
              url: 'https://discord.com/',
              label: 'Discord'
            }
          ],
          position: 'bottom'
        } as SocialSection
      
      default:
        return {
          id,
          type: 'text',
          title: 'New Section',
          content: 'Write your content here...',
          position: 'middle',
          alignment: 'left'
        } as TextSection
    }
  }

  // Get active section
  const getActiveSection = () => {
    return content.sections.find(section => section.id === activeSection) || null
  }

  // Section type icons
  const sectionTypeIcons: Record<SectionType, string> = {
    hero: '🏆',
    text: '📝',
    features: '✨',
    faq: '❓',
    cta: '🔔',
    social: '🌐'
  }

  // Section type names
  const sectionTypeNames: Record<SectionType, string> = {
    hero: 'Hero',
    text: 'Text',
    features: 'Features',
    faq: 'FAQ',
    cta: 'Call to Action',
    social: 'Social Links'
  }

  // Render section editor based on type
  const renderSectionEditor = (section: ProjectContentSection) => {
    switch (section.type) {
      case 'hero':
        return renderHeroEditor(section as HeroSection)
      case 'text':
        return renderTextEditor(section as TextSection)
      case 'features':
        return renderFeaturesEditor(section as FeaturesSection)
      case 'faq':
        return renderFaqEditor(section as FaqSection)
      case 'cta':
        return renderCtaEditor(section as CtaSection)
      case 'social':
        return renderSocialEditor(section as SocialSection)
      default:
        return null
    }
  }

  // Render hero section editor
  const renderHeroEditor = (section: HeroSection) => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => handleSectionUpdate({ ...section, title: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Subtitle
          </label>
          <input
            type="text"
            value={section.subtitle}
            onChange={(e) => handleSectionUpdate({ ...section, subtitle: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            CTA Text (Optional)
          </label>
          <input
            type="text"
            value={section.ctaText || ''}
            onChange={(e) => handleSectionUpdate({ ...section, ctaText: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
            placeholder="Get Started"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            CTA Link (Optional)
          </label>
          <input
            type="text"
            value={section.ctaLink || ''}
            onChange={(e) => handleSectionUpdate({ ...section, ctaLink: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
            placeholder="#"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Background Image URL (Optional)
          </label>
          <input
            type="text"
            value={section.backgroundImage || ''}
            onChange={(e) => handleSectionUpdate({ ...section, backgroundImage: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
    )
  }

  // Render text section editor
  const renderTextEditor = (section: TextSection) => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title (Optional)
          </label>
          <input
            type="text"
            value={section.title || ''}
            onChange={(e) => handleSectionUpdate({ ...section, title: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Content
          </label>
          <textarea
            value={section.content}
            onChange={(e) => handleSectionUpdate({ ...section, content: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
            rows={6}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Alignment
          </label>
          <div className="flex space-x-4">
            <div 
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                section.alignment === 'left' ? 'bg-blue-500' : 'bg-[#0a0f1f] border border-gray-700'
              }`}
              onClick={() => handleSectionUpdate({ ...section, alignment: 'left' })}
            >
              Left
            </div>
            <div 
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                section.alignment === 'center' ? 'bg-blue-500' : 'bg-[#0a0f1f] border border-gray-700'
              }`}
              onClick={() => handleSectionUpdate({ ...section, alignment: 'center' })}
            >
              Center
            </div>
            <div 
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                section.alignment === 'right' ? 'bg-blue-500' : 'bg-[#0a0f1f] border border-gray-700'
              }`}
              onClick={() => handleSectionUpdate({ ...section, alignment: 'right' })}
            >
              Right
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render features section editor
  const renderFeaturesEditor = (section: FeaturesSection) => {
    const addFeature = () => {
      const newFeature: FeatureItem = {
        title: 'New Feature',
        description: 'Description of the new feature'
      }
      
      handleSectionUpdate({
        ...section,
        features: [...section.features, newFeature]
      })
    }
    
    const updateFeature = (index: number, updatedFeature: FeatureItem) => {
      const updatedFeatures = [...section.features]
      updatedFeatures[index] = updatedFeature
      
      handleSectionUpdate({
        ...section,
        features: updatedFeatures
      })
    }
    
    const removeFeature = (index: number) => {
      const updatedFeatures = section.features.filter((_, i) => i !== index)
      
      handleSectionUpdate({
        ...section,
        features: updatedFeatures
      })
    }
    
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={section.title || ''}
            onChange={(e) => handleSectionUpdate({ ...section, title: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Subtitle (Optional)
          </label>
          <input
            type="text"
            value={section.subtitle || ''}
            onChange={(e) => handleSectionUpdate({ ...section, subtitle: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Layout
          </label>
          <div className="flex space-x-4">
            <div 
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                section.layout === 'grid' ? 'bg-blue-500' : 'bg-[#0a0f1f] border border-gray-700'
              }`}
              onClick={() => handleSectionUpdate({ ...section, layout: 'grid' })}
            >
              Grid
            </div>
            <div 
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                section.layout === 'list' ? 'bg-blue-500' : 'bg-[#0a0f1f] border border-gray-700'
              }`}
              onClick={() => handleSectionUpdate({ ...section, layout: 'list' })}
            >
              List
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-300">
              Features
            </label>
            <Button
              variant="glass"
              size="sm"
              onClick={addFeature}
            >
              Add Feature
            </Button>
          </div>
          
          <div className="space-y-4">
            {section.features.map((feature, index) => (
              <div key={index} className="p-4 border border-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-white">Feature {index + 1}</h4>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    Remove
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => updateFeature(index, { ...feature, title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Description
                    </label>
                    <textarea
                      value={feature.description}
                      onChange={(e) => updateFeature(index, { ...feature, description: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Icon (Optional)
                    </label>
                    <input
                      type="text"
                      value={feature.icon || ''}
                      onChange={(e) => updateFeature(index, { ...feature, icon: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                      placeholder="Icon URL or emoji"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Render FAQ section editor
  const renderFaqEditor = (section: FaqSection) => {
    const addFaqItem = () => {
      const newItem: FaqItem = {
        question: 'New Question',
        answer: 'Answer to the new question'
      }
      
      handleSectionUpdate({
        ...section,
        items: [...section.items, newItem]
      })
    }
    
    const updateFaqItem = (index: number, updatedItem: FaqItem) => {
      const updatedItems = [...section.items]
      updatedItems[index] = updatedItem
      
      handleSectionUpdate({
        ...section,
        items: updatedItems
      })
    }
    
    const removeFaqItem = (index: number) => {
      const updatedItems = section.items.filter((_, i) => i !== index)
      
      handleSectionUpdate({
        ...section,
        items: updatedItems
      })
    }
    
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={section.title || ''}
            onChange={(e) => handleSectionUpdate({ ...section, title: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-300">
              FAQ Items
            </label>
            <Button
              variant="glass"
              size="sm"
              onClick={addFaqItem}
            >
              Add Question
            </Button>
          </div>
          
          <div className="space-y-4">
            {section.items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-white">Question {index + 1}</h4>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => removeFaqItem(index)}
                  >
                    Remove
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => updateFaqItem(index, { ...item, question: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Answer
                    </label>
                    <textarea
                      value={item.answer}
                      onChange={(e) => updateFaqItem(index, { ...item, answer: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Render CTA section editor
  const renderCtaEditor = (section: CtaSection) => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => handleSectionUpdate({ ...section, title: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Subtitle (Optional)
          </label>
          <input
            type="text"
            value={section.subtitle || ''}
            onChange={(e) => handleSectionUpdate({ ...section, subtitle: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Button Text
          </label>
          <input
            type="text"
            value={section.buttonText}
            onChange={(e) => handleSectionUpdate({ ...section, buttonText: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Button Link
          </label>
          <input
            type="text"
            value={section.buttonLink}
            onChange={(e) => handleSectionUpdate({ ...section, buttonLink: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Background Image URL (Optional)
          </label>
          <input
            type="text"
            value={section.backgroundImage || ''}
            onChange={(e) => handleSectionUpdate({ ...section, backgroundImage: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
    )
  }

  // Render social section editor
  const renderSocialEditor = (section: SocialSection) => {
    const addSocialLink = () => {
      const newLink: SocialLink = {
        platform: 'twitter',
        url: 'https://twitter.com/',
        label: 'Twitter'
      }
      
      handleSectionUpdate({
        ...section,
        links: [...section.links, newLink]
      })
    }
    
    const updateSocialLink = (index: number, updatedLink: SocialLink) => {
      const updatedLinks = [...section.links]
      updatedLinks[index] = updatedLink
      
      handleSectionUpdate({
        ...section,
        links: updatedLinks
      })
    }
    
    const removeSocialLink = (index: number) => {
      const updatedLinks = section.links.filter((_, i) => i !== index)
      
      handleSectionUpdate({
        ...section,
        links: updatedLinks
      })
    }
    
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={section.title || ''}
            onChange={(e) => handleSectionUpdate({ ...section, title: e.target.value })}
            className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-300">
              Social Links
            </label>
            <Button
              variant="glass"
              size="sm"
              onClick={addSocialLink}
            >
              Add Link
            </Button>
          </div>
          
          <div className="space-y-4">
            {section.links.map((link, index) => (
              <div key={index} className="p-4 border border-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-white">Link {index + 1}</h4>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => removeSocialLink(index)}
                  >
                    Remove
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Platform
                    </label>
                    <select
                      value={link.platform}
                      onChange={(e) => updateSocialLink(index, { 
                        ...link, 
                        platform: e.target.value as SocialLink['platform'],
                        label: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)
                      })}
                      className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                    >
                      <option value="website">Website</option>
                      <option value="twitter">Twitter</option>
                      <option value="discord">Discord</option>
                      <option value="telegram">Telegram</option>
                      <option value="medium">Medium</option>
                      <option value="github">GitHub</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      URL
                    </label>
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, { ...link, url: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={link.label || ''}
                      onChange={(e) => updateSocialLink(index, { ...link, label: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Main Content */}
      <GlassCard elevation="flat">
        <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
          <h3 className="text-xl font-bold">Main Content</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hero Title
              </label>
              <input
                type="text"
                value={content.heroTitle}
                onChange={(e) => handleHeroTitleUpdate(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
              />
              <p className="mt-1 text-xs text-gray-400">
                This is the main title displayed at the top of your project page
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={content.description}
                onChange={(e) => handleDescriptionUpdate(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                rows={3}
              />
              <p className="mt-1 text-xs text-gray-400">
                A brief description of your project that will be displayed below the hero title
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Content Sections */}
      <GlassCard elevation="flat">
        <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-bold">Content Sections</h3>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddSection}
          >
            Add Section
          </Button>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Section Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Section Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {(Object.keys(sectionTypeNames) as Array<SectionType>).map((type) => (
                  <div
                    key={type}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      newSectionType === type
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-[#0a0f1f]/50 hover:border-gray-500'
                    }`}
                    onClick={() => setNewSectionType(type)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <span className="text-2xl mb-1">{sectionTypeIcons[type]}</span>
                      <span className="text-sm">{sectionTypeNames[type]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Section List */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Current Sections
              </label>
              
              {content.sections.length === 0 ? (
                <div className="p-4 border border-gray-700 rounded-lg text-center">
                  <p className="text-gray-400">No sections added yet. Click "Add Section" to create your first section.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {content.sections.map((section) => (
                    <div
                      key={section.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        activeSection === section.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 bg-[#0a0f1f]/50 hover:border-gray-500'
                      }`}
                      onClick={() => setActiveSection(section.id === activeSection ? null : section.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{sectionTypeIcons[section.type]}</span>
                          <div>
                            <h4 className="font-medium text-white">{sectionTypeNames[section.type]}</h4>
                            <p className="text-sm text-gray-400">
                              {section.title || sectionTypeNames[section.type]}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="relative inline-flex">
                            <select
                              value={section.position}
                              onChange={(e) => handleSectionPositionChange(
                                section.id, 
                                e.target.value as 'top' | 'middle' | 'bottom'
                              )}
                              className="px-2 py-1 bg-[#0a0f1f] border border-gray-700 rounded-lg text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="top">Top</option>
                              <option value="middle">Middle</option>
                              <option value="bottom">Bottom</option>
                            </select>
                          </div>
                          <Button
                            variant="glass"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSection(section.id)
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Section Editor */}
      {activeSection && (
        <GlassCard elevation="flat">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xl font-bold">
              {sectionTypeIcons[getActiveSection()?.type || 'text']} Edit {sectionTypeNames[getActiveSection()?.type || 'text']} Section
            </h3>
            <Button
              variant="glass"
              size="sm"
              onClick={() => setActiveSection(null)}
            >
              Close
            </Button>
          </div>
          <div className="p-6">
            {getActiveSection() && renderSectionEditor(getActiveSection()!)}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
