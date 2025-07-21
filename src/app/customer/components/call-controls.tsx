import React from 'react';
import { VideoCallState, VideoCallControls } from '../../hooks/useVideoCall';
import { BUTTON_STYLES, ICON_SIZES, LAYOUT_CLASSES } from '../constants';

interface CallControlsProps {
  videoState: VideoCallState;
  videoControls: VideoCallControls;
  onEndCall: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
  videoState,
  videoControls,
  onEndCall,
}) => {
  return (
    <div className={LAYOUT_CLASSES.BOTTOM_CONTROLS}>
      <div className={LAYOUT_CLASSES.FLEX_ROW}>
        {/* Audio Mute/Unmute Button */}
        <button
          onClick={videoControls.toggleAudioMute}
          className={`${BUTTON_STYLES.CALL_CONTROL} ${
            videoState.isAudioMuted 
              ? BUTTON_STYLES.AUDIO_MUTED
              : BUTTON_STYLES.AUDIO_ENABLED
          }`}
        >
          {videoState.isAudioMuted ? (
            <svg className={ICON_SIZES.CONTROL} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className={ICON_SIZES.CONTROL} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
        
        {/* End Call Button */}
        <button
          onClick={onEndCall}
          className={BUTTON_STYLES.END_CALL}
        >
          <svg className={ICON_SIZES.CONTROL} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l1.288 1.288M8 8l3 3m0 0l3-3m-3 3l-3-3m3 3l3 3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CallControls;