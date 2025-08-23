const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Simple API Key authentication (for demo purposes)
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    logger.warn('Authentication failed: No API key provided', {
      ip: req.ip,
      url: req.url
    });
    return res.status(401).json({ 
      error: 'API key required',
      message: 'Please provide x-api-key header or apiKey query parameter'
    });
  }

  if (apiKey !== process.env.API_KEY) {
    logger.warn('Authentication failed: Invalid API key', {
      ip: req.ip,
      url: req.url,
      providedKey: apiKey
    });
    return res.status(401).json({ 
      error: 'Invalid API key' 
    });
  }

  logger.debug('API key authentication successful', {
    ip: req.ip,
    url: req.url
  });

  next();
};

// JWT Authentication (for future use)
const jwtAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer token

  if (!token) {
    logger.warn('JWT Authentication failed: No token provided', {
      ip: req.ip,
      url: req.url
    });
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Please provide Bearer token in Authorization header'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    logger.debug('JWT authentication successful', {
      userId: decoded.userId,
      ip: req.ip,
      url: req.url
    });
    
    next();
  } catch (error) {
    logger.warn('JWT Authentication failed: Invalid token', {
      ip: req.ip,
      url: req.url,
      error: error.message
    });
    return res.status(401).json({ 
      error: 'Invalid token' 
    });
  }
};

// Generate JWT token (helper function)
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
  apiKeyAuth,
  jwtAuth,
  generateToken
};