/*
  Warnings:

  - You are about to drop the column `maxUses` on the `Room` table. All the data in the column will be lost.
  - Added the required column `maxUsers` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomAdmin` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDeleted" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "maxUses",
ADD COLUMN     "isDeleted" BOOLEAN DEFAULT false,
ADD COLUMN     "maxUsers" INTEGER NOT NULL,
ADD COLUMN     "roomAdmin" TEXT NOT NULL;
