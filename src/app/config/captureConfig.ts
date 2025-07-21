export const CAPTURE_CONFIG = {
  face: {
    overlayWidth: '75%',
    overlayHeight: '75%',
    cropRadius: 0.35,
    borderColor: '#2ecc71',
    borderStyle: '4px dashed',
    borderRadius: '50%',
    instruction: 'Position your face within the circle',
    countdownSeconds: 3,
  },
  id: {
    overlayWidth: '85%',
    overlayHeight: '60%',
    cropWidth: 0.7,
    cropHeight: 0.5,
    borderColor: '#f1c40f',
    borderStyle: '4px dashed',
    borderRadius: '12px',
    instruction: 'Show your ID card within the rectangle',
    countdownSeconds: 3,
  },
  general: {
    backgroundOpacity: 0.6,
    imageQuality: 0.9,
    imageFormat: 'image/jpeg',
    animationDuration: '0.3s',
  }
};

export type CaptureType = 'face' | 'id';

export function getCaptureConfig(type: CaptureType) {
  return CAPTURE_CONFIG[type];
}

export function getGeneralConfig() {
  return CAPTURE_CONFIG.general;
}