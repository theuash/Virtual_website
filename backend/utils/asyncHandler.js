export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error('[asyncHandler Error]:', err.message);
    next(err);
  });
};
