function requireRole(role) {
    return (req, res, next) => {
      const { role: userRole } = req.body;
  
      if (userRole !== role) {
        return res.status(403).json({ message: Access denied. Only ${role}s allowed. });
      }
  
      next(); // ✅ This line must only run if the role is allowed
    };
  }
  
  module.exports = { requireRole };