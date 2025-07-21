import React from 'react';
import { UI_TEXT, BUTTON_STYLES, ICON_SIZES, LAYOUT_CLASSES, ANIMATION_CLASSES } from '../constants';

interface CallConnectionScreenProps {
  isSocketConnected: boolean;
  onJoinCall: () => void;
}

const CallConnectionScreen: React.FC<CallConnectionScreenProps> = ({
  isSocketConnected,
  onJoinCall,
}) => {
  return (
    <div className={LAYOUT_CLASSES.CENTER_SCREEN}>
      <div className={LAYOUT_CLASSES.CENTER_CONTENT}>
        <div className={`${ICON_SIZES.LARGE} bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center`}>
          <svg className={`${ICON_SIZES.SMALL} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-4">
          {UI_TEXT.CONNECT_WITH_AGENT}
        </h2>
        
        <p className="text-gray-300 mb-8">
          {UI_TEXT.TAP_TO_START}
        </p>
        
        <button
          onClick={onJoinCall}
          disabled={!isSocketConnected}
          className={`py-3 px-8 rounded-full font-semibold ${ANIMATION_CLASSES.TRANSITION_COLORS} ${
            isSocketConnected 
              ? BUTTON_STYLES.PRIMARY_ENABLED
              : BUTTON_STYLES.PRIMARY_DISABLED
          }`}
        >
          {isSocketConnected ? UI_TEXT.START_CALL : UI_TEXT.CONNECTING}
        </button>
      </div>
    </div>
  );
};

export default CallConnectionScreen;