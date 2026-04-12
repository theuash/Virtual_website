import { ApiError } from '../utils/ApiError.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized for this role');
    }
    next();
  };
};
