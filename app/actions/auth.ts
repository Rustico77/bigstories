"use server";

import { login, logout, getSession } from "@/lib/auth";

export async function loginAction(email: string, password: string) {
  try {
    return await login(email, password);
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function logoutAction() {
  await logout();
  
}

export async function getSessionAction() {
  return await getSession();
}
