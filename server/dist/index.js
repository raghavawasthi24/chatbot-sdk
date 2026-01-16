"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const generative_ai_1 = require("@google/generative-ai");
require("./db/db");
const session_model_1 = require("./models/session.model");
const helper_1 = require("./helper");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// --- AI Setup ---
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
const SYSTEM_PROMPT = `You are a helpful Veterinary Assistant. 
1. Only answer questions related to pet health, nutrition, and care. 
2. If the user asks something unrelated, politely decline.
3. If the user wants to book an appointment, trigger the booking flow.`;
app.post('/api/chat', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message, sessionId, context } = req.body;
    try {
        let session = yield session_model_1.Session.findOne({ sessionId });
        if (!session) {
            session = new session_model_1.Session({ sessionId, context, messages: [] });
        }
        // Simple Appointment Logic
        const bookingTriggers = ["book", "appointment", "schedule"];
        const isTriggered = bookingTriggers.some(t => message.toLowerCase().includes(t));
        if (isTriggered || session.isBooking) {
            return (0, helper_1.handleBooking)(session, message, res);
        }
        // Standard AI Q&A
        const chat = model.startChat({
            history: [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }]
        });
        const result = yield chat.sendMessage(message);
        const responseText = result.response.text();
        session.messages.push({ role: 'user', content: message }, { role: 'bot', content: responseText });
        yield session.save();
        return res.json({ reply: responseText });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "AI Error" });
    }
}));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
