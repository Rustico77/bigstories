"use client";

import { useState } from "react";
import { createTransaction } from "./actions/transaction";
import { TransactionChannel, TransactionStatus } from "@prisma/client";
import { toast } from "sonner";
import { initPayment } from "./actions/cinetPay";
import { TransactionModel, TransactionPaymentModel } from "./models/transaction";
import { createId } from "@paralleldrive/cuid2";

const countries = [
  "Togo",
  "Bénin",
  "Burkina-Faso",
  "Niger",
  "Guinée Conakry",
  "Cameroon",
  "Gabon",
  "Côte d'Ivoire",
  "Sénégal",
  "Mali",
];

// Codes pays ISO 3166-1 alpha-2 (ou alpha-3 pour la Guinée Conakry)
const countryCodes: { [key: string]: string } = {
  "Togo": "TG",
  "Bénin": "BJ",
  "Burkina-Faso": "BF",
  "Niger": "NE",
  "Guinée Conakry": "GN",
  "Cameroon": "CM",
  "Gabon": "GA",
  "Côte d'Ivoire": "CI",
  "Sénégal": "SN",
  "Mali": "ML",
};


const paymentMethods = [
  // { value: TransactionChannel.ALL, label: "Tout" },
  { value: TransactionChannel.MOBILE_MONEY, label: "Mobile Money" },
  { value: TransactionChannel.CREDIT_CARD, label: "Carte Bancaire" },
  { value: TransactionChannel.WALLET, label: "Wallet" },
];

// Helper pour formater les montants XOF avec espaces
function formatXOF(amount: number | string) {
  if (!amount) return "";
  const num = typeof amount === "string" ? parseInt(amount) : amount;
  if (isNaN(num)) return "";
  return num.toLocaleString("fr-FR").replace(/\u202f|,/g, " ") + " XOF";
}

export default function ClientPage() {
  const [amount, setAmount] = useState("");
  const suggestedAmounts = [1000, 2000, 5000, 10000, 20000];
  const [country, setCountry] = useState(countries[0]);
  const [name, setName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<TransactionChannel>(
    paymentMethods[0].value
  );
  const [loading, setLoading] = useState(false);
  // Champs pour carte bancaire
  const [customerName, setCustomerName] = useState("");
  const [customerSurname, setCustomerSurname] = useState("");
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerCountry, setCustomerCountry] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [customerZipCode, setCustomerZipCode] = useState("");

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setCustomerCountry(countryCodes[country]);

    const transactionPaymentData: TransactionPaymentModel = {
      id: createId(),
      amount: parseInt(amount),
      country: country,
      channels: paymentMethod,
      code: "",
      message: "",
      currency: "XOF",
      paymentMethod: "",
      status: TransactionStatus.PENDING,
      clientName: name || undefined,
      customer_name: customerName || undefined,
      customer_surname: customerSurname || undefined,
      customer_phone_number: customerPhoneNumber || undefined,
      customer_email: customerEmail || undefined,
      customer_address: customerAddress || undefined,
      customer_city: customerCity || undefined,
      customer_country: customerCountry || undefined,
      customer_state: customerState || undefined,
      customer_zip_code: customerZipCode || undefined,
    };

    const transactionData: TransactionModel = {
      id: transactionPaymentData.id,
      amount: transactionPaymentData.amount,
      country: transactionPaymentData.country,
      channels: transactionPaymentData.channels,
      code: "",
      message: "",
      currency: "XOF",
      paymentMethod: "",
      status: TransactionStatus.PENDING,
      clientName: name || undefined,
    };



    // Initialisation du paiement via CinetPay
    const resPayment = await initPayment(transactionPaymentData);
    if (resPayment.code !== "201") {
      toast.error(
        resPayment.description || "Erreur lors de l'initialisation du paiement"
      );
    } else {
      // Redirection vers l'URL de paiement
      if (resPayment.data && resPayment.data.payment_url) {
        // Enregistrement de la transaction dans la base de données
        const res = await createTransaction(transactionData);
        if (!res.isSuccess) {
          toast.error(res.message);
        } else {
          window.location.href = resPayment.data.payment_url;
        }
      } else {
        toast.error("URL de paiement non disponible");
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <div className="bg-red-300 mb-4 h-40 w-72 mx-auto flex items-center shadow-2xl justify-center rounded-lg animate-pulse">
        <img src="/appLogo.svg" alt="logo" />
      </div>
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">
        Paiement
      </h1>
      <form
        className="bg-white rounded-xl shadow p-8 space-y-6"
        onSubmit={handlePay}
      >
        {/* Montant */}
        <div>
          <label className="block mb-2 font-semibold text-primary">
            Montant à payer*
          </label>
          <input
            type="number"
            required
            min={100}
            value={amount}
            step={5}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Ex: 5 000"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {suggestedAmounts.map((val) => (
              <button
                type="button"
                key={val}
                className={`px-4 py-2 rounded-lg border font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition ${
                  parseInt(amount) === val
                    ? "border-primary bg-primary/20"
                    : "border-primary/30"
                }`}
                onClick={() => setAmount(val.toString())}
              >
                {formatXOF(val)}
              </button>
            ))}
          </div>
          {amount && !isNaN(Number(amount)) && (
            <div className="mt-2 text-right text-primary font-bold text-lg">
              {formatXOF(amount)}
            </div>
          )}
        </div>

        {/* Pays */}
        <div>
          <label className="block mb-2 font-semibold text-primary">Pays*</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Moyen de paiement */}
        <div>
          <label className="block mb-2 font-semibold text-primary">
            Moyen de paiement*
          </label>
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as TransactionChannel)
            }
            className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {paymentMethods.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Champs carte bancaire */}
        {paymentMethod === TransactionChannel.CREDIT_CARD && (
          <>
            {/* Nom */}
            <div>
              <label className="block mb-2 font-semibold text-primary">
                Nom du titulaire*
              </label>
              <input
                type="text"
                value={customerSurname}
                onChange={(e) => setCustomerSurname(e.target.value)}
                className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Nom du titulaire de la carte"
                required
              />
            </div>

            {/* Prénoms */}
            <div>
              <label className="block mb-2 font-semibold text-primary">
                Prénom du titulaire*
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Prénom du titulaire de la carte"
                required
              />
            </div>

            {/* Tel */}
            <div>
              <label className="block mb-2 font-semibold text-primary">
                Téléphone*
              </label>
              <input
                type="tel"
                value={customerPhoneNumber}
                onChange={(e) => setCustomerPhoneNumber(e.target.value)}
                className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Numéro de téléphone"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 font-semibold text-primary">
                Email*
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Adresse email"
                required
              />
            </div>

            {/* Ville */}
            <div>
              <label className="block mb-2 font-semibold text-primary">
                Ville
              </label>
              <input
                type="text"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Ville du client"
              />
            </div>

            {/* Adresse complète */}
            <div>
              <label className="block mb-2 font-semibold text-primary">
                Adresse
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Adresse du client"
              />
            </div>

            {/* État / Région */}
            <div>
              <label className="block mb-2 font-semibold text-primary">
                État / Région
              </label>
              <input
                type="text"
                value={customerState}
                onChange={(e) => setCustomerState(e.target.value)}
                className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="État ou région du client"
              />
            </div>

            {/* Code postal */}
            <div>
              <label className="block mb-2 font-semibold text-primary">
                Code postal
              </label>
              <input
                type="text"
                value={customerZipCode}
                onChange={(e) => setCustomerZipCode(e.target.value)}
                className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Code postal du client"
              />
            </div>
          </>
        )}

        {/* Nom complet */}
        <div>
          <label className="block mb-2 font-semibold text-primary">
            Nom complet (optionnel)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Nom et prénom du client"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold cursor-pointer hover:bg-primary/80 transition"
          disabled={loading}
        >
          {loading ? "Paiement en cours..." : "Payer"}
        </button>
      </form>
      {/* Bouton Condition d'utilisation */}
      <div className="flex justify-center mt-8">
        <button
          type="button"
          className="text-primary cursor-pointer underline font-semibold hover:text-orange-600 transition"
          onClick={() => window.open("/conditions", "_blank")}
        >
          {"Conditions d'utilisation"}
        </button>
      </div>
    </div>
  );
}
