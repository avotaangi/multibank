import React from 'react';
import { useTelegramFullscreen } from '../hooks/useTelegramFullscreen';

const FullscreenButton = ({ className = '' }) => {
  const { isFullscreen, isTelegram, toggleFullscreen } = useTelegramFullscreen();

  if (!isTelegram) {
    return null; // Don't show button if not in Telegram
  }

  return (
    <button
      onClick={toggleFullscreen}
      className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors ${className}`}
      title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
    >
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        {isFullscreen ? (
          // Exit fullscreen icon
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5" 
          />
        ) : (
          // Enter fullscreen icon
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" 
          />
        )}
      </svg>
    </button>
  );
};

export default FullscreenButton;
