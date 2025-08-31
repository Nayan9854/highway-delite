import { Schema, model, Document, Types } from "mongoose";

export interface INote extends Document {
  user: Types.ObjectId;
  text: string;
}

const schema = new Schema<INote>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  text: { type: String, required: true, trim: true }
}, { timestamps: true });

export default model<INote>("Note", schema);
