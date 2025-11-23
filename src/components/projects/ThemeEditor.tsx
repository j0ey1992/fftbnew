'use client'

import { useState, useEffect } from 'react'
import { Project, ProjectTheme, StyleTemplateId, StyleTemplateName, BackgroundType } from '@/types/project'
import { GlassCard, Button } from '@/components/ui'
import { ChromePicker, ColorResult } from 'react-color'
import Image from 'next/image'

interface ThemeEditorProps {
  project: Project
  onChange: (theme: ProjectTheme) => void
}

/**
 * Theme editor component
 * Allows users to customize their project's theme
 */
export function ThemeEditor({ project, onChange }: ThemeEditorProps) {
  const [theme, setTheme] = useState<ProjectTheme>(project.theme)
  const [activeColorPicker, setActiveColorPicker] = useState<'primary' | 'secondary' | 'text' | null>(null)
  const [previewBackgroundImage, setPreviewBackgroundImage] = useState<string | null>(null)
  const [previewLogoImage, setPreviewLogoImage] = useState<string | null>(null)
  const [customCss, setCustomCss] = useState<string>('')
  const [showAiPrompt, setShowAiPrompt] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Update parent component when theme changes
  // We need to add a check to prevent infinite updates
  useEffect(() => {
    // Only call onChange if the theme has actually changed from the project's theme
    if (JSON.stringify(theme) !== JSON.stringify(project.theme)) {
      onChange(theme)
    }
  }, [theme, onChange, project.theme])

  // Templates
  const templates: { id: StyleTemplateId; name: StyleTemplateName; description: string }[] = [
    { id: 1, name: 'Crypto Pro', description: 'Modern, sleek design with glowing accents and glass effects' },
    { id: 2, name: 'Minimal Modern', description: 'Clean, minimalist design with sharp edges and flat colors' },
    { id: 3, name: 'Gradient Glow', description: 'Vibrant gradients with glowing elements and rounded corners' },
    { id: 4, name: 'Enterprise', description: 'Professional, corporate design with subtle effects and clean typography' }
  ]

  // Font families
  const fontFamilies = [
    { value: 'Inter, sans-serif', label: 'Inter (Modern Sans-Serif)' },
    { value: 'Poppins, sans-serif', label: 'Poppins (Geometric Sans-Serif)' },
    { value: 'Roboto, sans-serif', label: 'Roboto (Clean Sans-Serif)' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat (Contemporary Sans-Serif)' },
    { value: 'Playfair Display, serif', label: 'Playfair Display (Elegant Serif)' },
    { value: 'Space Grotesk, monospace', label: 'Space Grotesk (Modern Monospace)' }
  ]

  // Handle template change
  const handleTemplateChange = (templateId: StyleTemplateId) => {
    const templateName = templates.find(t => t.id === templateId)?.name || 'Crypto Pro'
    setTheme({
      ...theme,
      templateId,
      templateName
    })
  }

  // Handle color change
  const handleColorChange = (color: string | ColorResult, type: 'primary' | 'secondary' | 'text') => {
    const colorValue = typeof color === 'string' ? color : color.hex
    setTheme({
      ...theme,
      [type === 'primary' ? 'primaryColor' : type === 'secondary' ? 'secondaryColor' : 'textColor']: colorValue
    })
  }

  // Handle background type change
  const handleBackgroundTypeChange = (type: BackgroundType) => {
    setTheme({
      ...theme,
      backgroundType: type
    })
  }

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'background' | 'logo') => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (type === 'background') {
        setPreviewBackgroundImage(result)
        setTheme({
          ...theme,
          backgroundImage: result
        })
      } else {
        setPreviewLogoImage(result)
        setTheme({
          ...theme,
          logoImage: result
        })
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle AI CSS generation
  const handleGenerateCss = async () => {
    if (!aiPrompt.trim()) return
    
    setIsGenerating(true)
    
    try {
      // This would be replaced with an actual API call to an AI service
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Example generated CSS
      const generatedCss = `
/* Generated CSS based on prompt: "${aiPrompt}" */
.custom-project-container {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.custom-project-header {
  backdrop-filter: blur(10px);
  background: rgba(10, 15, 31, 0.75);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.custom-project-card {
  background: rgba(20, 25, 45, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.custom-project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.custom-button {
  background: linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor});
  color: ${theme.textColor};
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.custom-button:hover {
  opacity: 0.9;
  transform: scale(1.02);
  box-shadow: 0 0 15px rgba(${parseInt(theme.primaryColor.slice(1, 3), 16)}, ${parseInt(theme.primaryColor.slice(3, 5), 16)}, ${parseInt(theme.primaryColor.slice(5, 7), 16)}, 0.5);
}
      `.trim()
      
      setCustomCss(generatedCss)
    } catch (error) {
      console.error('Error generating CSS:', error)
    } finally {
      setIsGenerating(false)
      setShowAiPrompt(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Template Selection */}
      <GlassCard elevation="flat">
        <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
          <h3 className="text-xl font-bold">Template</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  theme.templateId === template.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-[#0a0f1f]/50 hover:border-gray-500'
                }`}
                onClick={() => handleTemplateChange(template.id)}
              >
                <div className="flex items-center mb-2">
                  <div className={`w-4 h-4 rounded-full mr-2 ${
                    theme.templateId === template.id ? 'bg-blue-500' : 'bg-gray-700'
                  }`}></div>
                  <h4 className="font-medium text-white">{template.name}</h4>
                </div>
                <p className="text-sm text-gray-400">{template.description}</p>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Colors */}
      <GlassCard elevation="flat">
        <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
          <h3 className="text-xl font-bold">Colors</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Primary Color
              </label>
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-lg cursor-pointer border border-white/10"
                  style={{ backgroundColor: theme.primaryColor }}
                  onClick={() => setActiveColorPicker(activeColorPicker === 'primary' ? null : 'primary')}
                ></div>
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => handleColorChange(e.target.value, 'primary')}
                  className="ml-3 flex-1 px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                />
              </div>
              {activeColorPicker === 'primary' && (
                <div className="absolute z-10 mt-2">
                  <div
                    className="fixed inset-0"
                    onClick={() => setActiveColorPicker(null)}
                  ></div>
                  <ChromePicker
                    color={theme.primaryColor}
                    onChange={(color) => handleColorChange(color.hex, 'primary')}
                  />
                </div>
              )}
            </div>

            {/* Secondary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-lg cursor-pointer border border-white/10"
                  style={{ backgroundColor: theme.secondaryColor }}
                  onClick={() => setActiveColorPicker(activeColorPicker === 'secondary' ? null : 'secondary')}
                ></div>
                <input
                  type="text"
                  value={theme.secondaryColor}
                  onChange={(e) => handleColorChange(e.target.value, 'secondary')}
                  className="ml-3 flex-1 px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                />
              </div>
              {activeColorPicker === 'secondary' && (
                <div className="absolute z-10 mt-2">
                  <div
                    className="fixed inset-0"
                    onClick={() => setActiveColorPicker(null)}
                  ></div>
                  <ChromePicker
                    color={theme.secondaryColor}
                    onChange={(color) => handleColorChange(color.hex, 'secondary')}
                  />
                </div>
              )}
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Text Color
              </label>
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-lg cursor-pointer border border-white/10"
                  style={{ backgroundColor: theme.textColor }}
                  onClick={() => setActiveColorPicker(activeColorPicker === 'text' ? null : 'text')}
                ></div>
                <input
                  type="text"
                  value={theme.textColor}
                  onChange={(e) => handleColorChange(e.target.value, 'text')}
                  className="ml-3 flex-1 px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                />
              </div>
              {activeColorPicker === 'text' && (
                <div className="absolute z-10 mt-2">
                  <div
                    className="fixed inset-0"
                    onClick={() => setActiveColorPicker(null)}
                  ></div>
                  <ChromePicker
                    color={theme.textColor}
                    onChange={(color) => handleColorChange(color.hex, 'text')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Color Preview */}
          <div className="mt-6 p-4 rounded-lg" style={{ background: theme.backgroundType === 'gradient' ? theme.backgroundGradient : theme.backgroundColor }}>
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: theme.primaryColor }}>
                <span style={{ color: theme.textColor }}>Primary Button</span>
              </div>
              <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: theme.secondaryColor }}>
                <span style={{ color: theme.textColor }}>Secondary Button</span>
              </div>
              <div className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.1)]">
                <span style={{ color: theme.textColor }}>Text Sample</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Background */}
      <GlassCard elevation="flat">
        <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
          <h3 className="text-xl font-bold">Background</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Background Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Background Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    theme.backgroundType === 'solid'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-[#0a0f1f]/50 hover:border-gray-500'
                  }`}
                  onClick={() => handleBackgroundTypeChange('solid')}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${
                      theme.backgroundType === 'solid' ? 'bg-blue-500' : 'bg-gray-700'
                    }`}></div>
                    <span>Solid Color</span>
                  </div>
                </div>
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    theme.backgroundType === 'gradient'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-[#0a0f1f]/50 hover:border-gray-500'
                  }`}
                  onClick={() => handleBackgroundTypeChange('gradient')}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${
                      theme.backgroundType === 'gradient' ? 'bg-blue-500' : 'bg-gray-700'
                    }`}></div>
                    <span>Gradient</span>
                  </div>
                </div>
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    theme.backgroundType === 'image'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-[#0a0f1f]/50 hover:border-gray-500'
                  }`}
                  onClick={() => handleBackgroundTypeChange('image')}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${
                      theme.backgroundType === 'image' ? 'bg-blue-500' : 'bg-gray-700'
                    }`}></div>
                    <span>Image</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Color (for solid) */}
            {theme.backgroundType === 'solid' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Background Color
                </label>
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-lg cursor-pointer border border-white/10"
                    style={{ backgroundColor: theme.backgroundColor || '#000000' }}
                    onClick={() => {
                      // This would open a color picker
                    }}
                  ></div>
                  <input
                    type="text"
                    value={theme.backgroundColor || '#000000'}
                    onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                    className="ml-3 flex-1 px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Background Gradient (for gradient) */}
            {theme.backgroundType === 'gradient' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Background Gradient
                </label>
                <input
                  type="text"
                  value={theme.backgroundGradient || 'linear-gradient(to bottom, #0f172a, #020617)'}
                  onChange={(e) => setTheme({ ...theme, backgroundGradient: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                />
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div
                    className="h-12 rounded-lg cursor-pointer"
                    style={{ background: 'linear-gradient(to right, #1a2a6c, #b21f1f, #fdbb2d)' }}
                    onClick={() => setTheme({ ...theme, backgroundGradient: 'linear-gradient(to right, #1a2a6c, #b21f1f, #fdbb2d)' })}
                  ></div>
                  <div
                    className="h-12 rounded-lg cursor-pointer"
                    style={{ background: 'linear-gradient(to right, #0f0c29, #302b63, #24243e)' }}
                    onClick={() => setTheme({ ...theme, backgroundGradient: 'linear-gradient(to right, #0f0c29, #302b63, #24243e)' })}
                  ></div>
                  <div
                    className="h-12 rounded-lg cursor-pointer"
                    style={{ background: 'linear-gradient(to right, #8e2de2, #4a00e0)' }}
                    onClick={() => setTheme({ ...theme, backgroundGradient: 'linear-gradient(to right, #8e2de2, #4a00e0)' })}
                  ></div>
                  <div
                    className="h-12 rounded-lg cursor-pointer"
                    style={{ background: 'linear-gradient(to right, #000428, #004e92)' }}
                    onClick={() => setTheme({ ...theme, backgroundGradient: 'linear-gradient(to right, #000428, #004e92)' })}
                  ></div>
                </div>
              </div>
            )}

            {/* Background Image (for image) */}
            {theme.backgroundType === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Background Image
                </label>
                <div className="flex items-center mb-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'background')}
                    className="hidden"
                    id="background-image-upload"
                  />
                  <label
                    htmlFor="background-image-upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    Upload Image
                  </label>
                  <input
                    type="text"
                    value={theme.backgroundImage || ''}
                    onChange={(e) => setTheme({ ...theme, backgroundImage: e.target.value })}
                    placeholder="Or enter image URL"
                    className="ml-3 flex-1 px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                  />
                </div>
                {(theme.backgroundImage || previewBackgroundImage) && (
                  <div className="mt-3 relative h-40 rounded-lg overflow-hidden">
                    <img
                      src={previewBackgroundImage || theme.backgroundImage}
                      alt="Background Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Typography */}
      <GlassCard elevation="flat">
        <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
          <h3 className="text-xl font-bold">Typography</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Font Family
              </label>
              <select
                value={theme.fontFamily || 'Inter, sans-serif'}
                onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Preview */}
            <div className="p-4 rounded-lg bg-[#0a0f1f]/50">
              <h4 className="text-lg font-bold mb-2" style={{ fontFamily: theme.fontFamily || 'Inter, sans-serif', color: theme.textColor }}>
                Typography Preview
              </h4>
              <p className="text-base" style={{ fontFamily: theme.fontFamily || 'Inter, sans-serif', color: theme.textColor }}>
                This is how your text will look with the selected font family and text color.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Logo */}
      <GlassCard elevation="flat">
        <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5">
          <h3 className="text-xl font-bold">Logo</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project Logo
              </label>
              <div className="flex items-center mb-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'logo')}
                  className="hidden"
                  id="logo-image-upload"
                />
                <label
                  htmlFor="logo-image-upload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  Upload Logo
                </label>
                <input
                  type="text"
                  value={theme.logoImage || ''}
                  onChange={(e) => setTheme({ ...theme, logoImage: e.target.value })}
                  placeholder="Or enter logo URL"
                  className="ml-3 flex-1 px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                />
              </div>
              {(theme.logoImage || previewLogoImage) && (
                <div className="mt-3 flex justify-center">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-[#0a0f1f]/50 p-2">
                    <img
                      src={previewLogoImage || theme.logoImage}
                      alt="Logo Preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Custom CSS */}
      <GlassCard elevation="flat">
        <div className="p-5 bg-[#0a0f1f] text-white border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-bold">Custom CSS</h3>
          <Button
            variant="glass"
            size="sm"
            onClick={() => setShowAiPrompt(!showAiPrompt)}
          >
            {showAiPrompt ? 'Cancel' : 'Generate with AI'}
          </Button>
        </div>
        <div className="p-6">
          {showAiPrompt ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Describe the style you want
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., Create a modern crypto dashboard style with glowing buttons, glass cards, and subtle animations"
                  className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg"
                  rows={3}
                />
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleGenerateCss}
                isLoading={isGenerating}
                disabled={isGenerating || !aiPrompt.trim()}
              >
                Generate CSS
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom CSS
                </label>
                <textarea
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  placeholder="Add your custom CSS here..."
                  className="w-full px-3 py-2 bg-[#0a0f1f] border border-gray-700 rounded-lg font-mono text-sm"
                  rows={10}
                />
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-400">
                  Custom CSS will be applied to your project page. Use class names like .custom-project-container, .custom-project-header, etc.
                </p>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
