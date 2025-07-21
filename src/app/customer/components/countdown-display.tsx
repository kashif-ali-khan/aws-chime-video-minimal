import React from 'react';
import { VIDEO_CONFIG, Z_INDEX, ANIMATION_CLASSES } from '../constants';

interface CountdownDisplayProps {
  countdown: number;
}

const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ countdown }) => {
  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      zIndex: Z_INDEX.COUNTDOWN, 
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center'
    }}>
      <div style={{
        color: 'white', 
        fontSize: VIDEO_CONFIG.COUNTDOWN_FONT_SIZE, 
        fontWeight: 'bold',
        animation: ANIMATION_CLASSES.PULSE
      }}>
        {countdown}
      </div>
    </div>
  );
};

export default CountdownDisplay;