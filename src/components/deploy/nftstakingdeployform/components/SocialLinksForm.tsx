'use client'

import { SocialLinks } from '../types'

interface SocialLinksFormProps {
  socialLinks: SocialLinks
  onChange: (platform: string, value: string) => void
  className?: string
}

/**
 * Social links form component with platform-specific inputs
 */
export default function SocialLinksForm({ socialLinks, onChange, className = '' }: SocialLinksFormProps) {
  const platforms = [
    { key: 'website', label: 'Website', placeholder: 'https://yourproject.com' },
    { key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/yourproject' },
    { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/yourproject' },
    { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/yourproject' },
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourproject' },
    { key: 'whereToBuy', label: 'Where to Buy', placeholder: 'https://dex.com/swap' }
  ]

  return (
    <div className={`bg-gray-900/40 p-4 rounded-xl border border-gray-700/50 ${className}`}>
      <h5 className="text-gray-300 text-sm font-medium mb-4">Social Links</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <div key={platform.key}>
            <label className="block text-gray-300 text-xs font-medium mb-2">
              {platform.label}
            </label>
            <input
              type="url"
              value={socialLinks[platform.key as keyof SocialLinks]}
              onChange={(e) => onChange(platform.key, e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0072ff] focus:border-transparent transition-all text-sm"
              placeholder={platform.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
