'use client'

import { useState, useEffect } from 'react'
import { ComponentType, ComponentStyle, defaultComponentStyles } from '@/types/project'
import { GlassCard, Button } from '@/components/ui'
import { v4 as uuidv4 } from 'uuid'
import { generateAIResponse } from '@/lib/ai/deepseek'
import { ColorEditor } from './ColorEditor'
import { ImageEditor } from './ImageEditor'

interface ComponentEditorProps {
  componentType: ComponentType
  componentId: string
  onClose: () => void
  onStyleChange: (css: string) => void
  initialStyle?: ComponentStyle
}

/**
 * Component editor modal
 * Allows users to customize component styles
 */
export function ComponentEditor({
  componentType,
  componentId,
  onClose,
  onStyleChange,
  initialStyle
}: ComponentEditorProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'custom' | 'ai' | 'colors' | 'images'>('templates')
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(initialStyle?.templateId || 1)
  const [customCSS, setCustomCSS] = useState<string>(initialStyle?.aiGeneratedCSS || '')
  const [aiPrompt, setAiPrompt] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [previewCSS, setPreviewCSS] = useState<string>('')
  const [colors, setColors] = useState<Record<string, string>>(initialStyle?.customStyles?.colors || {})
  const [backgroundImage, setBackgroundImage] = useState<string | null>(
    initialStyle?.customStyles?.images?.backgroundImage || null
  )
  const [logoImage, setLogoImage] = useState<string | null>(
    initialStyle?.customStyles?.images?.logoImage || null
  )
  const [iconImage, setIconImage] = useState<string | null>(
    initialStyle?.customStyles?.images?.iconImage || null
  )

  // Filter templates by component type
  const templates = defaultComponentStyles.filter(style => style.componentType === componentType)

  // Set initial values
  useEffect(() => {
    if (initialStyle) {
      setSelectedTemplateId(initialStyle.templateId)
      setCustomCSS(initialStyle.aiGeneratedCSS || '')
      
      // Try to load saved style from localStorage
      try {
        const savedStyle = localStorage.getItem(`component-style-${componentId}`)
        if (savedStyle) {
          const parsedStyle = JSON.parse(savedStyle)
          if (parsedStyle.colors) {
            setColors(parsedStyle.colors)
          }
          if (parsedStyle.images) {
            setBackgroundImage(parsedStyle.images.backgroundImage || null)
            setLogoImage(parsedStyle.images.logoImage || null)
            setIconImage(parsedStyle.images.iconImage || null)
          }
        }
      } catch (error) {
        console.error('Error loading saved style:', error)
      }
    }
  }, [initialStyle, componentId])

  // Generate CSS from template
  const generateCSSFromTemplate = (templateId: number) => {
    const template = templates.find(t => t.templateId === templateId)
    if (!template) return ''

    let css = `.component-${componentId} {\n`

    // Add colors
    if (template.customStyles.colors) {
      Object.entries(template.customStyles.colors).forEach(([property, value]) => {
        css += `  ${property === 'text' ? 'color' : `${property}-color`}: ${value};\n`
      })
    }

    // Add typography
    if (template.customStyles.typography) {
      Object.entries(template.customStyles.typography).forEach(([property, value]) => {
        css += `  ${property}: ${value};\n`
      })
    }

    // Add spacing
    if (template.customStyles.spacing) {
      Object.entries(template.customStyles.spacing).forEach(([property, value]) => {
        css += `  ${property}: ${value};\n`
      })
    }

    // Add effects
    if (template.customStyles.effects) {
      Object.entries(template.customStyles.effects).forEach(([property, value]) => {
        css += `  ${property}: ${value};\n`
      })
    }

    css += '}\n'

    // Add hover state if it exists
    if (template.customStyles.colors?.hoverBackground) {
      css += `.component-${componentId}:hover {\n`
      css += `  background-color: ${template.customStyles.colors.hoverBackground};\n`
      css += '}\n'
    }

    return css
  }

  // Handle template selection
  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplateId(templateId)
    const css = generateCSSFromTemplate(templateId)
    setPreviewCSS(css)
  }

  // Handle AI generation
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return

    setIsGenerating(true)

    try {
      const systemPrompt = `You are an expert UI designer specializing in creating modern, visually appealing CSS for web components. 
      Generate clean, efficient CSS that follows best practices for the specified component type.`

      const userPrompt = `Generate CSS styles for a ${componentType} component with the following design description: 
      "${aiPrompt}". Focus only on visual styling (colors, typography, spacing, effects).
      Return only the CSS code without explanations, starting with .component-${componentId} {`

      const response = await generateAIResponse(userPrompt, systemPrompt, { temperature: 0.3 })
      
      // Clean up the response to ensure it's valid CSS
      let cleanedResponse = response
      if (!response.includes(`.component-${componentId}`)) {
        cleanedResponse = `.component-${componentId} {\n${response}\n}`
      }
      
      setCustomCSS(cleanedResponse)
      setPreviewCSS(cleanedResponse)
      setActiveTab('custom')
    } catch (error) {
      console.error('Error generating AI styles:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle save
  const handleSave = () => {
    let finalCSS = ''
    
    if (activeTab === 'templates') {
      finalCSS = generateCSSFromTemplate(selectedTemplateId)
    } else {
      finalCSS = customCSS
    }
    
    // Add image-related CSS if images are set
    if (backgroundImage) {
      finalCSS += `\n.component-${componentId} {\n`;
      finalCSS += `  background-image: url('${backgroundImage}');\n`;
      finalCSS += '  background-size: cover;\n';
      finalCSS += '  background-position: center;\n';
      finalCSS += '}\n';
    }
    
    // Store image information in component style
    const customStyles = {
      colors,
      images: {
        backgroundImage: backgroundImage || undefined,
        logoImage: logoImage || undefined,
        iconImage: iconImage || undefined
      }
    };
    
    // Pass the updated style to the parent component
    onStyleChange(finalCSS);
    
    // Store the custom styles in localStorage for persistence
    try {
      localStorage.setItem(`component-style-${componentId}`, JSON.stringify({
        colors,
        images: {
          backgroundImage,
          logoImage,
          iconImage
        }
      }));
    } catch (error) {
      console.error('Error saving component style to localStorage:', error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <GlassCard elevation="raised">
          <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xl font-bold">Edit {componentType.charAt(0).toUpperCase() + componentType.slice(1)}</h3>
            <button
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-700 mb-6 overflow-x-auto scrollbar-hide">
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'templates' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('templates')}
              >
                Templates
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'colors' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('colors')}
              >
                Colors
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'images' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('images')}
              >
                Images
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'custom' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('custom')}
              >
                Custom CSS
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'ai' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('ai')}
              >
                AI Generator
              </button>
            </div>
            
            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedTemplateId === template.templateId
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 bg-[#0a0f1f]/50 hover:border-gray-500'
                      }`}
                      onClick={() => handleTemplateSelect(template.templateId)}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-4 h-4 rounded-full mr-2 ${
                          selectedTemplateId === template.templateId ? 'bg-blue-500' : 'bg-gray-700'
                        }`}></div>
                        <h4 className="font-medium text-white">{template.name}</h4>
                      </div>
                      
                      {/* Template Preview */}
                      <div 
                        className="h-20 rounded-lg mb-2 flex items-center justify-center"
                        style={{
                          backgroundColor: template.customStyles.colors?.background || 'rgba(20, 25, 45, 0.6)',
                          color: template.customStyles.colors?.text || '#ffffff',
                          borderRadius: template.customStyles.effects?.borderRadius || '8px',
                          boxShadow: template.customStyles.effects?.boxShadow || 'none',
                          padding: template.customStyles.spacing?.padding || '1rem'
                        }}
                      >
                        <span>{template.name}</span>
                      </div>
                      
                      <p className="text-sm text-gray-400">
                        {template.customStyles.colors?.background && `Background: ${template.customStyles.colors.background}`}
                      </p>
                    </div>
                  ))}
                </div>
                
                {templates.length === 0 && (
                  <div className="p-4 border border-gray-700 rounded-lg text-center">
                    <p className="text-gray-400">No templates available for this component type.</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Custom CSS Tab */}
            {activeTab === 'custom' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom CSS
                  </label>
                  <textarea
                    value={customCSS}
                    onChange={(e) => {
                      setCustomCSS(e.target.value)
                      setPreviewCSS(e.target.value)
                    }}
                    className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg font-mono text-sm"
                    rows={10}
                    placeholder={`.component-${componentId} {\n  /* Your custom CSS here */\n  background-color: rgba(20, 25, 45, 0.6);\n  color: #ffffff;\n  border-radius: 8px;\n  padding: 1rem;\n}`}
                  />
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400">
                    Use <code className="bg-blue-500/20 px-1 rounded">.component-{componentId}</code> as the selector for your component.
                  </p>
                </div>
              </div>
            )}
            
            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-4">
                <ColorEditor
                  initialColors={colors}
                  onColorsChange={(newColors) => {
                    setColors(newColors)
                    
                    // Generate CSS from colors
                    let colorCSS = `.component-${componentId} {\n`
                    Object.entries(newColors).forEach(([property, value]) => {
                      if (property.includes('hover')) return // Handle hover separately
                      colorCSS += `  ${property === 'text' ? 'color' : `${property}-color`}: ${value};\n`
                    })
                    colorCSS += '}\n'
                    
                    // Add hover styles if they exist
                    const hoverProperties = Object.entries(newColors).filter(([key]) => key.includes('hover'))
                    if (hoverProperties.length > 0) {
                      colorCSS += `.component-${componentId}:hover {\n`
                      hoverProperties.forEach(([property, value]) => {
                        const baseProp = property.replace('hover', '').toLowerCase()
                        colorCSS += `  ${baseProp === 'text' ? 'color' : `${baseProp}-color`}: ${value};\n`
                      })
                      colorCSS += '}\n'
                    }
                    
                    setPreviewCSS(colorCSS)
                    setCustomCSS(colorCSS)
                  }}
                  componentType={componentType}
                />
              </div>
            )}
            
            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-6">
                {/* Background Image */}
                <div className="mb-6">
                  <ImageEditor
                    initialImageUrl={backgroundImage || undefined}
                    onImageChange={(url) => {
                      setBackgroundImage(url)
                      
                      // Generate CSS for background image
                      let imageCSS = `.component-${componentId} {\n`
                      if (url) {
                        imageCSS += `  background-image: url('${url}');\n`
                        imageCSS += '  background-size: cover;\n'
                        imageCSS += '  background-position: center;\n'
                      } else if (colors.background) {
                        imageCSS += `  background-color: ${colors.background};\n`
                      }
                      imageCSS += '}\n'
                      
                      setPreviewCSS(imageCSS)
                      setCustomCSS(imageCSS)
                    }}
                    imageType="background"
                    storagePath={`project-components/${componentId}`}
                  />
                </div>
                
                {/* Logo Image (for headers, cards) */}
                {(componentType === 'header' || componentType === 'card') && (
                  <div className="mb-6">
                    <ImageEditor
                      initialImageUrl={logoImage || undefined}
                      onImageChange={(url) => {
                        setLogoImage(url)
                        
                        // We don't generate CSS for logo images as they're typically
                        // handled via the component's children, but we store the URL
                        // for use in the component
                      }}
                      imageType="logo"
                      storagePath={`project-components/${componentId}`}
                    />
                  </div>
                )}
                
                {/* Icon Image (for buttons, cards) */}
                {(componentType === 'button' || componentType === 'card') && (
                  <div className="mb-6">
                    <ImageEditor
                      initialImageUrl={iconImage || undefined}
                      onImageChange={(url) => {
                        setIconImage(url)
                        
                        // We don't generate CSS for icon images as they're typically
                        // handled via the component's children, but we store the URL
                        // for use in the component
                      }}
                      imageType="icon"
                      storagePath={`project-components/${componentId}`}
                    />
                  </div>
                )}
                
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400">
                    Images will be stored in your project and can be used in your components.
                    Background images will be applied automatically, while logo and icon images
                    can be used in your component content.
                  </p>
                </div>
              </div>
            )}
            
            {/* AI Generator Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Describe the style you want
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                    rows={4}
                    placeholder={`E.g., Create a modern ${componentType} with a glass effect, blue gradient background, and subtle hover animation`}
                  />
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleAIGenerate}
                  isLoading={isGenerating}
                  disabled={isGenerating || !aiPrompt.trim()}
                >
                  Generate CSS
                </Button>
                
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400">
                    The AI will generate CSS based on your description. You can then edit it in the Custom CSS tab.
                  </p>
                </div>
                
              {/* Example prompts */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Example prompts:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div 
                    className="p-2 bg-[#0a0f1f] border border-gray-700 rounded-lg text-sm cursor-pointer hover:border-gray-500"
                    onClick={() => setAiPrompt(`Create a sleek ${componentType} with a dark glass morphism effect, subtle blue glow, and smooth hover transition`)}
                  >
                    Create a sleek {componentType} with a dark glass morphism effect, subtle blue glow, and smooth hover transition
                  </div>
                  <div 
                    className="p-2 bg-[#0a0f1f] border border-gray-700 rounded-lg text-sm cursor-pointer hover:border-gray-500"
                    onClick={() => setAiPrompt(`Design a ${componentType} with a vibrant gradient background from purple to blue, white text, and rounded corners`)}
                  >
                    Design a {componentType} with a vibrant gradient background from purple to blue, white text, and rounded corners
                  </div>
                  <div 
                    className="p-2 bg-[#0a0f1f] border border-gray-700 rounded-lg text-sm cursor-pointer hover:border-gray-500"
                    onClick={() => setAiPrompt(`Create a Crypto.com style ${componentType} with premium dark theme, subtle animations, and professional look`)}
                  >
                    Create a Crypto.com style {componentType} with premium dark theme, subtle animations, and professional look
                  </div>
                  <div 
                    className="p-2 bg-[#0a0f1f] border border-gray-700 rounded-lg text-sm cursor-pointer hover:border-gray-500"
                    onClick={() => setAiPrompt(`Design a neon-themed ${componentType} with glowing borders, cyberpunk style, and futuristic elements`)}
                  >
                    Design a neon-themed {componentType} with glowing borders, cyberpunk style, and futuristic elements
                  </div>
                </div>
              </div>
              
              {/* Style suggestions based on component type */}
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-sm font-medium text-blue-400 mb-2">Style suggestions for {componentType}:</h4>
                {componentType === 'header' && (
                  <p className="text-sm text-gray-300">
                    Try "Create a sticky header with glass effect, subtle shadow, and smooth transition when scrolling"
                  </p>
                )}
                {componentType === 'button' && (
                  <p className="text-sm text-gray-300">
                    Try "Design a button with gradient background, subtle glow effect, and scale animation on hover"
                  </p>
                )}
                {componentType === 'card' && (
                  <p className="text-sm text-gray-300">
                    Try "Create a premium card with glass morphism, subtle border glow, and smooth hover effect"
                  </p>
                )}
                {componentType === 'hero' && (
                  <p className="text-sm text-gray-300">
                    Try "Design a hero section with animated gradient background, large bold text, and subtle particle effects"
                  </p>
                )}
              </div>
              </div>
            )}
            
            {/* Preview */}
            {previewCSS && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Preview:</h4>
                <div className="p-4 border border-gray-700 rounded-lg bg-[#0a0f1f]/50">
                  <style dangerouslySetInnerHTML={{ __html: previewCSS }} />
                  <div className={`component-${componentId} rounded-lg p-4 flex items-center justify-center`}>
                    {componentType.charAt(0).toUpperCase() + componentType.slice(1)} Preview
                  </div>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="glass"
                size="md"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
