const sockjs = require('sockjs');

class SocketHandler {
  constructor() {
    this.connections = new Map(); // connectionId -> connection object
    this.agents = new Map(); // agentId -> connectionId
    this.customers = new Map(); // customerId -> connectionId
    this.activeCalls = new Map(); // callId -> call data
  }

  setupSocket(server) {
    const sockjs_opts = {
      sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js',
      log: function(severity, message) {
        console.log(`[${severity}] ${message}`);
      },
      heartbeat_delay: 25000,
      disconnect_delay: 5000,
      websocket: true
    };

    const sockjs_server = sockjs.createServer(sockjs_opts);
    
    sockjs_server.on('connection', (conn) => {
      const connectionId = conn.id;
      console.log(`New connection: ${connectionId}`);
      
      this.connections.set(connectionId, {
        conn,
        type: null, // 'agent' or 'customer'
        userId: null,
        joinedAt: new Date()
      });

      conn.on('data', (message) => {
        try {
          const event = JSON.parse(message);
          this.handleMessage(connectionId, event);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      conn.on('close', () => {
        console.log(`Connection closed: ${connectionId}`);
        this.handleDisconnection(connectionId);
      });
    });

    sockjs_server.installHandlers(server, { prefix: '/socket' });
    console.log('Socket server setup complete');
  }

  handleMessage(connectionId, event) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    console.log(`Received event: ${event.type} from ${connectionId}`);

    switch (event.type) {
      case 'register':
        this.handleRegister(connectionId, event.data);
        break;
      case 'call_request':
        this.handleCallRequest(connectionId, event.data);
        break;
      case 'call_response':
        this.handleCallResponse(connectionId, event.data);
        break;
      case 'call_ended':
        this.handleCallEnded(connectionId, event.data);
        break;
      case 'agent_joined':
        this.handleAgentJoined(connectionId, event.data);
        break;
      case 'customer_joined':
        this.handleCustomerJoined(connectionId, event.data);
        break;
      case 'photo_ready':
      case 'photo_capture':
      case 'id_ready':
      case 'id_capture':
      case 'face_captured_chunk':
      case 'id_captured_chunk':
        this.handleCaptureMessage(connectionId, event);
        break;
      case 'question_started':
      case 'questions_list':
      case 'question':
      case 'submit_response':
      case 'change_language':
      case 'questionnaire_completed':
      case 'customer_agreed':
        this.handleQuestionnaireMessage(connectionId, event);
        break;
      default:
        console.log(`Unknown event type: ${event.type}`);
    }
  }

  handleRegister(connectionId, data) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.type = data.type; // 'agent' or 'customer'
    connection.userId = data.userId;

    if (data.type === 'agent') {
      this.agents.set(data.userId, connectionId);
    } else if (data.type === 'customer') {
      this.customers.set(data.userId, connectionId);
    }

    console.log(`Registered ${data.type}: ${data.userId}`);
  }

  handleCallRequest(connectionId, callRequest) {
    console.log(`Call request from ${connectionId}:`, callRequest);
    
    // Store the call request
    this.activeCalls.set(callRequest.id, {
      ...callRequest,
      status: 'pending',
      customerConnectionId: connectionId
    });

    // Broadcast to all connected agents
    this.broadcastToAgents({
      type: 'call_request',
      data: callRequest
    });
  }

  handleCallResponse(connectionId, callResponse) {
    console.log(`Call response from ${connectionId}:`, callResponse);
    
    const call = this.activeCalls.get(callResponse.id);
    if (!call) {
      console.error(`Call not found: ${callResponse.id}`);
      return;
    }

    // Update call status
    call.status = callResponse.accepted ? 'accepted' : 'declined';
    call.agentConnectionId = connectionId;
    call.agentId = callResponse.agentId;

    // Send response to customer
    const customerConnection = this.connections.get(call.customerConnectionId);
    if (customerConnection) {
      customerConnection.conn.write(JSON.stringify({
        type: 'call_response',
        data: callResponse
      }));
    }

    // If declined, remove from active calls
    if (!callResponse.accepted) {
      this.activeCalls.delete(callResponse.id);
    }
  }

  handleCallEnded(connectionId, data) {
    console.log(`Call ended from ${connectionId}:`, data);
    
    const call = this.activeCalls.get(data.callId);
    if (call) {
      // Notify both parties
      if (call.customerConnectionId && call.customerConnectionId !== connectionId) {
        const customerConnection = this.connections.get(call.customerConnectionId);
        if (customerConnection) {
          customerConnection.conn.write(JSON.stringify({
            type: 'call_ended',
            data: { callId: data.callId, meetingId: data.meetingId }
          }));
        }
      }

      if (call.agentConnectionId && call.agentConnectionId !== connectionId) {
        const agentConnection = this.connections.get(call.agentConnectionId);
        if (agentConnection) {
          agentConnection.conn.write(JSON.stringify({
            type: 'call_ended',
            data: { callId: data.callId, meetingId: data.meetingId }
          }));
        }
      }

      // Remove from active calls
      this.activeCalls.delete(data.callId);
    }
  }

  handleAgentJoined(connectionId, data) {
    console.log(`Agent joined: ${data.agentId} for meeting ${data.meetingId}`);
    
    // Find the call and notify customer
    for (const [callId, call] of this.activeCalls.entries()) {
      if (call.meetingId === data.meetingId && call.status === 'accepted') {
        const customerConnection = this.connections.get(call.customerConnectionId);
        if (customerConnection) {
          customerConnection.conn.write(JSON.stringify({
            type: 'agent_joined',
            data: { meetingId: data.meetingId, agentId: data.agentId }
          }));
        }
        break;
      }
    }
  }

  handleCustomerJoined(connectionId, data) {
    console.log(`Customer joined: ${data.customerId} for meeting ${data.meetingId}`);
    
    // Find the call and notify agent
    for (const [callId, call] of this.activeCalls.entries()) {
      if (call.meetingId === data.meetingId && call.status === 'accepted') {
        const agentConnection = this.connections.get(call.agentConnectionId);
        if (agentConnection) {
          agentConnection.conn.write(JSON.stringify({
            type: 'customer_joined',
            data: { meetingId: data.meetingId, customerId: data.customerId }
          }));
        }
        break;
      }
    }
  }

  handleCaptureMessage(connectionId, event) {
    console.log(`Capture message: ${event.type} from ${connectionId}`);
    
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Determine the target based on the message type and sender
    let targetConnectionId = null;
    
    // If this is a capture trigger (photo_ready, photo_capture, id_ready, id_capture), 
    // it comes from agent and should go to customer
    if (['photo_ready', 'photo_capture', 'id_ready', 'id_capture'].includes(event.type)) {
      // Find customer in the same call
      for (const [callId, call] of this.activeCalls.entries()) {
        if (call.agentConnectionId === connectionId) {
          targetConnectionId = call.customerConnectionId;
          break;
        }
      }
    }
    // If this is a capture chunk (face_captured_chunk, id_captured_chunk),
    // it comes from customer and should go to agent
    else if (['face_captured_chunk', 'id_captured_chunk'].includes(event.type)) {
      // Find agent in the same call
      for (const [callId, call] of this.activeCalls.entries()) {
        if (call.customerConnectionId === connectionId) {
          targetConnectionId = call.agentConnectionId;
          break;
        }
      }
    }

    // Forward the message to the target
    if (targetConnectionId) {
      const targetConnection = this.connections.get(targetConnectionId);
      if (targetConnection) {
        targetConnection.conn.write(JSON.stringify(event));
        console.log(`Forwarded ${event.type} to ${targetConnectionId}`);
      }
    } else {
      console.log(`No target found for ${event.type} from ${connectionId}`);
    }
  }

  handleQuestionnaireMessage(connectionId, event) {
    console.log(`Questionnaire message: ${event.type} from ${connectionId}`);
    
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    let targetConnectionId = null;
    let targetType = '';
    
    // Determine message direction based on event type
    if (event.type === 'customer_agreed') {
      // customer_agreed goes from customer to agent
      for (const [callId, call] of this.activeCalls.entries()) {
        if (call.customerConnectionId === connectionId) {
          targetConnectionId = call.agentConnectionId;
          targetType = 'agent';
          break;
        }
      }
    } else {
      // All other questionnaire messages go from agent to customer
      for (const [callId, call] of this.activeCalls.entries()) {
        if (call.agentConnectionId === connectionId) {
          targetConnectionId = call.customerConnectionId;
          targetType = 'customer';
          break;
        }
      }
    }

    // Forward the message to the target
    if (targetConnectionId) {
      const targetConnection = this.connections.get(targetConnectionId);
      if (targetConnection) {
        targetConnection.conn.write(JSON.stringify(event));
        console.log(`Forwarded questionnaire ${event.type} to ${targetType} ${targetConnectionId}`);
      }
    } else {
      console.log(`No ${targetType || 'target'} found for questionnaire ${event.type} from ${connectionId}`);
    }
  }

  handleDisconnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove from type-specific maps
    if (connection.type === 'agent' && connection.userId) {
      this.agents.delete(connection.userId);
    } else if (connection.type === 'customer' && connection.userId) {
      this.customers.delete(connection.userId);
    }

    // Handle active calls
    for (const [callId, call] of this.activeCalls.entries()) {
      if (call.customerConnectionId === connectionId || call.agentConnectionId === connectionId) {
        // Notify the other party
        const otherConnectionId = call.customerConnectionId === connectionId 
          ? call.agentConnectionId 
          : call.customerConnectionId;
        
        if (otherConnectionId) {
          const otherConnection = this.connections.get(otherConnectionId);
          if (otherConnection) {
            otherConnection.conn.write(JSON.stringify({
              type: 'call_ended',
              data: { callId, meetingId: call.meetingId, reason: 'disconnection' }
            }));
          }
        }
        
        // Remove call
        this.activeCalls.delete(callId);
      }
    }

    // Remove connection
    this.connections.delete(connectionId);
  }

  broadcastToAgents(message) {
    for (const [agentId, connectionId] of this.agents.entries()) {
      const connection = this.connections.get(connectionId);
      if (connection && connection.conn) {
        connection.conn.write(JSON.stringify(message));
      }
    }
  }

  broadcastToCustomers(message) {
    for (const [customerId, connectionId] of this.customers.entries()) {
      const connection = this.connections.get(connectionId);
      if (connection && connection.conn) {
        connection.conn.write(JSON.stringify(message));
      }
    }
  }

  // Get statistics
  getStats() {
    return {
      totalConnections: this.connections.size,
      agents: this.agents.size,
      customers: this.customers.size,
      activeCalls: this.activeCalls.size
    };
  }
}

module.exports = SocketHandler;