import jwt from "jsonwebtoken";
import { IUser } from "../models/User";

type Payload = { uid: string };

export const signAccess = (u: IUser) =>
  jwt.sign({ uid: u.id } as Payload, process.env.JWT_ACCESS_SECRET!, { expiresIn: "15m" });

export const signRefresh = (u: IUser) =>
  jwt.sign({ uid: u.id } as Payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

export const verifyAccess = (t: string) =>
  jwt.verify(t, process.env.JWT_ACCESS_SECRET!) as Payload;

export const verifyRefresh = (t: string) =>
  jwt.verify(t, process.env.JWT_REFRESH_SECRET!) as Payload;
