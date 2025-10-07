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

export interface TransactionPaymentModel {
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
  customer_name?: string;
  customer_surname?: string;
  customer_phone_number?: string;
  customer_email?: string;
  customer_address?: string;
  customer_city?: string;
  customer_country?: string;
  customer_state?: string;
  customer_zip_code?: string;
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
