import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

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
}
