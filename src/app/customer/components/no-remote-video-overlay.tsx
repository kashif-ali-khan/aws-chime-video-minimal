import React from 'react';
import { UI_TEXT, ICON_SIZES, LAYOUT_CLASSES } from '../constants';

const NoRemoteVideoOverlay: React.FC = () => {
  return (
    <div className={LAYOUT_CLASSES.ABSOLUTE_OVERLAY}>
      <div className={`${LAYOUT_CLASSES.CENTER_CONTENT} text-white`}>
        <div className={`${ICON_SIZES.MEDIUM} bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center`}>
          <svg className={ICON_SIZES.EXTRA_SMALL} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-lg">{UI_TEXT.WAITING_FOR_AGENT_JOIN}</p>
      </div>
    </div>
  );
};

export default NoRemoteVideoOverlay;