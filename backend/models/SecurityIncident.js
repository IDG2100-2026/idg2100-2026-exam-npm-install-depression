import mongoose from "mongoose";

const securityIncidentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['rate_limit_exceeded', 'ip_mismatch'],
        required: true
    },
    ip: { type: String, required: true },
    userAgent: { type: String, default: '' },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    details: { type: String, default: '' }
}, { timestamps: true });

export const SecurityIncident = mongoose.model('SecurityIncident', securityIncidentSchema);
