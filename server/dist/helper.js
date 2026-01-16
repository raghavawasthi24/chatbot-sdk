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
exports.handleBooking = handleBooking;
function handleBooking(session, message, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
            yield session.save();
            res.json({ reply: `Thank you! Appointment confirmed for ${data.petName}. We will call you at ${data.phone}.` });
            return;
        }
    });
}
function ask(session, text, res) {
    return __awaiter(this, void 0, void 0, function* () {
        session.markModified('appointmentData');
        yield session.save();
        res.json({ reply: text });
    });
}
