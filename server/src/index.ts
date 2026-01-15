import * as express from 'express';
import { Request, Response } from "express";
import mongoose, { Document, Schema } from 'mongoose';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import "./db/db"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Interfaces ---

interface IMessage {
  role: 'user' | 'bot';
  content: string;
}

interface IAppointmentData {
  ownerName?: string;
  petName?: string;
  phone?: string;
}

interface ISession extends Document {
  sessionId: string;
  messages: IMessage[];
  context: Record<string, any>;
  appointmentData: IAppointmentData;
  isBooking: boolean;
}

// --- MongoDB Setup ---

const SessionSchema: Schema = new Schema({
  sessionId: { type: String, required: true },
  messages: { type: Array, default: [] },
  context: { type: Object, default: {} },
  appointmentData: { type: Object, default: {} },
  isBooking: { type: Boolean, default: false }
});

const Session = mongoose.model<ISession>('Session', SessionSchema);

// --- AI Setup ---

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const SYSTEM_PROMPT = `You are a helpful Veterinary Assistant. 
1. Only answer questions related to pet health, nutrition, and care. 
2. If the user asks something unrelated, politely decline.
3. If the user wants to book an appointment, trigger the booking flow.`;

// --- Routes ---

app.post('/api/chat', async (req: Request, res: Response): Promise<any> => {
  const { message, sessionId, context } = req.body;

  console.log("REQ Body -->", req.body)

  try {
    let session = await Session.findOne({ sessionId });

    console.log("SESSION-->", session);
    
    if (!session) {
      session = new Session({ sessionId, context, messages: [] });
      console.log("SESSION CREATED-->", session);
    }

    // Simple Appointment Logic
    const bookingTriggers = ["book", "appointment", "schedule"];
    const isTriggered = bookingTriggers.some(t => message.toLowerCase().includes(t));

    console.log("BOOKING TRIGGERED", isTriggered)

    if (isTriggered || session.isBooking) {
      return handleBooking(session, message, res);
    }

    // Standard AI Q&A
    const chat: ChatSession = model.startChat({
      history: [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }]
    });

    console.log("CHAT-->", chat)

    const result = await chat.sendMessage(message);

    console.log("CHAT MSG--->", result)
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

// --- Helper Functions ---

async function handleBooking(session: ISession, message: string, res: Response): Promise<void> {
  session.isBooking = true;
  const data = session.appointmentData;

  // Logic Correction: Ensuring data fills sequentially based on the message
  if (!data.ownerName) {
    data.ownerName = "PENDING"; // Mark that we are now waiting for name
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
  session.markModified('appointmentData'); // Necessary for Mongoose to track nested object changes
  await session.save();
  res.json({ reply: text });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
