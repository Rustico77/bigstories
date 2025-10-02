export interface UserModel {
  email: string;
  password: string; // hashé avec bcrypt
}

export interface UserResponse {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}