/*
  Warnings:

  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TokenTypes" AS ENUM ('EmailVerification', 'PasswordReset');

-- DropTable
DROP TABLE "VerificationToken";

-- CreateTable
CREATE TABLE "token" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TokenTypes" NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_token_key" ON "token"("token");

-- CreateIndex
CREATE INDEX "token_email_type_idx" ON "token"("email", "type");

-- CreateIndex
CREATE UNIQUE INDEX "token_email_token_type_key" ON "token"("email", "token", "type");
