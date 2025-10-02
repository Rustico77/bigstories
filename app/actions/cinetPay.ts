"use server";

import { TransactionModel, TransactionResponse } from "../models/transaction";


export async function initPayment(data: TransactionResponse) {
  const res = await fetch(`${process.env.CINETPAY_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
        "apikey": process.env.API_KEY_CINETPAY,
        "site_id": process.env.SITE_ID_CINETPAY,
        "transaction_id": data.id,
        "amount": data.amount,
        "currency": "XOF",
        "description": "Paiement BigStories",
        "notify_url": "",
        "return_url": "",
        "channels": data.channels,
    }),
  });

  return res.json();
}


export async function checkPayment(id: string) {
  const res = await fetch(`${process.env.CINETPAY_URL}/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
        "apikey": process.env.API_KEY_CINETPAY,
        "site_id": process.env.SITE_ID_CINETPAY,
        "transaction_id": id,
    }),
  });

  return res.json();
}