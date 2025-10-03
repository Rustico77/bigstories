import { TransactionChannel, TransactionStatus } from "@prisma/client";

export interface TransactionModel {
  id: string;
  clientName?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  code: string;
  message: string;
  channels: TransactionChannel;
  country: string;
  paymentMethod: string;
}

export interface TransactionResponse {
  id: string;
  clientName?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  code: string;
  message: string;
  channels: TransactionChannel;
  country: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}
