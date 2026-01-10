# Implementation Plan - HRMS Phase 1: Statutory Payroll & Compliance

This plan outlines the upgrade to a full-proof Indian Statutory Payroll system, ensuring compliance with PF, ESIC, Professional Tax, and Income Tax (TDS) regulations.

## 1. Schema Modifications (Prisma)

### A. Statutory Configuration
Create a model to store company-level statutory settings.
```prisma
model StatutoryConfig {
  id                String   @id @default(uuid())
  companyId         String   @unique
  company           Company  @relation(fields: [companyId], references: [id])

  // PF Settings
  pfEmployeeRate    Float    @default(12.0)
  pfEmployerRate    Float    @default(12.0)
  pfCeilingAmount   Float    @default(15000.0)
  pfAdminCharges    Float    @default(0.5)

  // ESIC Settings
  esicEmployeeRate  Float    @default(0.75)
  esicEmployerRate  Float    @default(3.25)
  esicLimitAmount   Float    @default(21000.0)

  // Professional Tax Settings (State-specific logic will be in code, settings here)
  ptEnabled         Boolean  @default(true)
  state             String?

  updatedAt         DateTime @updatedAt
}
```

### B. Tax Declarations
Enable employees to declare investments for TDS calculation.
```prisma
model TaxDeclaration {
  id                String          @id @default(uuid())
  employeeId        String
  employee          EmployeeProfile @relation(fields: [employeeId], references: [id])
  fiscalYear        String          // e.g., "2023-24"
  regime            String          @default("NEW") // OLD, NEW

  // Standard Sections
  section80C        Float           @default(0) // LIC, PPF, ELSS, etc.
  section80D        Float           @default(0) // Medical Insurance
  nps               Float           @default(0) // 80CCD(1B)
  hraRentPaid       Float           @default(0) // For HRA calculation
  homeLoanInterest  Float           @default(0) // Section 24
  otherIncome       Float           @default(0)

  status            String          @default("DRAFT") // DRAFT, SUBMITTED, APPROVED, REJECTED
  adminComment      String?
  
  proofs            DeclarationProof[]
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
}

model DeclarationProof {
  id                  String         @id @default(uuid())
  taxDeclarationId    String
  taxDeclaration      TaxDeclaration @relation(fields: [taxDeclarationId], references: [id])
  
  category            String         // 80C, 80D, HRA, etc.
  fileUrl             String
  fileName            String
  amount              Float
  status              String         @default("PENDING") // PENDING, APPROVED, REJECTED
}
```

### C. Salary Slip Enhancement
Breakdown storage for historical records.
```prisma
// Update SalarySlip model to include:
// basic, hra, conveyance, medical, specialAllowance, otherAllowances
// pfEmployee, esicEmployee, pt, tds, lwpDeduction, advanceDeduction
// pfEmployer, esicEmployer, gratuityProvision
```

## 2. Payroll Logic Engine (Backend)

Implementation of `PayrollCalculator` service in `src/lib/payroll.ts`:
*   **HRA Exemption**: Least of (Actual HRA, 40/50% of Basic, Rent - 10% of Basic).
*   **Standard Deduction**: Fixed ₹50,000 for salaried employees.
*   **TDS Calculation**: Progressive slab rates for Old/New regimes.
*   **LOP Logic**: `(Annual Gross / 12 / Days in Month) * LOP Days`.

## 3. UI/UX Workflows

### Phase 1.1: Admin Setup
*   `Settings > Payroll Config`: Toggle PF/ESI and set company-specific ceilings.
*   `HR > Salary Structures`: Bulk assign or edit employee salary components.

### Phase 1.2: Employee Self-Service
*   `Staff Portal > Tax Declarations`: Form with old vs new regime comparison based on current CTC.
*   `Staff Portal > Proof Upload`: Drag-and-drop UI for rent receipts and LIC docs.

### Phase 1.3: Monthly Cycle
*   `HR > Run Payroll`: Preview table showing Gross, Deductions, and Net for all.
*   `HR > Approvals`: Review and approve/reject employee tax proofs.

## 4. Execution Steps
1.  **DB Migration**: Update schema and run `npx prisma migrate`.
2.  **Backend Services**: Build statutory calculation helpers.
3.  **Admin UI**: Payroll configuration and bulk structure assignment.
4.  **Staff Portal**: Declaration module.
5.  **Payslip Engine**: Update generation logic and PDF template.
