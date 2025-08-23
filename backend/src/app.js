// const express = require('express');
// const cors = require('cors');
// const logger = require('./utils/logger');

// // Import middlewares
// const loggingMiddleware = require('./middleware/logging');
// const { errorHandler, notFoundHandler } = require('./middleware/error');

// // Import routes
// const chatRoutes = require('./routes/chat');

// const app = express();

// // Middlewares
// app.use(cors({
//   origin: process.env.FRONTEND_URL || "http://localhost:3000",
//   credentials: true
// }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Custom middlewares
// app.use(loggingMiddleware);

// // Health check endpoint (no auth required)
// app.get('/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     environment: process.env.NODE_ENV
//   });
// });

// // API Routes
// app.use('/api/chat', chatRoutes); // Fixed: Added /chat prefix

// // 404 handler for unknown routes
// app.use('*', notFoundHandler);

// // Global error handling middleware (should be last)
// app.use(errorHandler);

// module.exports = app;

// const express = require('express');
// const cors = require('cors');

// console.log('🔍 Initializing Express app...');
// const app = express();

// try {
//   console.log('📋 Loading logger...');
//   const logger = require('./utils/logger');
//   console.log('✅ Logger loaded');

//   console.log('📋 Loading middlewares...');
//   const loggingMiddleware = require('./middleware/logging');
//   console.log('✅ Logging middleware loaded');

//   // Middlewares
//   console.log('🌐 Setting up CORS...');
//   app.use(cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     credentials: true
//   }));

//   console.log('📝 Setting up body parsers...');
//   app.use(express.json({ limit: '10mb' }));
//   app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//   // Custom middlewares
//   console.log('📋 Applying logging middleware...');
//   app.use(loggingMiddleware);

//   // Health check endpoint (no auth required)
//   console.log('🏥 Setting up health check endpoint...');
//   app.get('/health', (req, res) => {
//     res.json({ 
//       status: 'OK', 
//       timestamp: new Date().toISOString(),
//       uptime: process.uptime(),
//       environment: process.env.NODE_ENV || 'development'
//     });
//   });

//   console.log('📋 Loading error middleware...');
//   const { errorHandler, notFoundHandler } = require('./middleware/error');
//   console.log('✅ Error middleware loaded');

//   console.log('🛣️  Loading chat routes...');
//   const chatRoutes = require('./routes/chat');
//   console.log('✅ Chat routes loaded');

//   // API Routes
//   console.log('🔗 Mounting chat routes...');
//   app.use('/api/chat', chatRoutes);
//   console.log('✅ Chat routes mounted');

//   // 404 handler for unknown routes
//   console.log('❓ Setting up 404 handler...');
//   app.use('*', notFoundHandler);

//   // Global error handling middleware (should be last)
//   console.log('🚨 Setting up global error handler...');
//   app.use(errorHandler);

//   console.log('✅ App initialization completed successfully');

// } catch (error) {
//   console.error('❌ Error during app initialization:', error.message);
//   console.error('📍 Error stack:', error.stack);
//   throw error;
// }

// module.exports = app;

const express = require('express');
const cors = require('cors');

console.log('🔍 Initializing Express app...');
const app = express();

try {
  console.log('📋 Loading logger...');
  const logger = require('./utils/logger');
  console.log('✅ Logger loaded');

  console.log('📋 Loading middlewares...');
  const loggingMiddleware = require('./middleware/logging');
  console.log('✅ Logging middleware loaded');

  // Middlewares
  console.log('🌐 Setting up CORS...');
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  }));

  console.log('📝 Setting up body parsers...');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Custom middlewares
  console.log('📋 Applying logging middleware...');
  app.use(loggingMiddleware);

  // Health check endpoint (no auth required)
  console.log('🏥 Setting up health check endpoint...');
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  console.log('📋 Loading error middleware...');
  const { errorHandler, handle404 } = require('./middleware/error');
  console.log('✅ Error middleware loaded');

  console.log('🛣️  Loading chat routes...');
  const chatRoutes = require('./routes/chat');
  console.log('✅ Chat routes loaded');

  // API Routes
  console.log('🔗 Mounting chat routes...');
  app.use('/api/chat', chatRoutes);
  console.log('✅ Chat routes mounted');

  // 404 handler for unknown routes - using a simple approach
  console.log('❓ Setting up 404 handler...');
  app.use((req, res, next) => {
    handle404(req, res);
  });
  console.log('✅ 404 handler set up');

  // Global error handling middleware (should be last)
  console.log('🚨 Setting up global error handler...');
  app.use(errorHandler);
  console.log('✅ Global error handler set up');

  console.log('✅ App initialization completed successfully');

} catch (error) {
  console.error('❌ Error during app initialization:', error.message);
  console.error('📍 Error stack:', error.stack);
  throw error;
}

module.exports = app;