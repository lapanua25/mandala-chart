import React, { useEffect } from 'react';

interface AdSenseProps {
  client: string;
  slot: string;
  format?: 'auto' | 'fluid';
  responsive?: 'true' | 'false';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdSense: React.FC<AdSenseProps> = ({ 
  client, 
  slot, 
  format = 'auto', 
  responsive = 'true',
  className = ''
}) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className={`adsense-container flex-shrink-0 w-full flex justify-center overflow-hidden max-h-[100px] ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '300px', maxHeight: '90px' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};
