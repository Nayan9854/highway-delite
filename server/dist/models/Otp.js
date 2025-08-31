"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    email: { type: String, required: true, lowercase: true, index: true },
    otpHash: { type: String, required: true },
    purpose: { type: String, enum: ["signup", "login"], required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Otp", schema);
