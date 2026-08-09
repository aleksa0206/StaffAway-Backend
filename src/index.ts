import "dotenv/config";
import express from "express";
import healthRoutes from "./routes/healthRoutes";
import userRoutes from "./routes/userRoutes";
import departmentRoutes from "./routes/departmentRoutes";
import leaveTypeRoutes from "./routes/leaveTypeRoutes";
import holidayRoutes from "./routes/holidayRoutes";
import companyRoutes from "./routes/companyRoutes";
import commentRoutes from "./routes/commentRoutes";
import workScheduleRoutes from "./routes/workScheduleRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import auditLogRoutes from "./routes/auditLogRoutes";
import refreshTokenRoutes from "./routes/refreshTokenRoutes";
import attachmentRoutes from "./routes/attachementRoutes";
import statusHistoryRoutes from "./routes/statusHistoryRoutes";
import leaveRequestRoutes from "./routes/leaveRequestRoutes";
import leaveBalanceRoutes from "./routes/leaveBalanceRoutes";
import apiKeyRoutes from "./routes/apiKeyRoutes";
import companySettingsRoutes from "./routes/companySettingsRoutes";

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(healthRoutes);
app.use(userRoutes);
app.use(departmentRoutes);
app.use(leaveTypeRoutes);
app.use(holidayRoutes);
app.use(companyRoutes);
app.use(commentRoutes);
app.use(workScheduleRoutes);
app.use(notificationRoutes);
app.use(auditLogRoutes);
app.use(refreshTokenRoutes);
app.use(attachmentRoutes);
app.use(statusHistoryRoutes);
app.use(leaveRequestRoutes);
app.use(leaveBalanceRoutes);
app.use(companySettingsRoutes);
app.use(apiKeyRoutes);

app.listen(port, () => {
  console.log(`server radi na portu ${port}`);
});
