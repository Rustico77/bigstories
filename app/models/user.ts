import { UserRole } from "@prisma/client";

export interface UserModel {
  id?: string;
  email: string;
  role: UserRole;
  password: string; // hashé avec bcrypt
}

export interface UserResponse {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}