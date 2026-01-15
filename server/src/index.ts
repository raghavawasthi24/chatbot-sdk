import * as express from 'express';
import { Request, Response } from "express";

import * as cors from 'cors';
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import "./db/db";
import { Session } from './models/session.model';
import { handleBooking } from './helper';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- AI Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

const SYSTEM_PROMPT = `You are a helpful Veterinary Assistant. 
1. Only answer questions related to pet health, nutrition, and care. 
2. If the user asks something unrelated, politely decline.
3. If the user wants to book an appointment, trigger the booking flow.`;

app.post('/api/chat', async (req: Request, res: Response): Promise<any> => {
  const { message, sessionId, context } = req.body;

  try {
    let session = await Session.findOne({ sessionId });

    if (!session) {
      session = new Session({ sessionId, context, messages: [] });
    }

    // Simple Appointment Logic
    const bookingTriggers = ["book", "appointment", "schedule"];
    const isTriggered = bookingTriggers.some(t => message.toLowerCase().includes(t));

    if (isTriggered || session.isBooking) {
      return handleBooking(session, message, res);
    }

    // Standard AI Q&A
    const chat: ChatSession = model.startChat({
      history: [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }]
    });

    const result = await chat.sendMessage(message);

    const responseText = result.response.text();

    session.messages.push(
      { role: 'user', content: message },
      { role: 'bot', content: responseText }
    );

    await session.save();
    return res.json({ reply: responseText });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "AI Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
