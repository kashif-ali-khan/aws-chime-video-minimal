'use client';
import React, { useState, useEffect } from 'react';
import socketService, { CallRequest } from '../services/SocketService';
import { useVideoCall } from '../hooks/useVideoCall';
import Header from './components/header';
import Sidebar from './components/sidebar';
import VideoCallScreen from './components/video-call-screen';
import Questionnaire from './components/questionnaire';
import Conversation from './components/conversation';
import { getCaptureConfig, CaptureType } from '../config/captureConfig';
import { QuestionnairePayload, Question, QuestionnaireResponse, sampleQuestions } from '../data/questionnaire';

interface CustomerData {
  name: string;
  phone: string;
  address: string;
  email: string;
  policyNumber: string;
  idNumber: string;
  dob: string;
}

interface MessageData {
  type?: string;
  payload?: {
    imageId?: string;
    chunkIndex?: number;
    totalChunks?: number;
    imageChunk?: string;
    prefix?: string;
  };
}

export default function AgentInterface() {
  const [incomingCall, setIncomingCall] = useState<CallRequest | null>(null);
  const [currentCall, setCurrentCall] = useState<CallRequest | null>(null);
  const [agentId] = useState(() => `agent-${Math.random().toString(36).substring(7)}`);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  
  const [videoState, videoControls] = useVideoCall();

  // Capture states
  const [showOverlay, setShowOverlay] = useState(false);
  const [captureType, setCaptureType] = useState<CaptureType | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [customerImages, setCustomerImages] = useState<{
    face_captured?: string;
    id_captured?: string;
  }>({});
  const [transcriptionChunks, setTranscriptionChunks] = useState<Record<string, Record<number, string>>>({});

  const [customerData, setCustomerData] = useState<CustomerData>({
    name: 'Akhtar Sidiqui',
    phone: '9205107975',
    address: '81 Main St, City, State 110085',
    email: 'akhtar.siddi@ttn.com',
    policyNumber: 'POL-2024-001',
    idNumber: 'ID123456',
    dob: '10-Feb-1995',
  });

  const [callStats] = useState({
    completedCalls: 20,
    waitingCalls: 10,
    totalTime: '100 min',
    language: 'English'
  });

  // Questionnaire state
  const [questionnaireQuestions] = useState<Question[]>(sampleQuestions);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<Record<string, QuestionnaireResponse>>({});
  const [isQuestionnaireCompleted, setIsQuestionnaireCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isQuestionnaireStarted, setIsQuestionnaireStarted] = useState(false);
  const [customerAgreed, setCustomerAgreed] = useState(false);

  // Reset questionnaire to initial state
  const resetQuestionnaire = () => {
    setQuestionnaireResponses({});
    setIsQuestionnaireCompleted(false);
    setCurrentQuestionIndex(0);
    setIsQuestionnaireStarted(false);
    setCustomerAgreed(false);
  };

  useEffect(() => {
    // Register as agent
    const registerInterval = setInterval(() => {
      if (socketService.isConnected()) {
        socketService.socket?.send(JSON.stringify({
          type: 'register',
          data: { type: 'agent', userId: agentId }
        }));
        setIsSocketConnected(true);
        clearInterval(registerInterval);
      }
    }, 1000);

    // Listen for incoming calls
    const handleCallRequest = (data: unknown) => {
      if (typeof data === 'object' && data !== null && 'customerName' in data && 'timestamp' in data) {
        const callRequest = data as CallRequest;
        console.log('Received call request:', callRequest);
        setIncomingCall(callRequest);
        // Update customer data with incoming call info
        setCustomerData(prev => ({
          ...prev,
          name: callRequest.customerName || 'Unknown Customer'
        }));
      }
    };

    // Listen for call ended
    const handleCallEnded = (data: unknown) => {
      console.log('Call ended:', data);
      setCurrentCall(null);
      setIncomingCall(null);
      videoControls.endMeeting();
      resetQuestionnaire(); // Reset questionnaire when call ends
    };

    // Handle capture message chunks
    const handleCaptureMessage = (data: unknown) => {
      console.log('🔵 Agent received capture message:', data);
      const messageData = data as MessageData;
      if (typeof data === 'object' && data !== null && 'type' in data && 'payload' in data && 
          (messageData.type === 'face_captured_chunk' || messageData.type === 'id_captured_chunk')) {
        const { imageId, chunkIndex, totalChunks, imageChunk, prefix } = messageData.payload || {};
        console.log(`Received chunk ${(chunkIndex || 0) + 1}/${totalChunks} for ${messageData.type}`);
        
        setTranscriptionChunks(prev => {
          const key = `${messageData.type?.replace('_chunk', '')}_${imageId}`;
          const chunks = prev[key] || {};
          if (chunkIndex !== undefined && imageChunk) {
            chunks[chunkIndex] = imageChunk;
          }
          
          // Check if we have all chunks
          if (totalChunks && Object.keys(chunks).length === totalChunks) {
            // Reconstruct the image
            const sortedChunks = Object.keys(chunks).sort((a, b) => parseInt(a) - parseInt(b));
            const base64Data = sortedChunks.map(index => chunks[parseInt(index)]).join('');
            const fullImageData = (prefix || '') + base64Data;
            
            // Update customer images
            const imageType = messageData.type?.replace('_chunk', '') || '';
            console.log(`🟢 Image reconstructed for ${imageType}, data length:`, fullImageData.length);
            console.log(`🟢 Image data preview:`, fullImageData.substring(0, 100));
            
            // Ensure proper data URL format
            let validImageData = fullImageData;
            if (!fullImageData.startsWith('data:image/')) {
              console.log('⚠️ Image data missing data: prefix, adding default...');
              validImageData = `data:image/jpeg;base64,${fullImageData.replace(/^data:image\/[^;]+;base64,/, '')}`;
            }
            
            setCustomerImages(prevImages => {
              const newImages = {
                ...prevImages,
                [imageType]: validImageData
              };
              console.log('🟢 Updated customer images:', Object.keys(newImages));
              console.log('🟢 Final image data format:', validImageData.substring(0, 50));
              return newImages;
            });
            
            // Clean up chunks
            const newChunks = { ...prev };
            delete newChunks[key];
            return newChunks;
          }
          
          return {
            ...prev,
            [key]: chunks
          };
        });
      }
    };

    // Handle customer agreement
    const handleCustomerAgreed = (data: unknown) => {
      console.log('Customer agreed to verification summary:', data);
      setCustomerAgreed(true);
    };

    socketService.on('call_request', handleCallRequest);
    socketService.on('call_ended', handleCallEnded);
    socketService.on('face_captured_chunk', handleCaptureMessage);
    socketService.on('id_captured_chunk', handleCaptureMessage);
    socketService.on('customer_agreed', handleCustomerAgreed);

    return () => {
      socketService.off('call_request', handleCallRequest);
      socketService.off('call_ended', handleCallEnded);
      socketService.off('face_captured_chunk', handleCaptureMessage);
      socketService.off('id_captured_chunk', handleCaptureMessage);
      socketService.off('customer_agreed', handleCustomerAgreed);
      clearInterval(registerInterval);
    };
  }, [agentId, videoControls]);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      // Send call response
      socketService.sendCallResponse(incomingCall.id, true, agentId, incomingCall.meetingId);
      
      // Start video meeting
      await videoControls.startMeeting('agent', incomingCall.meetingId);
      
      // Notify that agent joined
      socketService.sendAgentJoined(incomingCall.meetingId, agentId);
      
      // Update state
      setCurrentCall(incomingCall);
      setIncomingCall(null);
      
      console.log('Call accepted and meeting started');
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

/*   const handleDeclineCall = () => {
    if (!incomingCall) return;
    
    socketService.sendCallResponse(incomingCall.id, false, agentId, incomingCall.meetingId);
    setIncomingCall(null);
  }; */

  const handleEndCall = () => {
    if (!currentCall) return;
    
    socketService.sendCallEnded(currentCall.id, currentCall.meetingId);
    videoControls.endMeeting();
    setCurrentCall(null);
    resetQuestionnaire(); // Reset questionnaire when agent ends call
  };

  // Face capture trigger function
  const triggerFaceCapture = () => {
    if (!currentCall) return;
    
    socketService.sendMessage('photo_ready', 'customer1');
    setShowOverlay(true);
    setCaptureType('face');
    
    setTimeout(() => {
      socketService.sendMessage('photo_capture', 'customer1');
      const config = getCaptureConfig('face');
      setCountdown(config.countdownSeconds);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowOverlay(false);
            setCaptureType(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 2000);
  };

  // ID capture trigger function
  const triggerIDCapture = () => {
    if (!currentCall) return;
    
    socketService.sendMessage('id_ready', 'customer1');
    setShowOverlay(true);
    setCaptureType('id');
    
    setTimeout(() => {
      socketService.sendMessage('id_capture', 'customer1');
      const config = getCaptureConfig('id');
      setCountdown(config.countdownSeconds);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowOverlay(false);
            setCaptureType(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 2000);
  };

  // Handle delete image
  const handleDeleteImage = (imageType: string) => {
    setCustomerImages(prev => ({
      ...prev,
      [imageType]: undefined
    }));
  };

  // Open image preview
  const openPreview = (imageType: string, imageSrc: string) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`<img src="${imageSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />`);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header 
        isSocketConnected={isSocketConnected}
        callStats={callStats}
      />

      {/* Main Dashboard */}
      <div className="flex justify-between h-[100vh]">
        <div className='w-[25%]'>
        {/* Left Sidebar - Customer Details */}
        <Sidebar 
          customerData={customerData}
          customerImages={customerImages}
          onDeleteImage={handleDeleteImage}
          onOpenPreview={openPreview}
        />
        </div>

        <div className='w-[65%]'>
          {/* middle - Video Call Area */}
          <VideoCallScreen 
            currentCall={currentCall}
            videoState={videoState}
            videoControls={videoControls}
            onAcceptCall={handleAcceptCall}
            onEndCall={handleEndCall}
            incomingCall={incomingCall}
            customerImages={customerImages}
            onTriggerFaceCapture={triggerFaceCapture}
            onTriggerIDCapture={triggerIDCapture}
            showOverlay={showOverlay}
            captureType={captureType}
            countdown={countdown}
          />

          {/* middle - Questionnaire Area */}
          <Questionnaire 
            isCallConnected={currentCall? true : false}
            questions={questionnaireQuestions}
            responses={questionnaireResponses}
            onResponseChange={setQuestionnaireResponses}
            onCompletionChange={setIsQuestionnaireCompleted}
            onCurrentQuestionChange={setCurrentQuestionIndex}
            onStartedChange={setIsQuestionnaireStarted}
            customerAgreed={customerAgreed}
            onSendMessage={(messageType, payload) => {
              console.log('🟡 Agent: Sending questionnaire message:', messageType, payload);
              socketService.sendQuestionnaireMessage(messageType as 'question_started' | 'questions_list' | 'question' | 'submit_response' | 'change_language' | 'questionnaire_completed', payload, 'customer1');
            }}
          />
        </div>

        <div className='w-[30%]'>
        {/* Right Side - conversation Area */}
          <Conversation 
            questions={questionnaireQuestions}
            customerAgreed={customerAgreed}
            responses={questionnaireResponses}
            isCompleted={isQuestionnaireCompleted}
            currentQuestionIndex={currentQuestionIndex}
            isStarted={isQuestionnaireStarted}
            onSubmit={() => {
              console.log('Questionnaire submitted with responses:', questionnaireResponses);
              // Handle questionnaire submission
            }}
          />
        </div>
      </div>

      {/* Hidden audio element for meeting audio */}
      <audio ref={videoState.audioRef} autoPlay />
    </div>
  );
}

