import { body, query } from "express-validator";

export const createMatchRules = [
    body('category.bestOf')
        .optional()
        .isIn([3, 5, 7]).withMessage('bestOf must be 3, 5, or 7'),
    body('category.timeControl')
        .optional()
        .isIn([10, 30, 90]).withMessage('timeControl must be 10, 30, or 90 seconds'),
    body('category.playerCount')
        .optional()
        .isIn([2, 3, 5]).withMessage('playerCount must be 2, 3, or 5'),
    body('category.buyIn')
        .optional()
        .isIn([1, 10, 50]).withMessage('buyIn must be 1, 10, or 50'),
    body('category.straightsAllowed')
        .optional()
        .isBoolean().withMessage('straightsAllowed must be a boolean')
];

export const paginationRules = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100')
];
