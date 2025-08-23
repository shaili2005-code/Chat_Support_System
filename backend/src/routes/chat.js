// const express = require('express');
// const router = express.Router();
// const { apiKeyAuth } = require('../middleware/auth');
// const {
//   startSession,
//   getMessages,
//   endSession,
//   getAgentStats
// } = require('../controllers/chatController'); // Fixed: Added 'src/' and 's' at end

// // Apply authentication middleware to all routes
// router.use(apiKeyAuth);

// // Chat session routes
// router.post('/start-session', startSession);
// router.get('/messages/:sessionId', getMessages); // Make sure sessionId is properly defined
// router.post('/end-session/:sessionId', endSession); // Make sure sessionId is properly defined

// // Bonus routes
// router.get('/agent-stats', getAgentStats);

// module.exports = router;

const express = require('express');
const router = express.Router();

console.log('🛣️  Initializing chat routes...');

try {
  console.log('🔐 Loading auth middleware...');
  const { apiKeyAuth } = require('../middleware/auth');
  console.log('✅ Auth middleware loaded');

  console.log('🎮 Loading chat controllers...');
  const {
    startSession,
    getMessages,
    endSession,
    getAgentStats
  } = require('../controllers/chatController');
  console.log('✅ Chat controllers loaded');

  // Apply authentication middleware to all routes
  console.log('🔒 Applying auth middleware to all routes...');
  router.use(apiKeyAuth);

  // Test route first
  console.log('🧪 Setting up test route...');
  router.get('/test', (req, res) => {
    res.json({ message: 'Chat routes are working!' });
  });

  // Chat session routes
  console.log('📝 Setting up session routes...');
  router.post('/start-session', startSession);
  
  console.log('📨 Setting up message routes...');
  router.get('/messages/:sessionId', getMessages);
  
  console.log('🔚 Setting up end session routes...');
  router.post('/end-session/:sessionId', endSession);

  // Bonus routes
  console.log('📊 Setting up stats routes...');
  router.get('/agent-stats', getAgentStats);

  console.log('✅ All chat routes configured successfully');

} catch (error) {
  console.error('❌ Error configuring chat routes:', error.message);
  console.error('📍 Error stack:', error.stack);
  throw error;
}

module.exports = router;