import express from "express";
import cors from "cors"; // ← DODAJ OVO
import { authRouter } from "./modules/auth/auth.routes";
import "dotenv/config";

const app = express();

// CORS konfiguracija - DODAJ PRE express.json()!
// app.use(cors({
//   origin: 'http://localhost:4200',  // Angular dev server
//   credentials: true
// }));

app.use(cors({
  origin: [
    'http://localhost:4200',           // Računar
    'http://10.11.126.169:4200',       // Telefon
    'http://127.0.0.1:4200'            // Local
  ],
  credentials: true
}));

app.use(express.json());

// routes
app.use("/api/auth", authRouter);

export default app;
