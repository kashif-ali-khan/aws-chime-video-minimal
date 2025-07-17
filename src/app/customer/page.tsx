'use client';
import React, { useState, useEffect } from 'react';
import socketService, { CallResponse, CallRequest } from '../services/SocketService';
import { useVideoCall } from '../hooks/useVideoCall';
import Header from '../customer/components/header';

export default function CustomerInterface() {
  const [meetingId] = useState(`meetingId-${Math.random().toString(36).substring(7)}`);
  const [isConnected, setIsConnected] = useState(false);
  const [isWaitingForAgent, setIsWaitingForAgent] = useState(false);
  const [callRequestId, setCallRequestId] = useState<string | null>(null);
  const [customerId] = useState(() => `customer-${Math.random().toString(36).substring(7)}`);
  const [customerName] = useState(() => `Customer ${Math.floor(Math.random() * 1000)}`);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  
  const [videoState, videoControls] = useVideoCall();

  useEffect(() => {
    // Register as customer
    const registerInterval = setInterval(() => {
      if (socketService.isConnected()) {
        socketService.socket?.send(JSON.stringify({
          type: 'register',
          data: { type: 'customer', userId: customerId }
        }));
        setIsSocketConnected(true);
        clearInterval(registerInterval);
      }
    }, 1000);

    // Listen for call responses
    const handleCallResponse = (data: CallRequest | CallResponse | { callId: string; meetingId: string; } | { meetingId: string; agentId: string; } | { meetingId: string; customerId: string; }) => {
      console.log('Received call response:', data);
      
      if ('accepted' in data) {
        const response = data as CallResponse;
        setIsWaitingForAgent(false);
        startVideoCall(response.meetingId);
      } else {
        setIsWaitingForAgent(false);
        setCallRequestId(null);
        // Could show decline message
      }
    };

    interface AgentJoinedData {
      agentId: string;
      meetingId: string;
    }

    interface CallEndedData {
      meetingId: string;
      requestId: string;
    }

    // Listen for agent joined
    const handleAgentJoined = (data: CallRequest | CallResponse | { callId: string; meetingId: string; } | { meetingId: string; agentId: string; } | { meetingId: string; customerId: string; }) => {
      console.log('Agent joined:', data);
      if ('agentId' in data && 'meetingId' in data) {
        setIsConnected(true);
      }
    };

    // Listen for call ended
    const handleCallEnded = (data: CallRequest | CallResponse | { callId: string; meetingId: string; } | { meetingId: string; agentId: string; } | { meetingId: string; customerId: string; }) => {
      console.log('Call ended:', data);
      setIsConnected(false);
      setIsWaitingForAgent(false);
      setCallRequestId(null);
      videoControls.endMeeting();
    };

    socketService.on('call_response', handleCallResponse);
    socketService.on('agent_joined', handleAgentJoined);
    socketService.on('call_ended', handleCallEnded);

    return () => {
      socketService.off('call_response', handleCallResponse);
      socketService.off('agent_joined', handleAgentJoined);
      socketService.off('call_ended', handleCallEnded);
      clearInterval(registerInterval);
    };
  }, [customerId, customerName, videoControls]);

  const startVideoCall = async (meetingId: string) => {
    try {
      await videoControls.startMeeting('customer', meetingId);
      socketService.sendCustomerJoined(meetingId, customerId);
      setIsConnected(true);
    } catch (error) {
      console.error('Error starting video call:', error);
    }
  };

  const handleJoinCall = () => {
    if (!socketService.isConnected()) {
      console.error('Socket not connected');
      return;
    }

    const generatedMeetingId = meetingId || `meeting-${Date.now()}`;
    
    try {
      const requestId = socketService.sendCallRequest(customerName, generatedMeetingId);
      setCallRequestId(requestId);
      setIsWaitingForAgent(true);
      console.log('Call request sent:', requestId);
    } catch (error) {
      console.error('Error sending call request:', error);
    }
  };

  const handleEndCall = () => {
    if (callRequestId) {
      socketService.sendCallEnded(callRequestId, meetingId || '');
    }
    videoControls.endMeeting();
    setIsConnected(false);
    setIsWaitingForAgent(false);
    setCallRequestId(null);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <Header isSocketConnected={isSocketConnected} isConnected={isConnected} isWaitingForAgent={isWaitingForAgent} />

      {/* Main Video Area */}
      <div className="flex-1 relative">
        {!isConnected && !isWaitingForAgent && (
          <div className="h-screen flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-4">Connect with Agent</h2>
              <p className="text-gray-300 mb-8">Tap to start video call</p>
              <button
                onClick={handleJoinCall}
                disabled={!isSocketConnected}
                className={`py-3 px-8 rounded-full font-semibold transition-colors ${
                  isSocketConnected 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isSocketConnected ? 'Start Call' : 'Connecting...'}
              </button>
            </div>
          </div>
        )}

        {isWaitingForAgent && (
          <div className="h-screen flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-24 h-24 bg-orange-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-4">Waiting for Agent</h2>
              <p className="text-gray-300 mb-8">Please wait while we connect you to an available agent...</p>
              <button
                onClick={() => {
                  setIsWaitingForAgent(false);
                  setCallRequestId(null);
                }}
                className="bg-red-600 text-white py-2 px-6 rounded-full font-semibold hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="h-screen bg-black relative">
            {/* Local Video */}
            <video
              ref={videoState.localVideoRef}
              className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg object-cover z-10"
              autoPlay
              muted
              playsInline
            />
            
            {/* Remote Video */}
            <video
              ref={videoState.remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            
            {/* No Remote Video Overlay */}
            {!videoState.hasRemoteParticipant && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-lg">Waiting for agent to join...</p>
                </div>
              </div>
            )}
            
            {/* Call Controls Overlay */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-4">
                <button
                  onClick={videoControls.toggleAudioMute}
                  className={`p-4 rounded-full transition-colors shadow-lg ${
                    videoState.isAudioMuted 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {videoState.isAudioMuted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={handleEndCall}
                  className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l1.288 1.288M8 8l3 3m0 0l3-3m-3 3l-3-3m3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Call Status */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md">
              <p className="text-sm">Connected as {customerName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element for meeting audio */}
      <audio ref={videoState.audioRef} autoPlay />
    </div>
  );
}

