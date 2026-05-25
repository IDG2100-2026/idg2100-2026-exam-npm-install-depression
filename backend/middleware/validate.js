import { validationResult } from "express-validator";

// Run after any express-validator rule array, returns 422 with field errors if invalid
export function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
}
