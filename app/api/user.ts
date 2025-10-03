import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/user";

export default class User {
  // Récupérer toutes les utilisateurs
  static async getAll() {
    try {
      const users = await prisma.user.findMany();
      return { message: "", data: users };
    } catch (error) {
      return { message: "Erreur lors de la récupération des personnes", data: [] };
    }
  }

  // get by Id
  static async getSingle(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      if(!user) return { message: "Utilisateur non trouvé", data: null };
      return { message: "", data: user };
    } catch (error) {
      return { message: "Erreur lors de la récupération de l'utilisateur", data: null };
    }
  }


  // Créer un utilisateur
  static async create(email: string, role: UserRole) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });  
      if(user) {
        return { message: "Utilisateur déjà existant", isSuccess: false };
      }
      const password = Math.floor(10000000 + Math.random() * 90000000).toString();
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.user.create({ data: {
         email, 
         password: passwordHash, 
         role 
        } });
      return { message: "Utilisateur Créé avec succès", isSuccess: true};
    } catch (error) {
      return { message: "Erreur lors de la création", isSuccess: false };
    }
  }

  // Créer un utilisateur
  static async update(id: string, data: UserModel) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if(!user) {
        return { message: "Cet Utilisateur n'existe plus.", isSuccess: false };
      }

      await prisma.user.update({
        where: { id },
        data: data
      });
      return { message: "Utilisateur mis à jour avec succès", isSuccess: true};
    } catch (error) {
      return { message: "Erreur lors de la mise à jour de l'utilisateur", isSuccess: false };
    }
  }

  // Créer un utilisateur
  static async resetPassword(id: string, password: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if(!user) {
        return { message: "Cet Utilisateur n'existe plus.", isSuccess: false };
      }
      const passwordHash = await bcrypt.hash(password, 10);

      const res = await this.update(id, { ...user, password: passwordHash });
      if(!res.isSuccess) return res;

      return { message: `Le mot de passe de ${user.email} a été réinitialisé avec succès.`, isSuccess: true};
    } catch (error) {
      return { message: "Erreur lors de la création", isSuccess: false };
    }
  }
}
