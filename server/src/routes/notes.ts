import { Router } from "express";
import { z } from "zod";
import Note from "../models/Note";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const notes = await Note.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json({ notes });
});

router.post("/", async (req, res) => {
  const schema = z.object({ text: z.string().min(1).max(1000) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Note must not be empty" });
  const note = await Note.create({ user: req.userId, text: parsed.data.text });
  res.status(201).json({ note });
});

router.delete("/:id", async (req, res) => {
  const deleted = await Note.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!deleted) return res.status(404).json({ message: "Note not found" });
  res.json({ ok: true });
});

export default router;
