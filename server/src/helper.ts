import { Response } from "express";
import { ISession } from "./types";

export async function handleBooking(session: ISession, message: string, res: Response): Promise<void> {
    const data = session.appointmentData;
    
    console.log(data)
    
    if(data.phone && data.phone !== "PENDING"){
        return ask(session, "Already appointment booked", res);
    }
    session.isBooking = true;

    if (!data.ownerName) {
        data.ownerName = "PENDING";
        await session.save();
        return ask(session, "Sure! I can help with that. What is your name?", res);
    }
    
    if (data.ownerName === "PENDING") {
        data.ownerName = message;
        data.petName = "PENDING";
        await session.save();
        return ask(session, `Got it, ${message}. What is your pet's name?`, res);
    }
    
    if (data.petName === "PENDING") {
        data.petName = message;
        data.phone = "PENDING";
        await session.save();
        return ask(session, "And what is your phone number?", res);
    }
    
    if (data.phone === "PENDING") {
        data.phone = message;
        session.isBooking = false;
        await session.save();

        return ask(session, `Thank you! Appointment confirmed for ${data.petName}. We will call you at ${data.phone}`, res);
    }
}


async function ask(session: ISession, text: string, res: Response): Promise<void> {
    session.markModified('appointmentData');
    await session.save();
    res.json({ reply: text });
}
