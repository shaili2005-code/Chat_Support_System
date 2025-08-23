// In-memory storage for chat sessions (replace with database in production)
class ChatSession {
  constructor() {
    this.sessions = new Map();
    this.agents = new Map();
    this.messages = new Map();
    
    // Initialize some demo agents
    this.initializeAgents();
  }

  initializeAgents() {
    const demoAgents = [
      { id: 'agent-1', name: 'Alice Smith', status: 'available', activeSessions: 0 },
      { id: 'agent-2', name: 'Bob Johnson', status: 'available', activeSessions: 0 },
      { id: 'agent-3', name: 'Carol Williams', status: 'available', activeSessions: 0 }
    ];

    demoAgents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  // Create a new chat session
  createSession(sessionId, userId) {
    const assignedAgent = this.assignAgent();
    
    if (!assignedAgent) {
      throw new Error('No agents available');
    }

    const session = {
      sessionId,
      userId,
      agentId: assignedAgent.id,
      agentName: assignedAgent.name,
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.sessions.set(sessionId, session);
    this.messages.set(sessionId, []);
    
    // Update agent's active sessions
    assignedAgent.activeSessions++;
    if (assignedAgent.activeSessions >= 2) {
      assignedAgent.status = 'busy';
    }

    return session;
  }

  // Assign an available agent
  assignAgent() {
    for (const [agentId, agent] of this.agents) {
      if (agent.status === 'available' && agent.activeSessions < 2) {
        return agent;
      }
    }
    return null;
  }

  // Get session details
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  // Add message to session
  addMessage(sessionId, message) {
    const messages = this.messages.get(sessionId) || [];
    const messageWithTimestamp = {
      ...message,
      timestamp: new Date(),
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    messages.push(messageWithTimestamp);
    this.messages.set(sessionId, messages);

    // Update session activity
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }

    return messageWithTimestamp;
  }

  // Get messages for a session
  getMessages(sessionId) {
    return this.messages.get(sessionId) || [];
  }

  // End session
  endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Update agent availability
    const agent = this.agents.get(session.agentId);
    if (agent) {
      agent.activeSessions--;
      if (agent.activeSessions < 2) {
        agent.status = 'available';
      }
    }

    // Update session status
    session.status = 'ended';
    session.endedAt = new Date();

    return session;
  }

  // Get all sessions (for debugging)
  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  // Get agent stats
  getAgentStats() {
    return Array.from(this.agents.values());
  }
}

// Export singleton instance
const chatSessionManager = new ChatSession();
module.exports = chatSessionManager;