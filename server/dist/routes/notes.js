"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Note_1 = __importDefault(require("../models/Note"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get("/", async (req, res) => {
    const notes = await Note_1.default.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ notes });
});
router.post("/", async (req, res) => {
    const schema = zod_1.z.object({ text: zod_1.z.string().min(1).max(1000) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Note must not be empty" });
    const note = await Note_1.default.create({ user: req.userId, text: parsed.data.text });
    res.status(201).json({ note });
});
router.delete("/:id", async (req, res) => {
    const deleted = await Note_1.default.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted)
        return res.status(404).json({ message: "Note not found" });
    res.json({ ok: true });
});
exports.default = router;
