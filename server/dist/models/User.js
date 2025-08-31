"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    dob: String,
    authProvider: { type: String, enum: ["email", "google"], required: true },
    googleId: String
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("User", schema);
