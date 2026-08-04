import "dotenv/config";
import express from "express";
import healthRoutes from "./routes/healthRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(healthRoutes);
app.use(userRoutes);

app.listen(port, () => {
  console.log(`server radi na portu ${port}`);
});
