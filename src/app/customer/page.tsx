'use client';
import React, { useState } from 'react';
import { useVideoCall } from '../hooks/useVideoCall';
import Header from './components/header';
import VerificationSummary from './components/verification-summary';
import CallConnectionScreen from './components/call-connection-screen';
import WaitingForAgentScreen from './components/waiting-for-agent-screen';
import VideoCallInterface from './components/video-call-interface';
import { useCustomerSocket } from './hooks/useCustomerSocket';
import { useVerificationSummary } from './hooks/useVerificationSummary';
import { useImageCapture } from './hooks/useImageCapture';
import { CUSTOMER_GENERATION, LAYOUT_CLASSES } from './constants';

export default function CustomerInterface() {
  // Generate unique identifiers
  const [meetingId] = useState(`${CUSTOMER_GENERATION.MEETING_ID_PREFIX}${Math.random().toString(36).substring(7)}`);
  const [customerId] = useState(() => `${CUSTOMER_GENERATION.ID_PREFIX}${Math.random().toString(36).substring(7)}`);
  const [customerName] = useState(() => `${CUSTOMER_GENERATION.NAME_PREFIX}${Math.floor(Math.random() * CUSTOMER_GENERATION.MAX_CUSTOMER_NUMBER)}`);
  
  // Video call hook
  const [videoState, videoControls] = useVideoCall();
  
  // Image capture hook
  const imageCapture = useImageCapture({ videoState });

  // Video call start handler
  const handleVideoCallStart = async (meetingId: string) => {
    try {
      await videoControls.startMeeting('customer', meetingId);
      socketHook.sendCustomerJoined(meetingId, customerId);
    } catch (error) {
      console.error('Error starting video call:', error);
    }
  };

  // Capture start handler
  const handleCaptureStart = (type: 'face' | 'id') => {
    imageCapture.startCapture(type);
  };

  // Socket management hook
  const socketHook = useCustomerSocket({
    customerId,
    onVideoCallStart: handleVideoCallStart,
    onCaptureStart: handleCaptureStart,
  });

  // Verification summary hook
  const verificationSummary = useVerificationSummary({
    questionnaireStarted: socketHook.questionnaireStarted,
    questionsList: socketHook.questionsList,
    questionnaireResponses: socketHook.questionnaireResponses,
    onCustomerAgreement: socketHook.sendCustomerAgreement,
  });

  // Call management handlers
  const handleJoinCall = () => {
    const generatedMeetingId = meetingId || `meeting-${Date.now()}`;
    socketHook.sendCallRequest(customerName, generatedMeetingId);
  };

  const handleEndCall = () => {
    socketHook.sendCallEnded(meetingId || '');
    videoControls.endMeeting();
  };

  const handleCancelWaiting = () => {
    socketHook.cancelWaiting();
  };

  return (
    <div className={LAYOUT_CLASSES.FULL_SCREEN}>
      {/* Header */}
      <Header 
        isSocketConnected={socketHook.isSocketConnected} 
        isConnected={socketHook.isConnected} 
        isWaitingForAgent={socketHook.isWaitingForAgent} 
      />

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {/* Connection Screen */}
        {!socketHook.isConnected && !socketHook.isWaitingForAgent && (
          <CallConnectionScreen
            isSocketConnected={socketHook.isSocketConnected}
            onJoinCall={handleJoinCall}
          />
        )}

        {/* Waiting Screen */}
        {socketHook.isWaitingForAgent && (
          <WaitingForAgentScreen onCancel={handleCancelWaiting} />
        )}

        {/* Video Call Interface */}
        {socketHook.isConnected && (
          <VideoCallInterface
            videoState={videoState}
            videoControls={videoControls}
            onEndCall={handleEndCall}
            questionnaireStarted={socketHook.questionnaireStarted}
            currentQuestion={socketHook.currentQuestion}
            questionIndex={socketHook.questionIndex}
            totalQuestions={socketHook.totalQuestions}
            questionnaireCompleted={socketHook.questionnaireCompleted}
            questionnaireResponses={socketHook.questionnaireResponses}
            showOverlay={imageCapture.showOverlay}
            captureType={imageCapture.captureType}
            countdown={imageCapture.countdown}
          />
        )}
      </div>

      {/* Hidden audio element for meeting audio */}
      <audio ref={videoState.audioRef} autoPlay />

      {/* Verification Summary Modal */}
      <VerificationSummary
        questions={socketHook.questionsList}
        responses={socketHook.questionnaireResponses}
        isVisible={verificationSummary.showVerificationSummary}
        onAgree={verificationSummary.handleCustomerAgreement}
        onClose={verificationSummary.handleVerificationSummaryClose}
      />
    </div>
  );
}