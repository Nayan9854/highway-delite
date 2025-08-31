import { Schema, model, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otpHash: string;
  purpose: "signup" | "login";
  expiresAt: Date;
}

const schema = new Schema<IOtp>({
  email: { type: String, required: true, lowercase: true, index: true },
  otpHash: { type: String, required: true },
  purpose: { type: String, enum: ["signup", "login"], required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true });

export default model<IOtp>("Otp", schema);
