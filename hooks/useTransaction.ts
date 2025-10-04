import { getAllTransaction } from "@/app/actions/transaction";
import { TransactionResponse } from "@/app/models/transaction";
import { useState } from "react";



export function useTransaction() {
    const [transactions, setTransactions] = useState<Array<TransactionResponse> | []>([]);
    const [transactionLoading, setTransactionLoading] = useState(false);

    async function loadTransactions() {
        setTransactionLoading(true);

        const res = await getAllTransaction();
        setTransactions(res as Array<TransactionResponse>);

        setTransactionLoading(false);
    }

    return { transactions, transactionLoading, loadTransactions };
}