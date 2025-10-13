-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'CONTRACTOR', 'STAFF');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('SINGLE_FAMILY', 'CONDO', 'TOWNHOUSE', 'MULTI_FAMILY', 'COMMERCIAL', 'LAND', 'OTHER');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'NEEDS_WORK');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('ANALYZING', 'UNDER_CONTRACT', 'IN_PROGRESS', 'COMPLETED', 'SOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('ANALYZING', 'OFFER_MADE', 'UNDER_CONTRACT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FinancingType" AS ENUM ('CASH', 'CONVENTIONAL', 'FHA', 'VA', 'HARD_MONEY', 'PRIVATE_MONEY', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('PURCHASE', 'REPAIRS', 'RENOVATIONS', 'HOLDING_COSTS', 'SELLING_COSTS', 'FINANCING', 'INSURANCE', 'UTILITIES', 'PERMITS', 'INSPECTIONS', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CHECK', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'RENTAL_BASIC', 'RENTAL_PREMIUM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('VACANT', 'OCCUPIED', 'MAINTENANCE', 'RENTED');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EVICTED', 'MOVED_OUT');

-- CreateEnum
CREATE TYPE "IncomeCategory" AS ENUM ('RENT', 'LATE_FEES', 'PET_FEES', 'OTHER');

-- CreateEnum
CREATE TYPE "RentalExpenseCategory" AS ENUM ('MAINTENANCE', 'REPAIRS', 'UTILITIES', 'INSURANCE', 'PROPERTY_TAX', 'MANAGEMENT_FEES', 'LEGAL_FEES', 'OTHER');

-- CreateEnum
CREATE TYPE "RentalTaskCategory" AS ENUM ('MAINTENANCE', 'REPAIRS', 'INSPECTIONS', 'CLEANING', 'LANDSCAPING', 'OTHER');

-- CreateEnum
CREATE TYPE "AreaType" AS ENUM ('CITY', 'ZIP', 'COUNTY', 'STATE');

-- CreateEnum
CREATE TYPE "Trade" AS ENUM ('GENERAL', 'GC', 'PLUMBING', 'ELECTRICAL', 'HVAC', 'ROOFING', 'PAINTING', 'FLOORING', 'OTHER');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED', 'PENDING');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('GL', 'WC', 'AUTO', 'UMBRELLA', 'OTHER');

-- CreateEnum
CREATE TYPE "LegalSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "LegalType" AS ENUM ('LAWSUIT', 'VIOLATION', 'COMPLAINT', 'OSHA_VIOLATION', 'BBB_COMPLAINT', 'OTHER');

-- CreateEnum
CREATE TYPE "PermitStatus" AS ENUM ('REQUESTED', 'APPROVED', 'ISSUED', 'INSPECTED', 'COMPLETED', 'EXPIRED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PermitType" AS ENUM ('BUILDING', 'ELECTRICAL', 'PLUMBING', 'HVAC', 'ROOFING', 'DEMOLITION', 'FENCE', 'POOL', 'DRIVEWAY', 'SIDEWALK', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkSpecialization" AS ENUM ('RESIDENTIAL_REMODEL', 'COMMERCIAL_BUILD', 'KITCHEN_BATH', 'ADDITION', 'FOUNDATION', 'ROOFING', 'ELECTRICAL', 'PLUMBING', 'HVAC', 'FLOORING', 'PAINTING', 'LANDSCAPING', 'POOL_SPA', 'OTHER');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('RANKING_DISPUTE', 'REVIEW_DISPUTE', 'LICENSE_UPDATE', 'INSURANCE_UPDATE', 'LEGAL_EVENT_DISPUTE', 'OTHER');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "MembershipType" AS ENUM ('BASIC', 'PREMIUM', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "language" TEXT NOT NULL DEFAULT 'en',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL DEFAULT 'SINGLE_FAMILY',
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "squareFeet" INTEGER,
    "lotSize" DOUBLE PRECISION,
    "yearBuilt" INTEGER,
    "condition" "Condition" NOT NULL DEFAULT 'FAIR',
    "purchasePrice" DOUBLE PRECISION,
    "estimatedRepairCosts" DOUBLE PRECISION,
    "estimatedARV" DOUBLE PRECISION,
    "estimatedProfit" DOUBLE PRECISION,
    "estimatedROI" DOUBLE PRECISION,
    "estimatedTimeline" INTEGER,
    "status" "PropertyStatus" NOT NULL DEFAULT 'ANALYZING',
    "notes" TEXT,
    "images" TEXT[],
    "documents" TEXT[],
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "dealName" TEXT,
    "offerPrice" DOUBLE PRECISION,
    "maxOffer" DOUBLE PRECISION,
    "closingCosts" DOUBLE PRECISION,
    "holdingCosts" DOUBLE PRECISION,
    "repairCosts" DOUBLE PRECISION,
    "sellingCosts" DOUBLE PRECISION,
    "totalInvestment" DOUBLE PRECISION,
    "estimatedARV" DOUBLE PRECISION,
    "estimatedProfit" DOUBLE PRECISION,
    "estimatedROI" DOUBLE PRECISION,
    "estimatedTimeline" INTEGER,
    "status" "DealStatus" NOT NULL DEFAULT 'ANALYZING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "financingType" "FinancingType" NOT NULL DEFAULT 'CASH',
    "downPayment" DOUBLE PRECISION,
    "interestRate" DOUBLE PRECISION,
    "loanTerm" INTEGER,
    "monthlyPayment" DOUBLE PRECISION,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "dealId" TEXT,
    "category" "ExpenseCategory" NOT NULL,
    "subcategory" TEXT,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "vendor" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receipt" TEXT,
    "notes" TEXT,
    "isReimbursable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "dealId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimatedHours" INTEGER,
    "actualHours" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "specialties" TEXT[],
    "rating" INTEGER,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "price" DOUBLE PRECISION,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_properties" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "monthlyRent" DOUBLE PRECISION NOT NULL,
    "deposit" DOUBLE PRECISION,
    "leaseStartDate" TIMESTAMP(3) NOT NULL,
    "leaseEndDate" TIMESTAMP(3),
    "status" "RentalStatus" NOT NULL DEFAULT 'VACANT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rentalPropertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "emergencyContact" JSONB,
    "moveInDate" TIMESTAMP(3) NOT NULL,
    "moveOutDate" TIMESTAMP(3),
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_income" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rentalPropertyId" TEXT NOT NULL,
    "tenantId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" "IncomeCategory" NOT NULL,
    "description" TEXT,
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_expenses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rentalPropertyId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" "RentalExpenseCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "vendor" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receipt" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rentalPropertyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "RentalTaskCategory" NOT NULL DEFAULT 'MAINTENANCE',
    "dueDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "assignedTo" TEXT,
    "cost" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "type" "AreaType" NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "population" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "trades" "Trade"[],
    "yearsInBusiness" INTEGER,
    "totalProjects" INTEGER NOT NULL DEFAULT 0,
    "totalValue" DECIMAL(65,30),
    "businessStartDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_contacts" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_licenses" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "boardName" TEXT,
    "status" "LicenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "adminVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "expiresOn" TIMESTAMP(3),
    "sourceUrl" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_policies" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "type" "InsuranceType" NOT NULL,
    "insurerName" TEXT NOT NULL,
    "policyNumber" TEXT,
    "coverageEachOccur" DECIMAL(65,30),
    "coverageAggregate" DECIMAL(65,30),
    "expiresOn" TIMESTAMP(3),
    "brokerName" TEXT,
    "brokerEmail" TEXT,
    "brokerPhone" TEXT,
    "certificateUrl" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),

    CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_events" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "type" "LegalType" NOT NULL,
    "severity" "LegalSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "filedOn" TIMESTAMP(3),
    "resolvedOn" TIMESTAMP(3),
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "trade" "Trade" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNED',
    "plannedStart" TIMESTAMP(3),
    "plannedEnd" TIMESTAMP(3),
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "budgetPlanned" DECIMAL(65,30),
    "budgetActual" DECIMAL(65,30),
    "warrantyMonths" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_reviews" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "quality" INTEGER NOT NULL,
    "timeliness" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "cleanliness" INTEGER NOT NULL,
    "safety" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contractorId" TEXT NOT NULL,

    CONSTRAINT "contractor_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspections" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "inspector" TEXT,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warranty_callbacks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "cost" DECIMAL(65,30),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warranty_callbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_area_scores" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "subscores" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_area_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permits" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "permitNumber" TEXT NOT NULL,
    "permitType" "PermitType" NOT NULL,
    "status" "PermitStatus" NOT NULL DEFAULT 'REQUESTED',
    "description" TEXT NOT NULL,
    "workDescription" TEXT,
    "propertyAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "approvedDate" TIMESTAMP(3),
    "issuedDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "expiredDate" TIMESTAMP(3),
    "cost" DECIMAL(65,30),
    "inspectorName" TEXT,
    "inspectionNotes" TEXT,
    "publicUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permit_inspections" (
    "id" TEXT NOT NULL,
    "permitId" TEXT NOT NULL,
    "inspectionType" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "inspectorName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "violations" TEXT,
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permit_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_work_specializations" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "specialization" "WorkSpecialization" NOT NULL,
    "permitCount" INTEGER NOT NULL DEFAULT 0,
    "totalValue" DECIMAL(65,30) DEFAULT 0,
    "averageDuration" INTEGER,
    "successRate" DECIMAL(65,30) DEFAULT 0,
    "lastWorkDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_work_specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_permit_correlations" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "insurancePolicyId" TEXT NOT NULL,
    "permitId" TEXT NOT NULL,
    "correlationType" TEXT NOT NULL,
    "daysDifference" INTEGER,
    "riskLevel" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_permit_correlations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_portals" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_portals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_challenges" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "challengeType" "ChallengeType" NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ranking_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractor_memberships" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "membershipType" "MembershipType" NOT NULL DEFAULT 'BASIC',
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" "AuditAction" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "meta" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "contractor_licenses_state_number_idx" ON "contractor_licenses"("state", "number");

-- CreateIndex
CREATE UNIQUE INDEX "contractor_licenses_contractorId_number_state_key" ON "contractor_licenses"("contractorId", "number", "state");

-- CreateIndex
CREATE INDEX "insurance_policies_expiresOn_idx" ON "insurance_policies"("expiresOn");

-- CreateIndex
CREATE INDEX "insurance_policies_contractorId_type_idx" ON "insurance_policies"("contractorId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_policies_contractorId_policyNumber_type_key" ON "insurance_policies"("contractorId", "policyNumber", "type");

-- CreateIndex
CREATE INDEX "projects_contractorId_areaId_status_idx" ON "projects"("contractorId", "areaId", "status");

-- CreateIndex
CREATE INDEX "contractor_reviews_contractorId_createdAt_idx" ON "contractor_reviews"("contractorId", "createdAt");

-- CreateIndex
CREATE INDEX "contractor_reviews_stars_createdAt_idx" ON "contractor_reviews"("stars", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "contractor_reviews_projectId_customerId_key" ON "contractor_reviews"("projectId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "contractor_area_scores_contractorId_areaId_period_key" ON "contractor_area_scores"("contractorId", "areaId", "period");

-- CreateIndex
CREATE INDEX "permits_contractorId_requestedDate_idx" ON "permits"("contractorId", "requestedDate");

-- CreateIndex
CREATE INDEX "permits_projectId_idx" ON "permits"("projectId");

-- CreateIndex
CREATE INDEX "permits_status_requestedDate_idx" ON "permits"("status", "requestedDate");

-- CreateIndex
CREATE UNIQUE INDEX "permits_permitNumber_city_state_key" ON "permits"("permitNumber", "city", "state");

-- CreateIndex
CREATE UNIQUE INDEX "permits_contractorId_permitNumber_city_key" ON "permits"("contractorId", "permitNumber", "city");

-- CreateIndex
CREATE INDEX "contractor_work_specializations_contractorId_idx" ON "contractor_work_specializations"("contractorId");

-- CreateIndex
CREATE UNIQUE INDEX "contractor_work_specializations_contractorId_specialization_key" ON "contractor_work_specializations"("contractorId", "specialization");

-- CreateIndex
CREATE UNIQUE INDEX "contractor_portals_contractorId_key" ON "contractor_portals"("contractorId");

-- CreateIndex
CREATE UNIQUE INDEX "contractor_portals_username_key" ON "contractor_portals"("username");

-- CreateIndex
CREATE UNIQUE INDEX "contractor_memberships_contractorId_key" ON "contractor_memberships"("contractorId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_properties" ADD CONSTRAINT "rental_properties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_properties" ADD CONSTRAINT "rental_properties_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_rentalPropertyId_fkey" FOREIGN KEY ("rentalPropertyId") REFERENCES "rental_properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_income" ADD CONSTRAINT "rental_income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_income" ADD CONSTRAINT "rental_income_rentalPropertyId_fkey" FOREIGN KEY ("rentalPropertyId") REFERENCES "rental_properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_income" ADD CONSTRAINT "rental_income_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_expenses" ADD CONSTRAINT "rental_expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_expenses" ADD CONSTRAINT "rental_expenses_rentalPropertyId_fkey" FOREIGN KEY ("rentalPropertyId") REFERENCES "rental_properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_tasks" ADD CONSTRAINT "rental_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_tasks" ADD CONSTRAINT "rental_tasks_rentalPropertyId_fkey" FOREIGN KEY ("rentalPropertyId") REFERENCES "rental_properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_contacts" ADD CONSTRAINT "contractor_contacts_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_licenses" ADD CONSTRAINT "contractor_licenses_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_events" ADD CONSTRAINT "legal_events_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_reviews" ADD CONSTRAINT "contractor_reviews_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_reviews" ADD CONSTRAINT "contractor_reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_reviews" ADD CONSTRAINT "contractor_reviews_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_callbacks" ADD CONSTRAINT "warranty_callbacks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_area_scores" ADD CONSTRAINT "contractor_area_scores_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_area_scores" ADD CONSTRAINT "contractor_area_scores_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permits" ADD CONSTRAINT "permits_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permits" ADD CONSTRAINT "permits_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permit_inspections" ADD CONSTRAINT "permit_inspections_permitId_fkey" FOREIGN KEY ("permitId") REFERENCES "permits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_work_specializations" ADD CONSTRAINT "contractor_work_specializations_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_permit_correlations" ADD CONSTRAINT "insurance_permit_correlations_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_permit_correlations" ADD CONSTRAINT "insurance_permit_correlations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_permit_correlations" ADD CONSTRAINT "insurance_permit_correlations_insurancePolicyId_fkey" FOREIGN KEY ("insurancePolicyId") REFERENCES "insurance_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_permit_correlations" ADD CONSTRAINT "insurance_permit_correlations_permitId_fkey" FOREIGN KEY ("permitId") REFERENCES "permits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_portals" ADD CONSTRAINT "contractor_portals_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_challenges" ADD CONSTRAINT "ranking_challenges_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_challenges" ADD CONSTRAINT "ranking_challenges_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "contractor_portals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_memberships" ADD CONSTRAINT "contractor_memberships_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
