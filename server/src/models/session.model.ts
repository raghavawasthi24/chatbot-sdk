import mongoose, { Document, Schema } from 'mongoose';
import { ISession } from '../types';

const SessionSchema: Schema = new Schema({
    sessionId: { type: String, required: true },
    messages: { type: Array, default: [] },
    context: { type: Object, default: {} },
    appointmentData: { type: Object, default: {} },
    isBooking: { type: Boolean, default: false }
});

const Session = mongoose.model<ISession>('Session', SessionSchema);

export { Session };
