const { v4: uuidv4 } = require('uuid');
const ChatSession = require('../models/ChatSession');
const logger = require('../utils/logger');

// Start a new chat session
const startSession = async (req, res, next) => {
  try {
    const { userId, userName } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        error: 'userId is required',
        message: 'Please provide a userId in the request body'
      });
    }

    const sessionId = uuidv4();
    
    // Create session
    const session = ChatSession.createSession(sessionId, userId);
    
    logger.info('New chat session created', {
      sessionId,
      userId,
      userName,
      agentId: session.agentId,
      agentName: session.agentName
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        agentId: session.agentId,
        agentName: session.agentName,
        status: session.status,
        createdAt: session.createdAt
      },
      message: `Connected to agent ${session.agentName}`
    });

  } catch (error) {
    logger.error('Failed to start chat session', {
      error: error.message,
      userId: req.body.userId
    });

    if (error.message === 'No agents available') {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'All agents are currently busy. Please try again later.'
      });
    }

    next(error);
  }
};

// Get messages for a session
const getMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        error: 'sessionId is required',
        message: 'Please provide a sessionId in the URL parameters'
      });
    }

    const session = ChatSession.getSession(sessionId);
    
    if (!session) {
      logger.warn('Attempt to access non-existent session', {
        sessionId,
        ip: req.ip
      });
      return res.status(404).json({
        error: 'Session not found',
        message: 'The requested chat session does not exist'
      });
    }

    const messages = ChatSession.getMessages(sessionId);
    
    logger.info('Messages retrieved', {
      sessionId,
      messageCount: messages.length
    });

    res.json({
      success: true,
      data: {
        sessionId,
        messages,
        session: {
          agentId: session.agentId,
          agentName: session.agentName,
          status: session.status,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity
        }
      }
    });

  } catch (error) {
    logger.error('Failed to retrieve messages', {
      error: error.message,
      sessionId: req.params.sessionId
    });
    next(error);
  }
};

// End a chat session
const endSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const session = ChatSession.endSession(sessionId);
    
    logger.info('Chat session ended', {
      sessionId,
      agentId: session.agentId,
      duration: session.endedAt - session.createdAt
    });

    res.json({
      success: true,
      data: {
        sessionId,
        status: session.status,
        endedAt: session.endedAt
      },
      message: 'Chat session ended successfully'
    });

  } catch (error) {
    logger.error('Failed to end chat session', {
      error: error.message,
      sessionId: req.params.sessionId
    });

    if (error.message === 'Session not found') {
      return res.status(404).json({
        error: 'Session not found',
        message: 'The requested chat session does not exist'
      });
    }

    next(error);
  }
};

// Get agent statistics (bonus feature)
const getAgentStats = async (req, res, next) => {
  try {
    const stats = ChatSession.getAgentStats();
    const sessions = ChatSession.getAllSessions();
    
    res.json({
      success: true,
      data: {
        agents: stats,
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.status === 'active').length
      }
    });

  } catch (error) {
    logger.error('Failed to get agent stats', {
      error: error.message
    });
    next(error);
  }
};

module.exports = {
  startSession,
  getMessages,
  endSession,
  getAgentStats
};