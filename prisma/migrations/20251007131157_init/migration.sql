-- CreateEnum
CREATE TYPE "TransactionChannel" AS ENUM ('ALL', 'MOBILE_MONEY', 'CREDIT_CARD', 'WALLET');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('REFUSED', 'ACCEPTED', 'PENDING');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "TransactionMessage" AS ENUM ('SUCCES', 'CREATED', 'PAYMENT_FAILED', 'INSUFFICIENT_BALANCE', 'WAITING_CUSTOMER_PAYMENT', 'TRANSACTION_CANCEL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "clientName" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channels" "TransactionChannel" NOT NULL,
    "country" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
