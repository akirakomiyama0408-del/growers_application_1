-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visitors_name_key" ON "visitors"("name");

-- AlterTable
ALTER TABLE "visit_records" ADD COLUMN "visitorId" TEXT;

-- AddForeignKey
ALTER TABLE "visit_records" ADD CONSTRAINT "visit_records_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
