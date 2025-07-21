import { useState, useCallback } from 'react';
import { getCaptureConfig, getGeneralConfig, CaptureType, CAPTURE_CONFIG } from '../../config/captureConfig';
import { VideoCallState } from '../../hooks/useVideoCall';
import socketService from '../../services/SocketService';
import { IMAGE_PROCESSING, SOCKET_CONFIG } from '../constants';

interface UseImageCaptureProps {
  videoState: VideoCallState;
}

export const useImageCapture = ({ videoState }: UseImageCaptureProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [captureType, setCaptureType] = useState<CaptureType | null>(null);
  const [countdown, setCountdown] = useState(0);

  const startCountdown = useCallback((type: CaptureType) => {
    const config = getCaptureConfig(type);
    setCountdown(config.countdownSeconds);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          capturePhoto(SOCKET_CONFIG.AGENT_TARGET_ID, type);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const capturePhoto = useCallback(async (to: string, type: CaptureType) => {
    const video = videoState.localVideoRef.current;
    if (!video) {
      console.error("Local video element not available for capture.");
      return;
    }
    
    const canvas = document.createElement('canvas');
    if (video.readyState < video.HAVE_METADATA) {
      await new Promise(resolve => video.onloadedmetadata = resolve);
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw the full video frame first
    ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Create a temporary canvas for cropping
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    
    const config = getCaptureConfig(type);
    const generalConfig = getGeneralConfig();
    
    if (type === 'face') {
      // Circular crop for face
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * (config as typeof CAPTURE_CONFIG.face).cropRadius;
      
      tempCanvas.width = radius * 2;
      tempCanvas.height = radius * 2;
      
      // Create circular clipping path
      tempCtx.save();
      tempCtx.beginPath();
      tempCtx.arc(radius, radius, radius, 0, 2 * Math.PI);
      tempCtx.clip();
      
      // Draw the cropped portion
      tempCtx.drawImage(canvas, centerX - radius, centerY - radius, radius * 2, radius * 2, 0, 0, radius * 2, radius * 2);
      tempCtx.restore();
    } else {
      // Rectangular crop for ID
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const width = canvas.width * (config as typeof CAPTURE_CONFIG.id).cropWidth;
      const height = canvas.height * (config as typeof CAPTURE_CONFIG.id).cropHeight;
      
      tempCanvas.width = width;
      tempCanvas.height = height;
      
      // Draw the cropped portion
      tempCtx.drawImage(canvas, centerX - width/2, centerY - height/2, width, height, 0, 0, width, height);
    }
    
    const imageData = tempCanvas.toDataURL(generalConfig.imageFormat, generalConfig.imageQuality);
    sendBase64InChunks(to, type, imageData);
    
    setShowOverlay(false);
    setCaptureType(null);
  }, [videoState.localVideoRef]);

  const sendBase64InChunks = useCallback((to: string, type: CaptureType, imageData: string) => {
    const prefix = imageData.substring(0, imageData.indexOf(',') + 1);
    const base64Data = imageData.substring(imageData.indexOf(',') + 1);
    console.log('Sending base64 data in chunks to', to, 'Image size:', imageData.length, 'Type:', type);
    
    const totalChunks = Math.ceil(base64Data.length / IMAGE_PROCESSING.CHUNK_SIZE);
    const imageId = Date.now() + '-' + Math.random(); // unique id for image
    console.log('Total chunks:', totalChunks);
    
    for (let i = 0; i < totalChunks; i++) {
      const chunk = base64Data.slice(i * IMAGE_PROCESSING.CHUNK_SIZE, (i + 1) * IMAGE_PROCESSING.CHUNK_SIZE);
      socketService.sendMessage(`${type}_captured_chunk`, SOCKET_CONFIG.AGENT_TARGET_ID, {
        imageId,
        chunkIndex: i,
        totalChunks,
        imageChunk: chunk,
        prefix: i === 0 ? prefix : undefined,
      });
      console.log(`Sent chunk ${i + 1} of ${totalChunks}`);
    }
  }, []);

  const startCapture = useCallback((type: CaptureType) => {
    setCaptureType(type);
    setShowOverlay(true);
    
    // Start countdown after a brief delay for photo capture
    if (type === 'face') {
      setTimeout(() => startCountdown(type), IMAGE_PROCESSING.CAPTURE_DELAY);
    } else {
      setTimeout(() => startCountdown(type), IMAGE_PROCESSING.CAPTURE_DELAY);
    }
  }, [startCountdown]);

  return {
    showOverlay,
    captureType,
    countdown,
    startCapture,
  };
};