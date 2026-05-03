/*
  Warnings:

  - Added the required column `service` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "service" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QueueMessage" ALTER COLUMN "retryCount" SET DEFAULT 0;
