import { TransactionChannel, TransactionStatus } from "@prisma/client";

// Fonction utilitaire pour obtenir le label
export function getTransactionStatusLabel(status: string): string {
  switch (status) {
    case TransactionStatus.ACCEPTED:
      return "Accepté";
    case TransactionStatus.REFUSED:
      return "Refusé";
    case TransactionStatus.PENDING:
      return "En attente";
    default:
      return status;
  }
}

export function getTransactionChannelLabel(channel: string): string {
  switch (channel) {
    case TransactionChannel.ALL:
      return "Tout";
    case TransactionChannel.CREDIT_CARD:
      return "Carte de crédit";
    case TransactionChannel.MOBILE_MONEY:
      return "Mobile Money";
    case TransactionChannel.WALLET:
      return "Wallet";
    default:
      return channel;
  }
}
