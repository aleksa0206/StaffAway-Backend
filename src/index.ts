import express from "express";

const app = express();
const port = 3000;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server radi na portu ${port}`);
});