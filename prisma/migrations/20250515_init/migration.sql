-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'SUPERVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "departmentName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "smjena" TEXT,
    "urednostCistoca" TEXT,
    "stanjePolica" TEXT,
    "cijeneDeklaracije" BOOLEAN,
    "uoceniProblemi" TEXT,
    "artiklNedostaje" TEXT,
    "artiklNajprodavaniji" TEXT,
    "robaOtpis" TEXT,
    "potrebneNarudzbe" TEXT,
    "top1000Izlozenost" TEXT,
    "procjenaDnevneProdaje" TEXT,
    "uspjesniArtikliAkcije" TEXT,
    "problemiProdaje" TEXT,
    "prijedloziPovecanjaProdaje" TEXT,
    "prisustvouUredno" BOOLEAN,
    "problemiOrganizacijeRada" TEXT,
    "napomeneZaposlenici" TEXT,
    "dodatnaEdukacija" TEXT,
    "brojReklamacija" TEXT,
    "vrstaReklamacija" TEXT,
    "nacinRjesenja" TEXT,
    "pohvaleKomentari" TEXT,
    "sigurnosniProblemi" TEXT,
    "kvaroviOpreme" TEXT,
    "servisOdrzavanje" TEXT,
    "zastiteNaRadu" BOOLEAN,
    "dodatneNapomene" TEXT,
    "datumVrijemePredaje" TIMESTAMP(3),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
