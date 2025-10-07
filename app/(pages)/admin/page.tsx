"use client";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Loading from "@/app/components/loading";
import { useTransaction } from "@/hooks/useTransaction";
import { TransactionStatus } from "@prisma/client";
import { getTransactionStatusLabel } from "@/app/utils/enumLabels";
import { checkPayment } from "@/app/actions/cinetPay";
import { updateTransaction } from "@/app/actions/transaction";
import CreateUserModal from "@/app/components/modals/createUserModal";
import { useAdmin } from "@/hooks/useAdmin";
import { deleteUser, resetUserPassword } from "@/app/actions/user";
import { toast } from "sonner";
import ShowPasswordModal from "@/app/components/modals/showPasswordModal";
import ConfirmDeleteUserModal from "@/app/components/modals/ConfirmDeleteUserModal";
import UpdateUserModal from "@/app/components/modals/updateUserModal";
import { UserModel } from "@/app/models/user";


function formatXOF(amount: number) {
  return amount.toLocaleString("fr-FR").replace(/\u202f|,/g, " ");
}

export default function AdminPage() {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Filtre stats
  const [statsPeriod, setStatsPeriod] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [openPassword, setOpenPassword] = useState(false);
  const [openDeleteUser, setDeleteUser] = useState(false);
  const [openUpdateUser, setUpdateUser] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<UserModel>();
  const route = useRouter();
  const { user, loading } = useCurrentUser();
  const { transactions, loadTransactions } =
    useTransaction();
  const { listAdmin, loadAdmins } = useAdmin();

  // Helper pour filtrer les transactions par période
  function filterTransactionsByPeriod(
    period: string,
    start?: string,
    end?: string
  ) {
    const now = new Date();
    return transactions.filter((t) => {
      const tDate = t.createdAt ? new Date(t.createdAt) : null;
      if (!tDate) return false;
      if (period === "today") {
        // Compare only the date part
        const todayStr = now.toISOString().slice(0, 10);
        return tDate.toISOString().slice(0, 10) === todayStr && t.code === "00";
      }
      if (period === "week") {
        // Monday to Sunday of current week
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Sunday=7
        const monday = new Date(now);
        monday.setDate(now.getDate() - dayOfWeek + 1);
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        return tDate >= monday && tDate <= sunday && t.code === "00";
      }
      if (period === "month") {
        // 1st to last day of current month
        const firstDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
          0,
          0,
          0,
          0
        );
        const lastDay = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        return tDate >= firstDay && tDate <= lastDay && t.code === "00";
      }
      if (period === "custom" && start && end) {
        const dStart = new Date(start);
        dStart.setHours(0, 0, 0, 0);
        const dEnd = new Date(end);
        dEnd.setHours(23, 59, 59, 999);
        return tDate >= dStart && tDate <= dEnd && t.code === "00";
      }
      return t.code === "00";
    });
  }

  // Méthodes de paiement dynamiques
  const paymentMethodsList = Array.from(
    new Set(transactions.map((t) => t.paymentMethod).filter(Boolean))
  );
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("");

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
    const matchPaymentMethod =
      filterPaymentMethod === "" || t.paymentMethod === filterPaymentMethod;
    const matchDate =
      filterDate === "" ||
      (t.createdAt &&
        new Date(t.createdAt).toISOString().slice(0, 10) === filterDate);
    return (
      matchSearch &&
      matchStatus &&
      matchCountry &&
      matchPaymentMethod &&
      matchDate
    );
  });

  const updateTransactions = async () => {
    const listTrans = transactions.filter((t) => t.code !== "00");

    for (const t of listTrans) {
      if (
        t.createdAt &&
        new Date().getTime() - new Date(t.createdAt).getTime() >
          24 * 60 * 60 * 1000
      ) {
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

  const handleResetPassword = async (id: string) => {
    setNewPassword("");
    const password = Math.floor(10000000 + Math.random() * 90000000).toString();

    const res = await resetUserPassword(id, password);
    if (res.isSuccess) {
      toast.success(res.message);
      setNewPassword(password);
      setOpenPassword(true);
    } else {
      toast.error(res.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const res = await deleteUser(id);
    if (res.isSuccess) {
      toast.success(res.message);
      loadAdmins();
      setDeleteUser(false);
    } else {
      toast.error(res.message);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      route.push("/login");
    } else {
      loadTransactions();
      loadAdmins();
      updateTransactions();
    }
  }, [user, loading, route]);

  if (loading) return Loading();

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Show password modal */}
      <ShowPasswordModal
        password={newPassword}
        open={openPassword}
        setOpen={setOpenPassword}
      />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold mb-8 text-primary">
          Tableau de bord
        </h1>
        <div className="space-x-4 flex items-center">
          <span className="border-4 rounded-2xl font-bold bg-red-100 border-primary p-2">
            {user?.email}
          </span>
          <button onClick={() => {logoutAction(); route.push("/login")}} className="p-2 bg-orange-100 rounded-2xl border-2 border-orange-300 hover:bg-primary hover:text-white cursor-pointer ">
            Se déconnecter
          </button>
        </div>
      </div>
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
          {user?.role === "ADMIN" && (
            <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-primary data-[state=active]:text-white text-primary px-10 py-5 rounded-lg font-semibold transition-all cursor-pointer"
          >
            Paramètres
          </TabsTrigger>
          )}
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
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="border border-primary rounded-lg px-4 py-2 w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Toutes les méthodes</option>
              {paymentMethodsList.map((m) => (
                <option key={m} value={m}>
                  {m}
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
          <div className="flex items-center justify-end mb-4">
            <label className="mr-2 font-semibold text-primary">
              Nombre de lignes :
            </label>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="border border-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ width: "100px" }}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
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
              <table className="min-w-full bg-white rounded-xl shadow border border-primary">
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
                  {filteredTransactions.slice(0, rowsPerPage).map((t) => (
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
              <option value="today">{"Aujourd'hui"}</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="custom">Personnalisé</option>
            </select>

            {/* Custom filter */}
            {statsPeriod === "custom" && (
              <div className="flex flex-row gap-4 w-full items-center">
                <label className="text-sm font-semibold text-primary">
                  Date de début
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => {
                    setCustomStart(e.target.value);
                    if (
                      customEnd &&
                      e.target.value &&
                      e.target.value > customEnd
                    ) {
                      setCustomEnd("");
                    }
                  }}
                  className="border border-orange-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Date début"
                  style={{ maxWidth: "160px" }}
                />
                <label className="text-sm font-semibold text-primary">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="border border-orange-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Date fin"
                  disabled={!customStart}
                  min={customStart || undefined}
                  style={{ maxWidth: "160px" }}
                />
              </div>
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

        {/* Paramètres */}
        {user?.role === "ADMIN" && (
          <TabsContent value="settings">
          <div className="mb-8">
            <div className="mt-6 mb-4 flex justify-between">
              <h2 className="text-2xl font-bold text-primary mb-4">
                Gestion des utilisateurs
              </h2>
              <CreateUserModal actions={() => loadAdmins()} />
            </div>
            {/* TODO: Replace with real user data and CRUD actions */}
            <table className="min-w-full bg-white rounded-xl shadow border border-primary">
              <thead>
                <tr className="bg-primary/10 text-primary">
                  <th className="py-3 px-4 text-left font-semibold">Email</th>
                  <th className="py-3 px-4 text-left font-semibold">Rôle</th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Date de création
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Date de modification
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listAdmin.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-b hover:bg-orange-50/40 transition"
                  >
                    <td className="py-2 px-4">{admin.email}</td>
                    <td className="py-2 px-4">{admin.role}</td>
                    <td className="py-2 px-4">
                      {admin.createdAt
                        ? new Date(admin.createdAt).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : ""}
                    </td>
                    <td className="py-2 px-4">
                      {admin.updatedAt
                        ? new Date(admin.updatedAt).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : ""}
                    </td>
                    <td className="py-2 px-4 flex gap-2">
                      {/* Show Delete User Modal */}
                      <ConfirmDeleteUserModal open={openDeleteUser} setOpen={setDeleteUser} email={admin.email} onConfirm={() => handleDeleteUser(admin.id)}/>
                      
                      {/* Show Update User Modal */}
                      <UpdateUserModal open={openUpdateUser} setOpen={setUpdateUser} user={currentAdmin} actions={() => loadAdmins()}/> 

                      {/* Modifier */}
                      <button
                        title="Modifier"
                        className="p-2 rounded bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer"
                        onClick={() => {setUpdateUser(true); setCurrentAdmin(admin);}}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#801919"
                            d="M14.23 20v-2.21l5.334-5.307q.148-.13.305-.19t.315-.062q.172 0 .338.064q.166.065.301.194l.925.944q.123.148.188.308q.064.159.064.319t-.052.322t-.2.31L16.44 20zM5 18.616v-1.647q0-.619.36-1.158q.361-.54.97-.838q1.416-.679 2.834-1.018q1.417-.34 2.836-.34q.675 0 1.354.084t1.367.238l-2.875 2.855v1.824zm15.19-3.6l.925-.956l-.924-.944l-.95.95zM12 11.385q-1.237 0-2.119-.882T9 8.385t.881-2.12T12 5.386t2.119.88t.881 2.12t-.881 2.118t-2.119.882"
                          />
                        </svg>
                      </button>

                      {/* Supprimer */}
                      <button
                        title="Supprimer"
                        className="p-2 rounded bg-red-100 hover:bg-red-200 text-red-600 cursor-pointer"
                        onClick={() => setDeleteUser(true)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#801919"
                            d="m20.37 8.91l-1 1.73l-12.13-7l1-1.73l3.04 1.75l1.36-.37l4.33 2.5l.37 1.37zM6 19V7h5.07L18 11v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2"
                          />
                        </svg>
                      </button>

                      {/* Reset Password */}
                      <button
                        onClick={() => handleResetPassword(admin.id)}
                        title="ResetPassword"
                        className="p-2 rounded bg-red-100 hover:bg-red-200 text-red-600 cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#801919"
                            d="M12.63 2c5.53 0 10.01 4.5 10.01 10s-4.48 10-10.01 10c-3.51 0-6.58-1.82-8.37-4.57l1.58-1.25C7.25 18.47 9.76 20 12.64 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8C8.56 4 5.2 7.06 4.71 11h2.76l-3.74 3.73L0 11h2.69c.5-5.05 4.76-9 9.94-9m2.96 8.24c.5.01.91.41.91.92v4.61c0 .5-.41.92-.92.92h-5.53c-.51 0-.92-.42-.92-.92v-4.61c0-.51.41-.91.91-.92V9.23c0-1.53 1.25-2.77 2.77-2.77c1.53 0 2.78 1.24 2.78 2.77zm-2.78-2.38c-.75 0-1.37.61-1.37 1.37v1.01h2.75V9.23c0-.76-.62-1.37-1.38-1.37"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        )}
      
      </Tabs>
    </div>
  );
}
