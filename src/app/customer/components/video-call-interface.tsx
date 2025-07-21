import React from 'react';
import { VideoCallState, VideoCallControls } from '../../hooks/useVideoCall';
import QuestionnaireDisplay from './questionnaire-display';
import CaptureOverlay from './capture-overlay';
import CallControls from './call-controls';
import NoRemoteVideoOverlay from './no-remote-video-overlay';
import CountdownDisplay from './countdown-display';
import { Question, QuestionOption } from '../../data/questionnaire';
import { CaptureType } from '../../config/captureConfig';
import { VIDEO_CONFIG, LAYOUT_CLASSES } from '../constants';

interface CustomerResponse {
  selectedOption: QuestionOption;
  timestamp: Date;
}

interface VideoCallInterfaceProps {
  videoState: VideoCallState;
  videoControls: VideoCallControls;
  onEndCall: () => void;
  
  // Questionnaire props
  questionnaireStarted: boolean;
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  questionnaireCompleted: boolean;
  questionnaireResponses: Record<string, CustomerResponse>;
  
  // Capture props
  showOverlay: boolean;
  captureType: CaptureType | null;
  countdown: number;
}

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  videoState,
  videoControls,
  onEndCall,
  questionnaireStarted,
  currentQuestion,
  questionIndex,
  totalQuestions,
  questionnaireCompleted,
  questionnaireResponses,
  showOverlay,
  captureType,
  countdown,
}) => {
  return (
    <div className="h-screen bg-black relative">
      {/* Questionnaire Display */}
      <QuestionnaireDisplay
        isStarted={questionnaireStarted}
        currentQuestion={currentQuestion}
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        isCompleted={questionnaireCompleted}
        responses={questionnaireResponses}
      />
      
      {/* Local Video (Agent's view) */}
      <video
        ref={videoState.remoteVideoRef}
        className={VIDEO_CONFIG.LOCAL_VIDEO_CLASSES}
        autoPlay
        muted
        playsInline
      />
      
      {/* Remote Video (Customer's main view) */}
      <video
        ref={videoState.localVideoRef}
        className={VIDEO_CONFIG.REMOTE_VIDEO_CLASSES}
        autoPlay
        playsInline
      />

      {/* Capture Overlay */}
      {showOverlay && captureType && (
        <CaptureOverlay captureType={captureType} />
      )}

      {/* Countdown Display */}
      {countdown > 0 && (
        <CountdownDisplay countdown={countdown} />
      )}
      
      {/* No Remote Video Overlay */}
      {!videoState.hasRemoteParticipant && (
        <NoRemoteVideoOverlay />
      )}
      
      {/* Call Controls */}
      <CallControls
        videoState={videoState}
        videoControls={videoControls}
        onEndCall={onEndCall}
      />
    </div>
  );
};

export default VideoCallInterface;