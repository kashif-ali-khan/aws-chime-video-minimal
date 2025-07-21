import React from 'react';
import { UI_TEXT, BUTTON_STYLES, ICON_SIZES, LAYOUT_CLASSES, ANIMATION_CLASSES } from '../constants';

interface WaitingForAgentScreenProps {
  onCancel: () => void;
}

const WaitingForAgentScreen: React.FC<WaitingForAgentScreenProps> = ({
  onCancel,
}) => {
  return (
    <div className={LAYOUT_CLASSES.CENTER_SCREEN}>
      <div className={LAYOUT_CLASSES.CENTER_CONTENT}>
        <div className={`${ICON_SIZES.LARGE} bg-orange-600 rounded-full mx-auto mb-6 flex items-center justify-center`}>
          <svg 
            className={`${ICON_SIZES.SMALL} text-white ${ANIMATION_CLASSES.SPIN}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-4">
          {UI_TEXT.WAITING_FOR_AGENT}
        </h2>
        
        <p className="text-gray-300 mb-8">
          {UI_TEXT.WAITING_MESSAGE}
        </p>
        
        <button
          onClick={onCancel}
          className={BUTTON_STYLES.CANCEL}
        >
          {UI_TEXT.CANCEL}
        </button>
      </div>
    </div>
  );
};

export default WaitingForAgentScreen;