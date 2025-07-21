import React from 'react';
import { getCaptureConfig, getGeneralConfig, CaptureType } from '../../config/captureConfig';
import { Z_INDEX } from '../constants';

interface CaptureOverlayProps {
  captureType: CaptureType;
}

const CaptureOverlay: React.FC<CaptureOverlayProps> = ({ captureType }) => {
  const config = getCaptureConfig(captureType);
  const generalConfig = getGeneralConfig();

  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      zIndex: Z_INDEX.OVERLAY 
    }}>
      {/* Dark overlay outside capture area */}
      <div style={{
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        backgroundColor: `rgba(0, 0, 0, ${generalConfig.backgroundOpacity})`
      }} />
      
      {/* Capture area - Circle for face, Rectangle for ID */}
      <div style={{
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: config.overlayWidth,
        height: config.overlayHeight,
        border: `${config.borderStyle} ${config.borderColor}`,
        borderRadius: config.borderRadius,
        backgroundColor: 'transparent',
        boxShadow: `0 0 0 9999px rgba(0, 0, 0, ${generalConfig.backgroundOpacity})`
      }} />
      
      {/* Instructions */}
      <div style={{
        position: 'absolute', 
        bottom: '20%', 
        left: '50%', 
        transform: 'translateX(-50%)',
        color: 'white', 
        fontSize: '18px', 
        fontWeight: 'bold', 
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.7)', 
        padding: '12px 24px', 
        borderRadius: '8px'
      }}>
        {config.instruction}
      </div>
    </div>
  );
};

export default CaptureOverlay;