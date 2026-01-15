import { Response } from "express";
import { ISession } from "./types";

export async function handleBooking(session: ISession, message: string, res: Response): Promise<void> {
    session.isBooking = true;
    const data = session.appointmentData;

    if (!data.ownerName) {
        data.ownerName = "PENDING";
        return ask(session, "Sure! I can help with that. What is your name?", res);
    }

    if (data.ownerName === "PENDING") {
        data.ownerName = message;
        return ask(session, `Got it, ${message}. What is your pet's name?`, res);
    }

    if (!data.petName) {
        data.petName = message;
        return ask(session, "And what is your phone number?", res);
    }

    if (!data.phone) {
        data.phone = message;
        session.isBooking = false;
        await session.save();
        res.json({ reply: `Thank you! Appointment confirmed for ${data.petName}. We will call you at ${data.phone}.` });
        return;
    }
}


async function ask(session: ISession, text: string, res: Response): Promise<void> {
    session.markModified('appointmentData');
    await session.save();
    res.json({ reply: text });
}
