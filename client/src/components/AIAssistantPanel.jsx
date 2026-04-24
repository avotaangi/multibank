import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MultibankAIIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="6" fill="url(#ai-multibank-gradient)" />
    <circle cx="8" cy="12" r="1.7" fill="white" />
    <circle cx="12" cy="8" r="1.7" fill="white" />
    <circle cx="16" cy="12" r="1.7" fill="white" />
    <path d="M9.4 10.8 10.7 9.5M13.3 9.5l1.3 1.3M9.7 13.1h4.6" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
    <defs>
      <linearGradient id="ai-multibank-gradient" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#111827" />
        <stop offset="1" stopColor="#4B5563" />
      </linearGradient>
    </defs>
  </svg>
);

const AIAssistantPanel = ({
  title = 'AI-помощник',
  items = [],
  renderTrigger = null,
  panelClassName = '',
  defaultOpen = false,
  hideTrigger = false,
}) => {
  const [openItemIds, setOpenItemIds] = useState(() => new Set());
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const toggleItem = (id) => {
    setOpenItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const togglePanel = () => {
    setIsOpen((prev) => !prev);
  };

  const triggerIcon = <MultibankAIIcon />;

  const panel = (
    <div className={`mt-3 rounded-[24px] border border-gray-200 bg-white overflow-hidden ${panelClassName}`}>
      <div className="px-4 py-2 bg-white">
        {items.map((item, index) => {
          const isExpanded = openItemIds.has(item.id);
          return (
            <div
              key={item.id}
              className={`${index !== items.length - 1 ? 'border-b border-gray-100' : ''} py-3`}
            >
              <div className="text-black font-ibm text-base font-medium leading-[120%] mb-2">
                {item.title}
              </div>
              <div className="text-gray-700 font-ibm text-sm leading-[140%]">
                {item.text}
              </div>
              {item.explanation && (
                <>
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-black transition-colors"
                  >
                    {item.actionLabel || 'Почему так?'}
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {isExpanded && (
                    <div className="mt-2 rounded-2xl bg-gray-100 px-3 py-3 text-gray-600 font-ibm text-sm leading-[140%]">
                      {item.explanation}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {!hideTrigger && (typeof renderTrigger === 'function' ? (
        renderTrigger({ isOpen, togglePanel, icon: triggerIcon })
      ) : (
        <button
          type="button"
          onClick={togglePanel}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 hover:bg-black transition-colors align-middle flex-shrink-0"
          title="AI Мультибанк"
          aria-label={`Открыть рекомендации: ${title}`}
        >
          {triggerIcon}
        </button>
      ))}
      {isOpen && panel}
    </div>
  );
};

export default AIAssistantPanel;
