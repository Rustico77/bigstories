"use server";

import User from "../api/user";


export async function createUser(email: string) {
  return await User.create(email);
}

export async function getAllUser() {
  return await User.getAll();
}

export async function getSingleUser(id: string) {
  return await User.getSingle(id);
}