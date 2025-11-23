'use client';

import { DApp } from '@/types/dapp';
import { Button } from '@/components/ui/button';
import { XIcon, Maximize2Icon, Minimize2Icon } from '@/components/icons';
import { useState } from 'react';

interface PreviewModalProps {
  dapp: DApp;
  onClose: () => void;
}

export default function PreviewModal({ dapp, onClose }: PreviewModalProps) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className={`bg-gray-900 flex flex-col ${fullscreen ? 'h-full' : 'h-[90vh] m-8 rounded-xl'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">Preview: {dapp.settings.name}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFullscreen(!fullscreen)}
              className="text-gray-400 hover:text-white"
            >
              {fullscreen ? <Minimize2Icon /> : <Maximize2Icon />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <XIcon />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`/dapp/preview?data=${encodeURIComponent(JSON.stringify(dapp))}`}
            className="w-full h-full"
            style={{ backgroundColor: dapp.theme.backgroundColor }}
          />
        </div>
      </div>
    </div>
  );
}