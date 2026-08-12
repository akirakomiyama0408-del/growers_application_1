-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('OPEN_FIELD', 'GREENHOUSE');

-- CreateEnum
CREATE TYPE "CultivationStatus" AS ENUM ('SEEDLING', 'PLANTED', 'GROWING', 'HARVESTING', 'FINISHED');

-- CreateEnum
CREATE TYPE "PestDiseaseType" AS ENUM ('DISEASE', 'PEST');

-- CreateEnum
CREATE TYPE "CostCategory" AS ENUM ('MATERIAL', 'LABOR', 'UTILITY', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fields" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FieldType" NOT NULL DEFAULT 'GREENHOUSE',
    "areaSqm" DOUBLE PRECISION,
    "location" TEXT,
    "memo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,

    CONSTRAINT "fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "varieties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "varieties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "memo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fertilizer_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "memo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fertilizer_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesticide_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "activeIngredient" TEXT,
    "targetPest" TEXT,
    "defaultDilution" TEXT,
    "phiDays" INTEGER,
    "memo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pesticide_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kana" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "postalCode" TEXT,
    "address" TEXT,
    "memo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_records" (
    "id" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "nextAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "visit_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cultivation_cycles" (
    "id" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "status" "CultivationStatus" NOT NULL DEFAULT 'SEEDLING',
    "seedlingDate" TIMESTAMP(3),
    "plantingDate" TIMESTAMP(3),
    "plannedEndDate" TIMESTAMP(3),
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "varietyId" TEXT NOT NULL,

    CONSTRAINT "cultivation_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_logs" (
    "id" TEXT NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cultivationCycleId" TEXT NOT NULL,
    "workTypeId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "work_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fertilization_records" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" TEXT,
    "method" TEXT,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cultivationCycleId" TEXT NOT NULL,
    "fertilizerProductId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "fertilization_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pest_disease_records" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "PestDiseaseType" NOT NULL,
    "name" TEXT NOT NULL,
    "severity" TEXT,
    "action" TEXT,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cultivationCycleId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "pest_disease_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesticide_applications" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dilution" TEXT,
    "amount" TEXT,
    "targetPest" TEXT,
    "weather" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cultivationCycleId" TEXT NOT NULL,
    "pesticideProductId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "pesticide_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "harvest_records" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amountKg" DOUBLE PRECISION NOT NULL,
    "grade" TEXT,
    "brixLevel" DOUBLE PRECISION,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cultivationCycleId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "harvest_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_records" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "lotNumber" TEXT,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cultivationCycleId" TEXT NOT NULL,
    "harvestRecordId" TEXT,
    "destinationId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "sales_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_records" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" "CostCategory" NOT NULL,
    "item" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cultivationCycleId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "cost_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,
    "cultivationCycleId" TEXT,
    "workLogId" TEXT,
    "pestDiseaseRecordId" TEXT,
    "harvestRecordId" TEXT,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "varieties_name_key" ON "varieties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_name_key" ON "destinations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "work_types_name_key" ON "work_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "fertilizer_products_name_key" ON "fertilizer_products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pesticide_products_name_key" ON "pesticide_products"("name");

-- CreateIndex
CREATE INDEX "visit_records_customerId_idx" ON "visit_records"("customerId");

-- CreateIndex
CREATE INDEX "cultivation_cycles_customerId_idx" ON "cultivation_cycles"("customerId");

-- CreateIndex
CREATE INDEX "cultivation_cycles_fieldId_idx" ON "cultivation_cycles"("fieldId");

-- CreateIndex
CREATE INDEX "work_logs_cultivationCycleId_idx" ON "work_logs"("cultivationCycleId");

-- CreateIndex
CREATE INDEX "fertilization_records_cultivationCycleId_idx" ON "fertilization_records"("cultivationCycleId");

-- CreateIndex
CREATE INDEX "pest_disease_records_cultivationCycleId_idx" ON "pest_disease_records"("cultivationCycleId");

-- CreateIndex
CREATE INDEX "pesticide_applications_cultivationCycleId_idx" ON "pesticide_applications"("cultivationCycleId");

-- CreateIndex
CREATE INDEX "harvest_records_cultivationCycleId_idx" ON "harvest_records"("cultivationCycleId");

-- CreateIndex
CREATE INDEX "sales_records_cultivationCycleId_idx" ON "sales_records"("cultivationCycleId");

-- CreateIndex
CREATE INDEX "cost_records_cultivationCycleId_idx" ON "cost_records"("cultivationCycleId");

-- AddForeignKey
ALTER TABLE "fields" ADD CONSTRAINT "fields_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_records" ADD CONSTRAINT "visit_records_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_records" ADD CONSTRAINT "visit_records_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivation_cycles" ADD CONSTRAINT "cultivation_cycles_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivation_cycles" ADD CONSTRAINT "cultivation_cycles_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivation_cycles" ADD CONSTRAINT "cultivation_cycles_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "varieties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_cultivationCycleId_fkey" FOREIGN KEY ("cultivationCycleId") REFERENCES "cultivation_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_workTypeId_fkey" FOREIGN KEY ("workTypeId") REFERENCES "work_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fertilization_records" ADD CONSTRAINT "fertilization_records_cultivationCycleId_fkey" FOREIGN KEY ("cultivationCycleId") REFERENCES "cultivation_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fertilization_records" ADD CONSTRAINT "fertilization_records_fertilizerProductId_fkey" FOREIGN KEY ("fertilizerProductId") REFERENCES "fertilizer_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fertilization_records" ADD CONSTRAINT "fertilization_records_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pest_disease_records" ADD CONSTRAINT "pest_disease_records_cultivationCycleId_fkey" FOREIGN KEY ("cultivationCycleId") REFERENCES "cultivation_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pest_disease_records" ADD CONSTRAINT "pest_disease_records_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesticide_applications" ADD CONSTRAINT "pesticide_applications_cultivationCycleId_fkey" FOREIGN KEY ("cultivationCycleId") REFERENCES "cultivation_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesticide_applications" ADD CONSTRAINT "pesticide_applications_pesticideProductId_fkey" FOREIGN KEY ("pesticideProductId") REFERENCES "pesticide_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesticide_applications" ADD CONSTRAINT "pesticide_applications_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvest_records" ADD CONSTRAINT "harvest_records_cultivationCycleId_fkey" FOREIGN KEY ("cultivationCycleId") REFERENCES "cultivation_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvest_records" ADD CONSTRAINT "harvest_records_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_records" ADD CONSTRAINT "sales_records_cultivationCycleId_fkey" FOREIGN KEY ("cultivationCycleId") REFERENCES "cultivation_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_records" ADD CONSTRAINT "sales_records_harvestRecordId_fkey" FOREIGN KEY ("harvestRecordId") REFERENCES "harvest_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_records" ADD CONSTRAINT "sales_records_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_records" ADD CONSTRAINT "sales_records_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_records" ADD CONSTRAINT "cost_records_cultivationCycleId_fkey" FOREIGN KEY ("cultivationCycleId") REFERENCES "cultivation_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_records" ADD CONSTRAINT "cost_records_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_cultivationCycleId_fkey" FOREIGN KEY ("cultivationCycleId") REFERENCES "cultivation_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_workLogId_fkey" FOREIGN KEY ("workLogId") REFERENCES "work_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_pestDiseaseRecordId_fkey" FOREIGN KEY ("pestDiseaseRecordId") REFERENCES "pest_disease_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_harvestRecordId_fkey" FOREIGN KEY ("harvestRecordId") REFERENCES "harvest_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
