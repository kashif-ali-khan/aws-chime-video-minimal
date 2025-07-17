'use client';
import React, { useState, useEffect } from 'react';
import socketService, { CallRequest } from '../services/SocketService';
import { useVideoCall } from '../hooks/useVideoCall';
import Header from './components/header';
import Sidebar from './components/sidebar';
import VideoCallScreen from './components/video-call-screen';
import Questionnaire from './components/questionnaire';
import Conversation from './components/conversation';

interface CustomerData {
  name: string;
  phone: string;
  address: string;
  email: string;
  policyNumber: string;
  idNumber: string;
  dob: string;
}

export default function AgentInterface({ meetingId }: { meetingId?: string }) {
  const [incomingCall, setIncomingCall] = useState<CallRequest | null>(null);
  const [currentCall, setCurrentCall] = useState<CallRequest | null>(null);
  const [agentId] = useState(() => `agent-${Math.random().toString(36).substring(7)}`);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  
  const [videoState, videoControls] = useVideoCall();

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
    const handleCallRequest = (data: CallRequest | { callId: string; meetingId: string; } | { meetingId: string; agentId: string; } | { meetingId: string; customerId: string; }) => {
      if ('customerName' in data && 'timestamp' in data) {
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
    const handleCallEnded = (data: CallRequest | { callId: string; meetingId: string; } | { meetingId: string; agentId: string; } | { meetingId: string; customerId: string; }) => {
      console.log('Call ended:', data);
      setCurrentCall(null);
      setIncomingCall(null);
      videoControls.endMeeting();
    };

    socketService.on('call_request', handleCallRequest);
    socketService.on('call_ended', handleCallEnded);

    return () => {
      socketService.off('call_request', handleCallRequest);
      socketService.off('call_ended', handleCallEnded);
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
          />

          {/* middle - Questionnaire Area */}
          <Questionnaire />
        </div>

        <div className='w-[30%]'>
        {/* Right Side - conversation Area */}
          <Conversation />
          </div>
      </div>

      {/* Hidden audio element for meeting audio */}
      <audio ref={videoState.audioRef} autoPlay />
    </div>
  );
}

