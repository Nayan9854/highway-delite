"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_js_1 = require("./db.js");
const auth_1 = __importDefault(require("./routes/auth"));
const notes_1 = __importDefault(require("./routes/notes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get("/", (_req, res) => res.send("HD Notes API OK"));
app.use("/api/auth", auth_1.default);
app.use("/api/notes", notes_1.default);
const port = Number(process.env.PORT || 8080);
(0, db_js_1.connectDB)(process.env.MONGO_URI)
    .then(() => app.listen(port, () => console.log(`Server http://localhost:${port}`)))
    .catch((e) => { console.error(e); process.exit(1); });
