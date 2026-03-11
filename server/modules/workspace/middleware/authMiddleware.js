// Simple role check based on header for MVP (as requested to keep login intact)
// In production, decoding JWT would happen here.

exports.authRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'] || 'student'; // Default to student
    
    if (allowedRoles.includes(userRole)) {
      return next();
    }
    
    return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
  };
};
