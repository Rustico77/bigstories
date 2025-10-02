"use client";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSessionAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Loading from "@/app/components/loading";
import { useTransaction } from "@/hooks/useTransaction";
import { TransactionStatus } from "@prisma/client";
import { getTransactionStatusLabel } from "@/app/utils/enumLabels";
import { checkPayment } from "@/app/actions/cinetPay";
import { updateTransaction } from "@/app/actions/transaction";

// const transactions = [
//   {
//     id: 1,
//     client: "",
//     amount: 5000,
//     country: "Côte d'Ivoire",
//     date: "2025-09-30",
//     status: "Succès",
//   },
//   {
//     id: 2,
//     client: "Awa Diop",
//     amount: 3000,
//     country: "Sénégal",
//     date: "2025-09-29",
//     status: "Échec",
//   },
//   {
//     id: 3,
//     client: "Mohamed Traoré",
//     amount: 7000,
//     country: "Mali",
//     date: "2025-09-28",
//     status: "Succès",
//   },
// ];

const stats = [
  { country: "Côte d'Ivoire", count: 10, total: 50000 },
  { country: "Sénégal", count: 7, total: 21000 },
  { country: "Mali", count: 5, total: 35000 },
];

function formatXOF(amount: number) {
  return amount.toLocaleString("fr-FR").replace(/\u202f|,/g, " ");
}

export default function AdminPage() {
  // Filtre stats
  const [statsPeriod, setStatsPeriod] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const route = useRouter();
  const { user, loading } = useCurrentUser();
  const { transactions, loadTransactions, transactionLoading } =
    useTransaction();

  // Helper pour filtrer les transactions par période
  function filterTransactionsByPeriod(
    period: string,
    start?: string,
    end?: string
  ) {
    const now = new Date();
    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      if (period === "today") {
        return tDate.toDateString() === now.toDateString();
      }
      if (period === "week") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return tDate >= weekStart && tDate <= weekEnd;
      }
      if (period === "month") {
        return (
          tDate.getMonth() === now.getMonth() &&
          tDate.getFullYear() === now.getFullYear()
        );
      }
      if (period === "custom" && start && end) {
        const dStart = new Date(start);
        const dEnd = new Date(end);
        return tDate >= dStart && tDate <= dEnd;
      }
      return true;
    });
  }

  // Liste des pays de référence (pour stats)
  const referenceCountries = Array.from(
    new Set(transactions.map((t) => t.country))
  );

  // Stats dynamiques selon le filtre : tous les pays affichés, données à 0 si aucune transaction
  const filteredStats = referenceCountries.map((country) => {
    const filtered = filterTransactionsByPeriod(
      statsPeriod,
      customStart,
      customEnd
    ).filter((t) => t.country === country);
    return {
      country,
      count: filtered.length,
      total: filtered.reduce((acc, t) => acc + t.amount, 0),
    };
  });

  // Somme totale toutes transactions filtrées
  const totalSum = filterTransactionsByPeriod(
    statsPeriod,
    customStart,
    customEnd
  ).reduce((acc, t) => acc + t.amount, 0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Pays dynamiques
  const countriesList = Array.from(new Set(transactions.map((t) => t.country)));

  // Filtrage des transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchSearch =
      search === "" ||
      t.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      t.amount.toString().includes(search);
    const matchStatus = filterStatus === "" || t.status === filterStatus;
    const matchCountry = filterCountry === "" || t.country === filterCountry;
    const matchDate =
      filterDate === "" ||
      (t.createdAt &&
        new Date(t.createdAt).toISOString().slice(0, 10) === filterDate);
    return matchSearch && matchStatus && matchCountry && matchDate;
  });

  const updateTransactions = async () => {
    const listTrans = transactions.filter((t) => t.code !== "00");

    for (const t of listTrans) {
      if(t.createdAt && (new Date().getTime() - new Date(t.createdAt).getTime()) > 24*60*60*1000){
        continue; // Skip if transaction is older than 24 hours
      }
      const res = await checkPayment(t.id);
      if (res && res.data) {
        t.status = res.data.status;
        t.message = res.message;
        t.code = res.code;
        t.paymentMethod = res.data.payment_method;

        await updateTransaction(t.id, t);
      }
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      route.push("/login");
    } else {
      loadTransactions();
      updateTransactions();
    }
  }, [user, loading, route]);

  if (loading) return Loading();

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-primary">
        Tableau de bord
      </h1>
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="flex justify-start gap-2 bg-orange-50 rounded-lg p-1 mb-8">
          <TabsTrigger
            value="transactions"
            className="data-[state=active]:bg-primary data-[state=active]:text-white text-primary px-10 py-5 rounded-lg font-semibold transition-all cursor-pointer"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="data-[state=active]:bg-primary data-[state=active]:text-white text-primary px-10 py-5 rounded-lg font-semibold transition-all cursor-pointer"
          >
            Statistiques par pays
          </TabsTrigger>
        </TabsList>

        {/* Transactions */}
        <TabsContent value="transactions">
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou montant..."
              className="border border-primary rounded-lg px-4 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-primary rounded-lg px-4 py-2 w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tous les statuts</option>
              <option value={TransactionStatus.PENDING}>
                {getTransactionStatusLabel(TransactionStatus.PENDING)}
              </option>
              <option value={TransactionStatus.ACCEPTED}>
                {getTransactionStatusLabel(TransactionStatus.ACCEPTED)}
              </option>
              <option value={TransactionStatus.REFUSED}>
                {getTransactionStatusLabel(TransactionStatus.REFUSED)}
              </option>
            </select>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="border border-primary rounded-lg px-4 py-2 w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tous les pays</option>
              {countriesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-primary rounded-lg px-4 py-2 w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="overflow-x-auto">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <img
                  src="/globe.svg"
                  alt="Aucune transaction"
                  className="w-20 h-20 mb-4 opacity-60"
                />
                <div className="text-primary font-bold text-lg mb-2">
                  Aucune transaction trouvée
                </div>
                <div className="text-gray-400">
                  Aucune donnée ne correspond à vos filtres.
                </div>
              </div>
            ) : (
              <table className="min-w-full bg-white rounded-xl shadow border border-red-100">
                <thead>
                  <tr className="bg-red-50 text-primary">
                    <th className="py-3 px-4 text-left font-semibold">ID</th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Client
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Montant (XOF)
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">Pays</th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Méthode paiement
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">Date</th>
                    <th className="py-3 px-4 text-left font-semibold">Code</th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Statut
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b hover:bg-orange-50/40 transition"
                    >
                      {/* transaction ID */}
                      <td className="py-2 px-4 font-medium text-primary">
                        {t.id}
                      </td>
                      {/* client name or "Anonyme" */}
                      <td className="py-2 px-4">
                        {t.clientName ? (
                          t.clientName
                        ) : (
                          <span className="italic text-gray-400">Anonyme</span>
                        )}
                      </td>
                      {/* Amount */}
                      <td className="py-2 px-4 font-semibold">
                        {formatXOF(t.amount)}
                      </td>
                      {/* Country */}
                      <td className="py-2 px-4">{t.country}</td>
                      {/* Payment method */}
                      <td className="py-2 px-4">{t.paymentMethod}</td>
                      {/* Date */}
                      <td className="py-2 px-4">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleString("fr-FR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : ""}
                      </td>
                      {/* Code Status */}
                      <td className="py-2 px-4 flex justify-center">
                        {t.code}
                      </td>
                      {/* Status */}
                      <td className="py-2 px-4">
                        <Badge
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            t.status === TransactionStatus.ACCEPTED
                              ? "bg-green-100 text-green-700"
                              : t.status === TransactionStatus.REFUSED
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {getTransactionStatusLabel(t.status)}
                        </Badge>
                      </td>
                      {/* Message Status */}
                      <td className="py-2 px-4 flex justify-center">
                        {t.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* Stats */}
        <TabsContent value="stats">
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <select
              value={statsPeriod}
              onChange={(e) => setStatsPeriod(e.target.value)}
              className="border border-orange-200 rounded-lg px-4 py-2 w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="all">Tout</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="custom">Personnalisé</option>
            </select>

            {/* Custom filter */}
            {statsPeriod === "custom" && (
              <>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="border border-orange-200 rounded-lg px-4 py-2 w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Date début"
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="border border-orange-200 rounded-lg px-4 py-2 w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Date fin"
                />
              </>
            )}

            {/* Somme total */}
            <div className="font-bold text-primary text-lg md:text-xl">
              Somme totale : {formatXOF(totalSum)}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredStats.map((s) => (
              <Card
                key={s.country}
                className="border border-primary shadow rounded-xl bg-gradient-to-br from-red-50 to-white p-4 flex flex-col items-center justify-between min-h-[120px]"
              >
                <CardContent className="flex flex-col items-center justify-between w-full p-0">
                  <h2 className="text-lg font-bold text-primary mb-3 text-center truncate w-full">
                    {s.country}
                  </h2>
                  <div className="flex flex-row items-center justify-between w-full gap-4">
                    <div className="flex flex-col items-center flex-1 bg-red-100 rounded-lg py-3 mx-1">
                      <span className="text-xs font-semibold text-primary mb-1">
                        Transactions
                      </span>
                      <span className="text-2xl font-bold text-primary whitespace-nowrap">
                        {s.count}
                      </span>
                    </div>
                    <div className="flex flex-col items-center flex-1 bg-orange-100 rounded-lg py-3 mx-1">
                      <span className="text-xs font-semibold text-primary mb-1">
                        Somme totale
                      </span>
                      <span className="text-xl font-bold px-4 text-primary whitespace-nowrap">
                        {formatXOF(s.total)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
