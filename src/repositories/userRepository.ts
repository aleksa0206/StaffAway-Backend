import { prisma } from "../config/prismaClient";
import { User } from "@prisma/client";

export async function findAll(): Promise<User[]> {
  return await prisma.user.findMany();
}

export async function create(data: {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: "Employee" | "Manager" | "Hr";
  managerId: number | null;
  hireDate: Date;
}) {
  return await prisma.user.create({ data });
}
