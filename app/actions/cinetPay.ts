"use server";

import { TransactionModel } from "../models/transaction";


export async function initPayment(data: TransactionModel) {
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
        "customer_name": data.customer_name,
        "customer_surname": data.customer_surname,
        "customer_email": data.customer_email,
        "customer_phone_number": data.customer_phone_number,
        "customer_address": data.customer_address,
        "customer_city": data.customer_city,
        "customer_country": data.customer_country,
        "customer_state": data.customer_state,
        "customer_zip_code": data.customer_zip_code,
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