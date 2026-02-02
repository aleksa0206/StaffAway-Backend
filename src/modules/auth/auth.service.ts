import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type { UsersRepository } from "../users/users.repository";
import type { LoginResponseDTO, MeResponseDTO } from "./auth.types";

export class AuthService {
  constructor(private readonly usersRepo: UsersRepository) {}

  async register(
    email: string,
    name: string | undefined,
    password: string,
  ): Promise<MeResponseDTO> {
    const existing = await this.usersRepo.findByEmail(email);
    if (existing) {
      const err = new Error("EMAIL_ALREADY_EXISTS");
      (err as any).status = 409;
      throw err;
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await this.usersRepo.create({
      email,
      name: name ?? null,
      password_hash,
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  async login(email: string, password: string): Promise<LoginResponseDTO> {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      const err = new Error("INVALID_CREDENTIALS");
      (err as any).status = 401;
      throw err;
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      const err = new Error("INVALID_CREDENTIALS");
      (err as any).status = 401;
      throw err;
    }

    const secret = process.env.JWT_SECRET as Secret;
    if (!secret) throw new Error("JWT_SECRET_MISSING");

    const expiresIn = (process.env.JWT_EXPIRES_IN ||
      "1d") as SignOptions["expiresIn"];

    const token = jwt.sign({ sub: user.id, email: user.email }, secret, {
      expiresIn,
    });

    return { token };
  }

  async me(userId: number): Promise<MeResponseDTO> {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      const err = new Error("UNAUTHORIZED");
      (err as any).status = 401;
      throw err;
    }
    return { id: user.id, email: user.email, name: user.name };
  }
}
