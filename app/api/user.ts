import { prisma } from "@/lib/prisma";

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
  static async create(email: string) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });  
      if(user) {
        return { message: "Utilisateur déjà existant", isSuccess: false };
      }
      const password = Math.random().toString(36).slice(-8); // Génère un mot de passe aléatoire
      await prisma.user.create({ data: { email, password } });
      return { message: "Utilisateur Créé avec succès", isSuccess: true};
    } catch (error) {
      return { message: "Erreur lors de la création", isSuccess: false };
    }
  }
}
