const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Middleware to verify JWT token
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        message: 'Authentication required. No token provided.',
      });
    }

    // Extract token (Bearer format)
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        message: 'Authentication required. Invalid token format.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Authentication failed. User not found.',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Authentication failed. Token expired.',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Authentication failed. Invalid token.',
      });
    }
    
    return res.status(500).json({
      message: 'Internal server error during authentication.',
      error: error.message,
    });
  }
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  
  return res.status(403).json({
    message: 'Access denied. Admin privileges required.',
  });
};

/**
 * Middleware to check if user is band manager or admin
 */
const requireBandManager = (req, res, next) => {
  if (req.user && (req.user.role === 'BAND_MANAGER' || req.user.role === 'ADMIN')) {
    return next();
  }
  
  return res.status(403).json({
    message: 'Access denied. Band manager privileges required.',
  });
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireBandManager,
};