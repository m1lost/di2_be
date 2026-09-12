module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (req.user?.tokenType !== 'ACCESS') {
      return res.status(403).json({
        message: 'Please select a role first'
      });
    }

    const activeRole = req.user?.role;

    if (!activeRole || !allowedRoles.includes(activeRole)) {
      return res.status(403).json({
        message: 'Forbidden Insufficient Role'
      });
    }

    next();
  };
};
