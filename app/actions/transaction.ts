"use server";

import Transaction from "../api/transactions";
import { TransactionModel } from "../models/transaction";

export async function createTransaction(data: TransactionModel) {
  return await Transaction.create(data);
}

export async function updateTransaction(id: string, data: TransactionModel) {
  return await Transaction.update(id, data);
}

export async function getAllTransaction() {
  return await Transaction.getAll();
}

export async function getSingleTransaction(id: string) {
  return await Transaction.getById(id);
}
