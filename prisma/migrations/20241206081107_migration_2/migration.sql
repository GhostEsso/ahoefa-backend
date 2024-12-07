-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'AGENT_PREMIUM';
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "agentStatus" "AgentStatus",
ADD COLUMN     "lastPostReset" TIMESTAMP(3),
ADD COLUMN     "monthlyPosts" INTEGER NOT NULL DEFAULT 0;
