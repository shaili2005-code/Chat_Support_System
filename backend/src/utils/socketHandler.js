const ChatSession = require('../models/ChatSession');
const logger = require('./logger');

// Store connected users and their socket IDs
const connectedUsers = new Map();
const connectedAgents = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    logger.info('Socket connection established', {
      socketId: socket.id,
      ip: socket.handshake.address
    });

    // Handle user joining a session
    socket.on('join_session', async (data) => {
      try {
        const { sessionId, userId, userType } = data; // userType: 'user' or 'agent'
        
        if (!sessionId) {
          socket.emit('error', { message: 'Session ID is required' });
          return;
        }

        const session = ChatSession.getSession(sessionId);
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Join the session room
        await socket.join(sessionId);
        
        // Store user connection info
        if (userType === 'agent') {
          connectedAgents.set(socket.id, { sessionId, agentId: userId });
        } else {
          connectedUsers.set(socket.id, { sessionId, userId });
        }

        logger.info('User joined session', {
          socketId: socket.id,
          sessionId,
          userId,
          userType: userType || 'user'
        });

        // Notify others in the session
        socket.to(sessionId).emit('user_joined', {
          userId,
          userType: userType || 'user',
          timestamp: new Date()
        });

        // Send session info to the user
        socket.emit('session_joined', {
          sessionId,
          agentName: session.agentName,
          status: session.status
        });

      } catch (error) {
        logger.error('Error joining session', {
          error: error.message,
          socketId: socket.id,
          data
        });
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { sessionId, message, senderId, senderName, senderType } = data;
        
        if (!sessionId || !message || !senderId) {
          socket.emit('error', { message: 'Session ID, message, and sender ID are required' });
          return;
        }

        const session = ChatSession.getSession(sessionId);
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Validate that user belongs to this session
        const isAuthorized = 
          senderId === session.userId || 
          senderId === session.agentId ||
          senderType === 'agent';

        if (!isAuthorized) {
          socket.emit('error', { message: 'Unauthorized to send message to this session' });
          return;
        }

        // Store message
        const savedMessage = ChatSession.addMessage(sessionId, {
          senderId,
          senderName: senderName || (senderType === 'agent' ? session.agentName : 'User'),
          senderType: senderType || 'user',
          message: message.trim(),
          sessionId
        });

        logger.info('Message sent', {
          sessionId,
          senderId,
          messageLength: message.length,
          messageId: savedMessage.id
        });

        // Broadcast message to all users in the session
        io.to(sessionId).emit('new_message', savedMessage);

      } catch (error) {
        logger.error('Error sending message', {
          error: error.message,
          socketId: socket.id,
          data
        });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { sessionId, userId, userName } = data;
      if (sessionId) {
        socket.to(sessionId).emit('user_typing', {
          userId,
          userName,
          isTyping: true
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { sessionId, userId, userName } = data;
      if (sessionId) {
        socket.to(sessionId).emit('user_typing', {
          userId,
          userName,
          isTyping: false
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info('Socket disconnected', {
        socketId: socket.id
      });

      // Clean up user connections
      const userConnection = connectedUsers.get(socket.id);
      const agentConnection = connectedAgents.get(socket.id);
      
      if (userConnection) {
        const { sessionId, userId } = userConnection;
        socket.to(sessionId).emit('user_left', {
          userId,
          userType: 'user',
          timestamp: new Date()
        });
        connectedUsers.delete(socket.id);
        
        logger.info('User disconnected from session', {
          socketId: socket.id,
          sessionId,
          userId
        });
      }

      if (agentConnection) {
        const { sessionId, agentId } = agentConnection;
        socket.to(sessionId).emit('user_left', {
          userId: agentId,
          userType: 'agent',
          timestamp: new Date()
        });
        connectedAgents.delete(socket.id);
        
        logger.info('Agent disconnected from session', {
          socketId: socket.id,
          sessionId,
          agentId
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error', {
        error: error.message,
        socketId: socket.id
      });
    });
  });

  // Log socket server status
  logger.info('Socket.IO server initialized');
};

module.exports = socketHandler;