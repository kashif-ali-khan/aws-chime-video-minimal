import { useState, useEffect, useCallback } from 'react';
import socketService, { CallResponse } from '../../services/SocketService';
import { Question, QuestionOption, QuestionnairePayload, QUESTIONNAIRE_MESSAGE_TYPES } from '../../data/questionnaire';
import { SOCKET_CONFIG, LOG_PREFIXES } from '../constants';

interface SocketMessageData {
  payload?: QuestionnairePayload;
}

interface CustomerResponse {
  selectedOption: QuestionOption;
  timestamp: Date;
}

interface UseCustomerSocketProps {
  customerId: string;
  onVideoCallStart: (meetingId: string) => void;
  onCaptureStart: (type: 'face' | 'id') => void;
}

export const useCustomerSocket = ({ customerId, onVideoCallStart, onCaptureStart }: UseCustomerSocketProps) => {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  
  // Call states
  const [isConnected, setIsConnected] = useState(false);
  const [isWaitingForAgent, setIsWaitingForAgent] = useState(false);
  const [callRequestId, setCallRequestId] = useState<string | null>(null);
  
  // Questionnaire states
  const [questionnaireStarted, setQuestionnaireStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<Record<string, CustomerResponse>>({});
  const [questionsList, setQuestionsList] = useState<Question[]>([]);

  // Socket event handlers
  const handleCallResponse = useCallback((data: unknown) => {
    console.log('Received call response:', data);
    
    if (typeof data === 'object' && data !== null && 'accepted' in data) {
      const response = data as CallResponse;
      setIsWaitingForAgent(false);
      onVideoCallStart(response.meetingId);
    } else {
      setIsWaitingForAgent(false);
      setCallRequestId(null);
    }
  }, [onVideoCallStart]);

  const handleAgentJoined = useCallback((data: unknown) => {
    console.log('Agent joined:', data);
    if (typeof data === 'object' && data !== null && 'agentId' in data && 'meetingId' in data) {
      setIsConnected(true);
    }
  }, []);

  const handleCallEnded = useCallback((data: unknown) => {
    console.log('Call ended:', data);
    setIsConnected(false);
    setIsWaitingForAgent(false);
    setCallRequestId(null);
  }, []);

  const handlePhotoReady = useCallback((data: unknown) => {
    console.log('Photo ready received:', data);
    onCaptureStart('face');
  }, [onCaptureStart]);

  const handlePhotoCapture = useCallback((data: unknown) => {
    console.log('Photo capture received:', data);
  }, []);

  const handleIdReady = useCallback((data: unknown) => {
    console.log('ID ready received:', data);
    onCaptureStart('id');
  }, [onCaptureStart]);

  const handleIdCapture = useCallback((data: unknown) => {
    console.log('ID capture received:', data);
  }, []);

  const handleQuestionnaireStarted = useCallback((data: unknown) => {
    console.log(LOG_PREFIXES.QUESTIONNAIRE_STARTED, data);
    const messageData = data as SocketMessageData;
    setQuestionnaireStarted(true);
    setQuestionnaireCompleted(false);
    setQuestionnaireResponses({});
    if (messageData.payload?.totalQuestions) {
      setTotalQuestions(messageData.payload.totalQuestions);
    }
    console.log(LOG_PREFIXES.QUESTIONNAIRE_STATE_UPDATED, true);
  }, []);

  const handleQuestionsList = useCallback((data: unknown) => {
    console.log('Questions list received:', data);
    const messageData = data as SocketMessageData;
    if (messageData.payload?.questions) {
      setQuestionsList(messageData.payload.questions);
    }
  }, []);

  const handleQuestion = useCallback((data: unknown) => {
    console.log(LOG_PREFIXES.QUESTION_RECEIVED, data);
    const messageData = data as SocketMessageData;
    if (messageData.payload?.question) {
      setCurrentQuestion(messageData.payload.question);
      setQuestionIndex(messageData.payload.questionIndex || 0);
      setTotalQuestions(messageData.payload.totalQuestions || totalQuestions);
      console.log(LOG_PREFIXES.QUESTION_STATE_UPDATED, messageData.payload.question);
    }
  }, [totalQuestions]);

  const handleSubmitResponse = useCallback((data: unknown) => {
    console.log('Response submitted:', data);
    const messageData = data as SocketMessageData;
    if (messageData.payload?.questionId && messageData.payload?.response) {
      const questionId = messageData.payload.questionId;
      setQuestionnaireResponses(prev => ({
        ...prev,
        [questionId]: {
          selectedOption: messageData.payload?.response as QuestionOption,
          timestamp: new Date()
        }
      }));
    }
  }, []);

  const handleQuestionnaireCompleted = useCallback((data: unknown) => {
    console.log('Questionnaire completed:', data);
    setQuestionnaireCompleted(true);
    setCurrentQuestion(null);
  }, []);

  // Setup socket connection and listeners
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
    }, SOCKET_CONFIG.REGISTRATION_INTERVAL);

    // Register event listeners
    socketService.on('call_response', handleCallResponse);
    socketService.on('agent_joined', handleAgentJoined);
    socketService.on('call_ended', handleCallEnded);
    socketService.on('photo_ready', handlePhotoReady);
    socketService.on('photo_capture', handlePhotoCapture);
    socketService.on('id_ready', handleIdReady);
    socketService.on('id_capture', handleIdCapture);
    socketService.on('question_started', handleQuestionnaireStarted);
    socketService.on('questions_list', handleQuestionsList);
    socketService.on('question', handleQuestion);
    socketService.on('submit_response', handleSubmitResponse);
    socketService.on('questionnaire_completed', handleQuestionnaireCompleted);

    return () => {
      // Cleanup
      socketService.off('call_response', handleCallResponse);
      socketService.off('agent_joined', handleAgentJoined);
      socketService.off('call_ended', handleCallEnded);
      socketService.off('photo_ready', handlePhotoReady);
      socketService.off('photo_capture', handlePhotoCapture);
      socketService.off('id_ready', handleIdReady);
      socketService.off('id_capture', handleIdCapture);
      socketService.off('question_started', handleQuestionnaireStarted);
      socketService.off('questions_list', handleQuestionsList);
      socketService.off('question', handleQuestion);
      socketService.off('submit_response', handleSubmitResponse);
      socketService.off('questionnaire_completed', handleQuestionnaireCompleted);
      clearInterval(registerInterval);
    };
  }, [
    customerId,
    handleCallResponse,
    handleAgentJoined,
    handleCallEnded,
    handlePhotoReady,
    handlePhotoCapture,
    handleIdReady,
    handleIdCapture,
    handleQuestionnaireStarted,
    handleQuestionsList,
    handleQuestion,
    handleSubmitResponse,
    handleQuestionnaireCompleted,
  ]);

  // Socket actions
  const sendCallRequest = useCallback((customerName: string, meetingId: string) => {
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
  }, []);

  const sendCallEnded = useCallback((meetingId: string) => {
    if (callRequestId) {
      socketService.sendCallEnded(callRequestId, meetingId);
    }
    setIsConnected(false);
    setIsWaitingForAgent(false);
    setCallRequestId(null);
  }, [callRequestId]);

  const sendCustomerJoined = useCallback((meetingId: string, customerId: string) => {
    socketService.sendCustomerJoined(meetingId, customerId);
    setIsConnected(true);
  }, []);

  const sendCustomerAgreement = useCallback((responses: Record<string, CustomerResponse>) => {
    // Convert CustomerResponse to QuestionnaireResponse format  
    const convertedResponses: Record<string, { questionId: string; selectedOption: QuestionOption; timestamp: Date }> = {};
    Object.keys(responses).forEach(questionId => {
      const customerResponse = responses[questionId];
      convertedResponses[questionId] = {
        questionId,
        selectedOption: customerResponse.selectedOption,
        timestamp: customerResponse.timestamp
      };
    });
    
    socketService.sendQuestionnaireMessage(
      QUESTIONNAIRE_MESSAGE_TYPES.CUSTOMER_AGREED,
      { responses: convertedResponses },
      SOCKET_CONFIG.AGENT_TARGET_ID
    );
  }, []);

  const cancelWaiting = useCallback(() => {
    setIsWaitingForAgent(false);
    setCallRequestId(null);
  }, []);

  return {
    // States
    isSocketConnected,
    isConnected,
    isWaitingForAgent,
    callRequestId,
    questionnaireStarted,
    currentQuestion,
    questionIndex,
    totalQuestions,
    questionnaireCompleted,
    questionnaireResponses,
    questionsList,
    
    // Actions
    sendCallRequest,
    sendCallEnded,
    sendCustomerJoined,
    sendCustomerAgreement,
    cancelWaiting,
  };
};