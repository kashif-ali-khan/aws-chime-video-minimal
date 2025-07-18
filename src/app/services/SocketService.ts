import SockJS from 'sockjs-client';

export interface CallRequest {
  id: string;
  customerName: string;
  meetingId: string;
  timestamp: string;
}

export interface CallResponse {
  id: string;
  accepted: boolean;
  agentId: string;
  meetingId: string;
}

export interface CallEvent {
  type: 'call_request' | 'call_response' | 'call_ended' | 'agent_joined' | 'customer_joined';
  data: CallRequest | CallResponse | { callId: string; meetingId: string } | { meetingId: string; agentId: string } | { meetingId: string; customerId: string };
}

type CallEventListener = (data: CallEvent['data']) => void;

class SocketService {
  public socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private listeners: Map<string, CallEventListener[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      this.socket = new SockJS(`${backendUrl}/socket`, null, {
        transports: ['websocket', 'xhr-streaming', 'xhr-polling']
      });
      
      this.socket.onopen = () => {
        console.log('Socket connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const callEvent: CallEvent = JSON.parse(event.data);
          this.handleMessage(callEvent);
        } catch (error) {
          console.error('Error parsing socket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('Socket disconnected');
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('Socket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to socket:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(event: CallEvent) {
    const listeners = this.listeners.get(event.type) || [];
    listeners.forEach(listener => listener(event.data));
  }

  // Subscribe to events
  on(eventType: string, callback: CallEventListener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  // Unsubscribe from events
  off(eventType: string, callback: CallEventListener) {
    const listeners = this.listeners.get(eventType) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  // Send call request (customer to agent)
  sendCallRequest(customerName: string, meetingId: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const callRequest: CallRequest = {
        id: Math.random().toString(36).substring(7),
        customerName,
        meetingId,
        timestamp: new Date().toISOString()
      };

      const event: CallEvent = {
        type: 'call_request',
        data: callRequest
      };

      this.socket.send(JSON.stringify(event));
      return callRequest.id;
    }
    throw new Error('Socket not connected');
  }

  // Send call response (agent to customer)
  sendCallResponse(callId: string, accepted: boolean, agentId: string, meetingId: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const callResponse: CallResponse = {
        id: callId,
        accepted,
        agentId,
        meetingId
      };

      const event: CallEvent = {
        type: 'call_response',
        data: callResponse
      };

      this.socket.send(JSON.stringify(event));
    }
  }

  // Notify call ended
  sendCallEnded(callId: string, meetingId: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const event: CallEvent = {
        type: 'call_ended',
        data: { callId, meetingId }
      };

      this.socket.send(JSON.stringify(event));
    }
  }

  // Notify agent joined
  sendAgentJoined(meetingId: string, agentId: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const event: CallEvent = {
        type: 'agent_joined',
        data: { meetingId, agentId }
      };

      this.socket.send(JSON.stringify(event));
    }
  }

  // Notify customer joined
  sendCustomerJoined(meetingId: string, customerId: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const event: CallEvent = {
        type: 'customer_joined',
        data: { meetingId, customerId }
      };

      this.socket.send(JSON.stringify(event));
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  // Close connection
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;