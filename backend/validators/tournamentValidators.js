import { body, query } from "express-validator";

export const createTournamentRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 100 }).withMessage('Title must be at most 100 characters'),
    body('description')
        .optional()
        .isLength({ max: 2000 }).withMessage('Description must be at most 2000 characters'),
    body('startDate')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('startDate must be a valid date')
        .custom(val => {
            if (new Date(val) <= new Date()) throw new Error('startDate must be in the future');
            return true;
        }),
    body('rules.buyIn')
        .optional()
        .isIn([0, 1, 10, 50]).withMessage('buyIn must be 0, 1, 10, or 50'),
    body('rules.maxParticipants')
        .optional()
        .isInt({ min: 2, max: 128 }).withMessage('maxParticipants must be between 2 and 128'),
    body('format.rounds')
        .optional()
        .isInt({ min: 1, max: 20 }).withMessage('rounds must be between 1 and 20')
];

export const updateTournamentRules = [
    body('title')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Title must be at most 100 characters'),
    body('startDate')
        .optional()
        .isISO8601().withMessage('startDate must be a valid date'),
    body('status')
        .optional()
        .isIn(['upcoming', 'ongoing', 'cancelled', 'finished']).withMessage('Invalid status value')
];

export const tournamentQueryRules = [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
    query('sortBy').optional().isIn(['startDate', 'title', 'createdAt']).withMessage('Invalid sort field'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
    query('search').optional().isLength({ max: 100 }).withMessage('search too long')
];
