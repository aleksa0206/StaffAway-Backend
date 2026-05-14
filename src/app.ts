import express from "express";
import cors from "cors"; // ← DODAJ OVO
import { authRouter } from "./modules/auth/auth.routes";
import { leavesRouter } from "./modules/leaves/leaves.routes"; 
import "dotenv/config";

const app = express();

// CORS konfiguracija - DODAJ PRE express.json()!
// app.use(cors({
//   origin: 'http://localhost:4200',  // Angular dev server
//   credentials: true
// }));

app.use(cors({
  origin: [
    // 'http://localhost:4200',           // Računar
    // 'http://10.11.126.169:4200',       // Telefon
    // 'http://127.0.0.1:4200'            // Local
    'http://localhost:4200',
    'http://127.0.0.1:4200'
  ],
  credentials: true
}));

app.use(express.json());

// routes
app.use("/api/auth", authRouter);
app.use("/api/leaves", leavesRouter); // ← DODAJ

export default app;
