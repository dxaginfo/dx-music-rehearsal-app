/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    // Handle database constraint violations
    if (err.code === 'P2002') {
      return res.status(409).json({
        message: 'Resource already exists.',
        details: `A record with this ${err.meta?.target?.join(', ')} already exists.`
      });
    }
    
    // Handle record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        message: 'Resource not found.',
        details: err.meta?.cause || 'The requested record does not exist.'
      });
    }
    
    // Other Prisma errors
    return res.status(400).json({
      message: 'Database operation failed.',
      error: err.message,
      code: err.code
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: err.errors
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Authentication failed.',
      error: err.message
    });
  }

  // Generic 404 error
  if (err.statusCode === 404) {
    return res.status(404).json({
      message: err.message || 'Resource not found.'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;