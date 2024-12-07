-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "propertyId" TEXT;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
