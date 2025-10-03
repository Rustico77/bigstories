"use server";

import { UserRole } from "@prisma/client";
import User from "../api/user";
import { TransactionModel } from "../models/transaction";
import { UserModel } from "../models/user";


export async function createUser(email: string, role: UserRole) {
  return await User.create(email, role);
}

export async function updateUser(id: string, data: UserModel) {
  return await User.update(id, data);
}

export async function resetUserPassword(id: string, password: string) {
  return await User.resetPassword(id, password);
}

export async function getAllUser() {
  return await User.getAll();
}

export async function getSingleUser(id: string) {
  return await User.getSingle(id);
}