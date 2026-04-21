import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT) || 3000;

// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Network access: http://10.11.126.169:${PORT}`);
});
