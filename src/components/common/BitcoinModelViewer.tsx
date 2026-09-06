import React from 'react';

interface BitcoinModelViewerProps {
  className?: string;
  autoRotate?: boolean;
}

export const BitcoinModelViewer: React.FC<BitcoinModelViewerProps> = ({ 
  className = "w-full h-full", 
  autoRotate = true 
}) => {
  return (
    <div className={className}>
      <model-viewer
        src="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/bitcoin/model.gltf"
        alt="A 3D model of a Bitcoin"
        auto-rotate={autoRotate ? "true" : undefined}
        camera-controls
        environment-image="neutral"
        exposure="1.2"
        shadow-intensity="1"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      />
    </div>
  );
};
