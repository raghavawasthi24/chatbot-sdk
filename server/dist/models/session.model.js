"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const mongoose_1 = require("mongoose");
const SessionSchema = new mongoose_1.Schema({
    sessionId: { type: String, required: true },
    messages: { type: Array, default: [] },
    context: { type: Object, default: {} },
    appointmentData: { type: Object, default: {} },
    isBooking: { type: Boolean, default: false }
});
const Session = mongoose_1.default.model('Session', SessionSchema);
exports.Session = Session;
