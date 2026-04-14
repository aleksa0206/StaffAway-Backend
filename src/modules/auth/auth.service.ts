import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { usersRepository } from "../users/users.repository";
import type { LoginResponseDTO, MeResponseDTO } from "./auth.types";

export class AuthService {
  async register(
    email: string,
    name: string | undefined,
    password: string
  ): Promise<MeResponseDTO> {
    const existing = await usersRepository.findByEmail(email);
    
    if (existing) {
      const err = new Error("EMAIL_ALREADY_EXISTS");
      (err as any).status = 409;
      throw err;
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await usersRepository.create({
      email,
      name: name ?? null,
      password_hash,
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  async login(email: string, password: string): Promise<LoginResponseDTO> {
    const user = await usersRepository.findByEmail(email);
    
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

    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error("JWT_SECRET_MISSING");
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, secret, {
      expiresIn: "7d",
    });

    return { token };
  }

  async me(userId: number): Promise<MeResponseDTO> {
    const user = await usersRepository.findById(userId);
    
    if (!user) {
      const err = new Error("UNAUTHORIZED");
      (err as any).status = 401;
      throw err;
    }
    
    return { id: user.id, email: user.email, name: user.name };
  }
}

export const authService = new AuthService();