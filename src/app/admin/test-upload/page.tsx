'use client';

import { useState } from 'react';
import { uploadNftStakingLogoBackend } from '@/lib/api/upload-service';

export default function TestUploadPage() {
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<any>(null);

  const testBackendUpload = async () => {
    try {
      setStatus('Creating test file...');
      
      // Create a test image file
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, 100, 100);
      }
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      const file = new File([blob], 'test-image.png', { type: 'image/png' });
      
      setStatus('Uploading to backend...');
      const url = await uploadNftStakingLogoBackend(file, 'test-contract-123');
      
      setStatus('Upload successful!');
      setResult({ success: true, url });
    } catch (error: any) {
      setStatus('Upload failed!');
      setResult({ 
        success: false, 
        error: error.message,
        details: error
      });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Backend Upload</h1>
      
      <button
        onClick={testBackendUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Upload
      </button>
      
      <div className="mt-4">
        <p className="text-lg">Status: {status}</p>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-800 rounded">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}