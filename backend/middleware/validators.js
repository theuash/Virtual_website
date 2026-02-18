const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

const validateSignup = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email')
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('dateOfBirth')
        .isISO8601().withMessage('Invalid date format'),
    body('freelancingFields')
        .isArray({ min: 1 }).withMessage('At least one skill is required'),
    handleValidationErrors
];

const validateLogin = [
    body('email')
        .isEmail().withMessage('Invalid email address'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

const validateProject = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required'),
    body('budget')
        .isNumeric().withMessage('Budget must be a number')
        .custom(value => value > 0).withMessage('Budget must be greater than 0'),
    body('deadline')
        .isISO8601().withMessage('Invalid date format'),
    handleValidationErrors
];

const validateTask = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required'),
    body('dueDate')
        .isISO8601().withMessage('Invalid date format'),
    handleValidationErrors
];

module.exports = {
    validateSignup,
    validateLogin,
    validateProject,
    validateTask,
    handleValidationErrors
};
