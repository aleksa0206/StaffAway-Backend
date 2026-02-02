import express from "express";
import { authRouter } from "./modules/auth/auth.routes";
import "dotenv/config";

const app = express();

app.use(express.json());

// routes
app.use("/api/auth", authRouter);

export default app;
