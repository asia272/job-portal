-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "JobLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'SENIOR');

-- CreateEnum
CREATE TYPE "JobCategory" AS ENUM ('PROGRAMMING', 'MARKETING', 'DESIGNING', 'ACCOUNTING', 'ANALYTICS');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resumeUrl" TEXT,
    "resumePublicId" TEXT,
    "resumeFileName" TEXT,
    "resumeUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruiter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT NOT NULL,
    "companyLogoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recruiter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "recruiterId" TEXT NOT NULL,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT[],
    "skills" TEXT[],
    "category" "JobCategory" NOT NULL,
    "level" "JobLevel" NOT NULL,
    "location" TEXT NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recruiterId" TEXT NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "resumeUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_clerkId_key" ON "Candidate"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Recruiter_email_key" ON "Recruiter"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_recruiterId_idx" ON "EmailVerificationToken"("recruiterId");

-- CreateIndex
CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Job_category_idx" ON "Job"("category");

-- CreateIndex
CREATE INDEX "Job_location_idx" ON "Job"("location");

-- CreateIndex
CREATE INDEX "Job_recruiterId_idx" ON "Job"("recruiterId");

-- CreateIndex
CREATE INDEX "Application_jobId_status_idx" ON "Application"("jobId", "status");

-- CreateIndex
CREATE INDEX "Application_candidateId_idx" ON "Application"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_candidateId_jobId_key" ON "Application"("candidateId", "jobId");

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Recruiter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Recruiter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
