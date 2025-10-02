// lib/auth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "session";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Utilisateur introuvable");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Mot de passe incorrect");

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  (await cookies()).set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60, // 1h
    path: "/",
  });

  return { message: `Bienvenue ${email} !` };
}

export async function logout() {
  (await cookies()).set({
    name: COOKIE_NAME,
    value: "",
    maxAge: 0,
  });
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };
    return payload;
  } catch {
    return null;
  }
}
