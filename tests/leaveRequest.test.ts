import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app";
import { cleanDatabase, disconnectDb } from "./helpers/testDb";
import {
  createTestCompany,
  createTestUser,
  createTestLeaveType,
  createTestLeaveBalance,
  createTestCompanySettings,
} from "./helpers/testFactory";

function tokenFor(user: { id: number; role: string; companyId: number }) {
  return jwt.sign(
    { userId: user.id, role: user.role, companyId: user.companyId },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" },
  );
}

describe("LeaveRequest poslovna logika", () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it("kreira LeaveRequest kad nema preklapanja", async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const leaveType = await createTestLeaveType(company.id);
    const token = tokenFor({
      id: user.id,
      role: user.role,
      companyId: company.id,
    });

    const res = await request(app)
      .post("/leave-requests")
      .set("Authorization", `Bearer ${token}`)
      .send({
        startDate: "2027-06-10",
        endDate: "2027-06-15",
        totalDays: 5,
        leaveTypeId: leaveType.id,
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("Pending");
  });

  it("odbija kreiranje kad se datumi preklapaju sa postojecim zahtevom", async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const leaveType = await createTestLeaveType(company.id);
    const token = tokenFor({
      id: user.id,
      role: user.role,
      companyId: company.id,
    });

    await request(app)
      .post("/leave-requests")
      .set("Authorization", `Bearer ${token}`)
      .send({
        startDate: "2027-06-10",
        endDate: "2027-06-15",
        totalDays: 5,
        leaveTypeId: leaveType.id,
      });

    const res = await request(app)
      .post("/leave-requests")
      .set("Authorization", `Bearer ${token}`)
      .send({
        startDate: "2027-06-12",
        endDate: "2027-06-18",
        totalDays: 6,
        leaveTypeId: leaveType.id,
      });

    expect(res.status).toBe(409);
  });

  it("Employee ne sme da odobri sopstveni zahtev (RBAC)", async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({
      companyId: company.id,
      role: "Employee",
    });
    const leaveType = await createTestLeaveType(company.id);
    const token = tokenFor({
      id: user.id,
      role: user.role,
      companyId: company.id,
    });

    const createRes = await request(app)
      .post("/leave-requests")
      .set("Authorization", `Bearer ${token}`)
      .send({
        startDate: "2027-07-01",
        endDate: "2027-07-05",
        totalDays: 4,
        leaveTypeId: leaveType.id,
      });

    const res = await request(app)
      .put(`/leave-requests/${createRes.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "Approval" });

    expect(res.status).toBe(403);
  });

  it("Manager odobrava zahtev i LeaveBalance.usedDays se povecava", async () => {
    const company = await createTestCompany();
    const { user: employee } = await createTestUser({
      companyId: company.id,
      role: "Employee",
    });
    const { user: manager } = await createTestUser({
      companyId: company.id,
      role: "Manager",
    });
    const leaveType = await createTestLeaveType(company.id, {
      countsTowardBalance: true,
    });
    await createTestLeaveBalance({
      userId: employee.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
      year: 2027,
    });
    const employeeToken = tokenFor({
      id: employee.id,
      role: employee.role,
      companyId: company.id,
    });
    const managerToken = tokenFor({
      id: manager.id,
      role: manager.role,
      companyId: company.id,
    });

    const createRes = await request(app)
      .post("/leave-requests")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        startDate: "2027-08-01",
        endDate: "2027-08-05",
        totalDays: 5,
        leaveTypeId: leaveType.id,
      });

    const res = await request(app)
      .put(`/leave-requests/${createRes.body.id}`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ status: "Approval" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Approval");

    const balanceRes = await request(app)
      .get("/leave-balances")
      .set("Authorization", `Bearer ${employeeToken}`);

    const balance = balanceRes.body.find(
      (b: any) => b.leaveTypeId === leaveType.id,
    );
    expect(balance.usedDays).toBe(5);
  });

  it("odbija zahtev koji krsi minDaysNoticeForLeave", async () => {
    const company = await createTestCompany();
    await createTestCompanySettings(company.id, 30);
    const { user } = await createTestUser({ companyId: company.id });
    const leaveType = await createTestLeaveType(company.id);
    const token = tokenFor({
      id: user.id,
      role: user.role,
      companyId: company.id,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const res = await request(app)
      .post("/leave-requests")
      .set("Authorization", `Bearer ${token}`)
      .send({
        startDate: tomorrow.toISOString(),
        endDate: tomorrow.toISOString(),
        totalDays: 1,
        leaveTypeId: leaveType.id,
      });

    expect(res.status).toBe(409);
  });
});
