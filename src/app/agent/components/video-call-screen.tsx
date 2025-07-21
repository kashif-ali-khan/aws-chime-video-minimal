import React from "react";
import { FaCoffee, FaLock, FaCamera, FaExpand, FaPhoneSlash, FaPhone, FaMicrophoneAltSlash, FaMicrophone } from "react-icons/fa";
import Image from "next/image";
import placeholderImage from "../../people-communicating-through-video-call.png";
import { CallRequest } from '../../services/SocketService';
import { VideoCallState, VideoCallControls } from '../../hooks/useVideoCall';
import { CaptureType, getCaptureConfig, getGeneralConfig } from '../../config/captureConfig';

interface VideoCallScreenProps {
  currentCall: CallRequest | null;
  videoState: VideoCallState;
  videoControls: VideoCallControls;
  onAcceptCall: () => void;
  onEndCall: () => void;
  incomingCall: CallRequest | null;
  customerImages: {
    face_captured?: string;
    id_captured?: string;
  };
  onTriggerFaceCapture: () => void;
  onTriggerIDCapture: () => void;
  showOverlay: boolean;
  captureType: CaptureType | null;
  countdown: number;
}

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  currentCall,
  videoState,
  videoControls,
  onAcceptCall,
  onEndCall,
  incomingCall,
  onTriggerFaceCapture,
  onTriggerIDCapture,
  showOverlay,
  captureType,
  countdown
}) => {
    return (
        <div className="flex flex-col items-center p-4 bg-[#f3f4f6]">
            <div className="flex items-center justify-center space-x-4 w-full mb-4">
                {currentCall ? (
                    <button 
                        onClick={onEndCall}
                        className="bg-red-600 text-white px-6 py-2 rounded-full flex items-center gap-2 mb-4 hover:bg-red-700 transition-colors"
                    >
                        Hangup Call <FaPhoneSlash /> 
                    </button>
                ) : incomingCall ? (
                    <button 
                        onClick={onAcceptCall}
                        className="bg-green-600 text-white px-6 py-2 rounded-full flex items-center gap-2 mb-4 hover:bg-green-700 transition-colors"
                    >
                        Accept Call <FaPhone />
                    </button>
                ) : <></>}
            </div>

            <div className="flex w-full gap-4">
                {/* Video Section */}
                <div className="relative flex flex-col items-center bg-white p-2 rounded-xl shadow w-[100%]">
                    {/* Main Video */}
                    {currentCall ?  
                        <video
                            ref={videoState.remoteVideoRef}
                            className="w-full h-full object-cover rounded-lg bg-black"
                            autoPlay
                            playsInline
                        />
                    : 
                        <Image
                            src={placeholderImage}
                            alt="AXIS MAX LIFE INSURANCE"
                            className="w-auto bg-white p-1 rounded"
                            width={450}
                            height={350}
                        />
                    }

                    {/* Timer */}
                    {videoState.isConnected && ( <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">00:01</div>)}
                    
                    {/* Agent Thumbnail */}
                    {videoState.isConnected && (
                        <div className="absolute top-2 right-2 border border-black rounded-md overflow-hidden m-3 w-[120px] h-[120px]">
                            <video
                                ref={videoState.agentThumbnailRef}
                                className="w-full h-full object-cover rounded-lg"
                                autoPlay
                                muted
                                playsInline
                            />
                        </div>
                    )}

                    {/* Capture Status Overlay */}
                    {showOverlay && (() => {
                        const config = getCaptureConfig(captureType!);
                        const generalConfig = getGeneralConfig();
                        
                        return (
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
                                {/* Dark overlay outside capture area */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    backgroundColor: `rgba(0, 0, 0, ${generalConfig.backgroundOpacity})`
                                }} />
                                
                                {/* Capture area - Circle for face, Rectangle for ID */}
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    width: config.overlayWidth,
                                    height: config.overlayHeight,
                                    border: `${config.borderStyle} ${config.borderColor}`,
                                    borderRadius: config.borderRadius,
                                    backgroundColor: 'transparent',
                                    boxShadow: `0 0 0 9999px rgba(0, 0, 0, ${generalConfig.backgroundOpacity})`
                                }} />
                                
                                {/* Instructions */}
                                <div style={{
                                    position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)',
                                    color: 'white', fontSize: '18px', fontWeight: 'bold', textAlign: 'center',
                                    background: 'rgba(0, 0, 0, 0.7)', padding: '12px 24px', borderRadius: '8px'
                                }}>
                                    {config.instruction}
                                </div>
                                
                                {/* Countdown Display */}
                                {countdown > 0 && (
                                    <div style={{ 
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                                        zIndex: 20, backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <div style={{
                                            color: 'white', fontSize: '72px', fontWeight: 'bold',
                                            animation: 'pulse 1s infinite'
                                        }}>
                                            {countdown}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* Controls */}
                    {videoState.isConnected && <div className="absolute bottom-[11px] bg-[#F4F6FA] flex gap-4 mt-3 p-2 rounded-lg shadow">
                        <button 
                            onClick={videoControls.toggleAudioMute}
                            className={`p-2 rounded ${videoState.isAudioMuted ? 'bg-red-500 text-white' : 'text-[#424752]'}`}
                        >
                            {
                                videoState.isAudioMuted ? <FaMicrophoneAltSlash /> : <FaMicrophone />
                            }
                        </button>
                        <button 
                            onClick={onTriggerFaceCapture}
                            className="p-2 rounded text-[#424752] hover:bg-gray-200 transition-colors"
                            title="Capture Face Photo"
                        >
                            <FaCamera />
                        </button>
                        <button 
                            onClick={onTriggerIDCapture}
                            className="p-2 rounded text-[#424752] hover:bg-gray-200 transition-colors"
                            title="Capture ID Card"
                        >
                            <FaExpand />
                        </button>
                        <button className="p-2 rounded text-[#424752]">
                            <FaCoffee />
                        </button>
                        <button className="p-2 rounded text-[#424752]">
                            <FaLock />
                        </button>
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default VideoCallScreen;
