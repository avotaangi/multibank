import React from 'react';
import { X, Info } from 'lucide-react';

const InfoPanel = ({ isOpen, onClose, title, content, color = '#3C82F6' }) => {
  if (!isOpen) return null;

  // Определяем цвета на основе основного цвета
  const headerBgColor = color;
  const headerTextColor = '#FFFFFF';
  const iconBgColor = 'rgba(255, 255, 255, 0.2)';
  const iconColor = '#FFFFFF';
  const contentBgColor = '#FFFFFF';
  const contentTextColor = '#1F2937';
  const bulletColor = color;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div
        className="fixed bottom-0 left-0 right-0 rounded-t-[27px] z-50 max-h-[80vh] overflow-y-auto"
        style={{
          animation: 'slideUpFromBottom 0.3s ease-out',
          backgroundColor: contentBgColor,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideUpFromBottom {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}</style>
        {/* Header */}
        <div 
          className="px-5 py-4 rounded-t-[27px]"
          style={{
            backgroundColor: headerBgColor,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: iconBgColor,
                }}
              >
                <Info className="w-5 h-5" style={{ color: iconColor }} />
              </div>
              <h2 
                className="font-ibm text-xl font-semibold"
                style={{ color: headerTextColor }}
              >
                {title || 'Информация'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              style={{ color: headerTextColor }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {typeof content === 'string' ? (
            <p 
              className="font-ibm text-sm leading-relaxed whitespace-pre-line"
              style={{ color: contentTextColor }}
            >
              {content}
            </p>
          ) : Array.isArray(content) ? (
            <ul className="space-y-3">
              {content.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div 
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" 
                    style={{ backgroundColor: bulletColor }}
                  />
                  <span 
                    className="font-ibm text-sm leading-relaxed"
                    style={{ color: contentTextColor }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div 
              className="font-ibm text-sm leading-relaxed"
              style={{ color: contentTextColor }}
            >
              {content}
            </div>
          )}
        </div>

        {/* Safe area padding */}
        <div className="h-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
      </div>
    </>
  );
};

export default InfoPanel;

