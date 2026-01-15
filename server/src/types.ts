import { Document } from "mongoose";

export interface IMessage {
    role: 'user' | 'bot';
    content: string;
}

export interface IAppointmentData {
    ownerName?: string;
    petName?: string;
    phone?: string;
}

export interface ISession extends Document {
    sessionId: string;
    messages: IMessage[];
    context: Record<string, any>;
    appointmentData: IAppointmentData;
    isBooking: boolean;
}
