import { TransactionChannel, TransactionStatus } from "@prisma/client";

export interface TransactionModel {
  clientName?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  code: string;
  message: string;
  channels: TransactionChannel;
  country: string;
  paymentMethod: string;
  paymentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
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
  paymentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
