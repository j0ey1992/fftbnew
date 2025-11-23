'use client'

import { CollectionData } from '../types'

interface CollectionCardProps {
  collection: CollectionData
  index: number
  onUpdate: (field: string, value: any) => void
  onRemove: () => void
}

/**
 * Individual collection card component for NFT staking setup
 */
export default function CollectionCard({ collection, index, onUpdate, onRemove }: CollectionCardProps) {
  return (
    <div className="bg-gray-900/40 p-5 rounded-xl border border-gray-700/50">
      <div className="flex justify-between items-start mb-4">
        <h6 className="text-white font-medium">Collection {index + 1}</h6>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-900/20"
          title="Remove collection"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 text-xs font-medium mb-2">
            Collection Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={collection.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0072ff] focus:border-transparent transition-all text-sm"
            placeholder="e.g., Roo NFTs"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-xs font-medium mb-2">
            Contract Address <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={collection.address}
            onChange={(e) => onUpdate('address', e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0072ff] focus:border-transparent transition-all text-sm"
            placeholder="0x..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-300 text-xs font-medium mb-2">Description</label>
          <input
            type="text"
            value={collection.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0072ff] focus:border-transparent transition-all text-sm"
            placeholder="Optional description"
          />
        </div>
      </div>

      {/* Hidden field to maintain ratio value at 100 */}
      <input type="hidden" value={100} />
    </div>
  )
}
