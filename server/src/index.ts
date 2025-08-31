import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db";
import authRoutes from "./routes/auth";
import noteRoutes from "./routes/notes";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "https://highway-delite-pmiw.vercel.app",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => res.send("HD Notes API OK"));
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

const port = Number(process.env.PORT || 8080);

connectDB(process.env.MONGO_URI!)
  .then(() => app.listen(port, () => console.log(`Server http://localhost:${port}`)))
  .catch((e) => { console.error(e); process.exit(1); });
