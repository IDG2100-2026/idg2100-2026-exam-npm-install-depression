import { body } from "express-validator";

export const registerRules = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username may only contain letters, numbers, and underscores'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one digit'),
    body('age')
        .notEmpty().withMessage('Age is required')
        .isInt({ min: 18 }).withMessage('You must be at least 18 years old')
];

export const loginRules = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

export const updateProfileRules = [
    body('email')
        .optional()
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail(),
    body('password')
        .optional()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one digit'),
    body('aboutMe')
        .optional()
        .isLength({ max: 500 }).withMessage('About me must be at most 500 characters'),
    body('age')
        .optional()
        .isInt({ min: 18 }).withMessage('You must be at least 18 years old')
];
