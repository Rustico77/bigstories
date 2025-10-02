"use client";

import { useState } from "react";
import { createTransaction } from "./actions/transaction";
import { TransactionChannel, TransactionStatus } from "@prisma/client";
import { toast } from "sonner";
import { initPayment } from "./actions/cinetPay";
import { TransactionResponse } from "./models/transaction";

const countries = ["Togo", "Bénin", "Burkina-Faso", "Niger", "Guinée Conakry", "Cameroon", "Gabon", "Côte d'Ivoire", "Sénégal", "Mali"];
const paymentMethods = [
  // { value: TransactionChannel.ALL, label: "Tout" },
  { value: TransactionChannel.MOBILE_MONEY, label: "Mobile Money" },
  { value: TransactionChannel.CREDIT_CARD, label: "Carte Bancaire" },
  { value: TransactionChannel.WALLET, label: "Wallet" },
];

// Helper pour formater les montants XOF avec espaces
function formatXOF(amount: number | string) {
  if (!amount) return '';
  const num = typeof amount === 'string' ? parseInt(amount) : amount;
  if (isNaN(num)) return '';
  return num.toLocaleString('fr-FR').replace(/\u202f|,/g, ' ') + ' XOF';
}

export default function ClientPage() {
  const [amount, setAmount] = useState("");
  const suggestedAmounts = [1000, 2000, 5000, 10000, 20000];
  const [country, setCountry] = useState(countries[0]);
  const [name, setName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].value);
  const [loading, setLoading] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await createTransaction({
      amount: parseInt(amount),
      country: country,
      channels: paymentMethod,
      code: "",
      message: "",
      currency: "XOF",
      paymentMethod: "",
      paymentUrl: "",
      status: TransactionStatus.PENDING,
      clientName: name || null,
    });


    if(!res.isSuccess){
      toast.error(res.message);
    }else{
      const resPayment = await initPayment(res.data as TransactionResponse);
      if(resPayment.code !== "201"){
        toast.error(resPayment.description || "Erreur lors de l'initialisation du paiement");
      }else{
        // Redirection vers l'URL de paiement
        if(resPayment.data && resPayment.data.payment_url){
          window.location.href = resPayment.data.payment_url;
        }else{
          toast.error("URL de paiement non disponible");
        }
      }

    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">Paiement BigStories</h1>
      <form className="bg-white rounded-xl shadow p-8 space-y-6" onSubmit={handlePay}>
        <div>
          <label className="block mb-2 font-semibold text-primary">Nom complet (optionnel)</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Nom et prénom du client"
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-primary">Pays*</label>
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-primary">Moyen de paiement*</label>
          <select
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
            className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {paymentMethods.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-primary">Montant à payer*</label>
          <input
            type="number"
            required
            min={100}
            value={amount}
            step={5}
            onChange={e => setAmount(e.target.value)}
            className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Ex: 5 000"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {suggestedAmounts.map(val => (
              <button
                type="button"
                key={val}
                className={`px-4 py-2 rounded-lg border font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition ${parseInt(amount) === val ? 'border-primary bg-primary/20' : 'border-primary/30'}`}
                onClick={() => setAmount(val.toString())}
              >
                {formatXOF(val)}
              </button>
            ))}
          </div>
          {amount && !isNaN(Number(amount)) && (
            <div className="mt-2 text-right text-primary font-bold text-lg">{formatXOF(amount)}</div>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold cursor-pointer hover:bg-primary/80 transition"
          disabled={loading}
        >
          {loading ? "Paiement en cours..." : "Payer"}
        </button>
      </form>
    </div>
  );
}
