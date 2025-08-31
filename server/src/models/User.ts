import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  dob?: string;
  authProvider: "email" | "google";
  googleId?: string;
}

const schema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  dob: String,
  authProvider: { type: String, enum: ["email", "google"], required: true },
  googleId: String
}, { timestamps: true });

export default model<IUser>("User", schema);
