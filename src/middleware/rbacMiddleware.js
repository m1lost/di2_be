module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const hasROle = userRoles.some((r) => allowedRoles.includes(r));
    if (!hasROle) {
      return res.status(403).json({ message: 'Forbidden Insufficient Role' });
    }
    next();
  };
};
