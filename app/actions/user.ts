"use server";

import { UserRole } from "@prisma/client";
import User from "../api/user";
import { TransactionModel } from "../models/transaction";


export async function createUser(email: string, role: UserRole) {
  return await User.create(email, role);
}

export async function getAllUser() {
  return await User.getAll();
}

export async function getSingleUser(id: string) {
  return await User.getSingle(id);
}