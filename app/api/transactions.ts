import { PrismaClient } from "@prisma/client";
import { TransactionModel } from "../models/transaction";

const prisma = new PrismaClient();

export default class Transaction {
	// Créer une transaction
	static async create(data: TransactionModel) {
		try{
			const res = await prisma.transaction.create({ data });
			return {isSuccess: true, message: "Transaction créée avec succès", data: res}
		}catch(error){
			return {isSuccess: false, message: "Erreur lors de la création de la transaction"}
		}
	}

	// Récupérer toutes les transactions
	static async getAll() {
		return await prisma.transaction.findMany({
			orderBy: { createdAt: "desc" },
		});
	}

	// Récupérer une transaction par ID
	static async getById(id: string) {
		return await prisma.transaction.findUnique({ where: { id } });
	}

	// Mettre à jour une transaction
	static async update(id: string, data: TransactionModel) {
		return await prisma.transaction.update({ where: { id }, data });
	}

	// Supprimer une transaction
	static async delete(id: string) {
		return await prisma.transaction.delete({ where: { id } });
	}
}