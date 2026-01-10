import { prisma } from './prisma';

export interface PayrollInput {
    basicSalary: number;
    hra: number;
    conveyance: number;
    medical: number;
    specialAllowance: number;
    otherAllowances: number;
    lwpDays: number;
    daysInMonth: number;
    arrears?: number;
}

export interface StatutorySettings {
    pfEmployeeRate: number;
    pfEmployerRate: number;
    pfCeilingAmount: number;
    esicEmployeeRate: number;
    esicEmployerRate: number;
    esicLimitAmount: number;
    ptEnabled: boolean;
}

export interface PayrollBreakdown {
    earnings: {
        basic: number;
        hra: number;
        conveyance: number;
        medical: number;
        specialAllowance: number;
        otherAllowances: number;
        gross: number;
    };
    deductions: {
        pfEmployee: number;
        esicEmployee: number;
        professionalTax: number;
        lwpDeduction: number;
        tds: number;
        total: number;
    };
    employerContribution: {
        pfEmployer: number;
        esicEmployer: number;
    };
    arrears: number;
    netPayable: number;
    costToCompany: number;
}

/**
 * Robust Payroll Calculation Engine for Indian SME Compliance
 */
export class PayrollCalculator {
    static async getStatutoryConfig(companyId: string): Promise<StatutorySettings> {
        const config = await prisma.statutoryConfig.findUnique({
            where: { companyId }
        });

        return {
            pfEmployeeRate: config?.pfEmployeeRate ?? 12.0,
            pfEmployerRate: config?.pfEmployerRate ?? 12.0,
            pfCeilingAmount: config?.pfCeilingAmount ?? 15000.0,
            esicEmployeeRate: config?.esicEmployeeRate ?? 0.75,
            esicEmployerRate: config?.esicEmployerRate ?? 3.25,
            esicLimitAmount: config?.esicLimitAmount ?? 21000.0,
            ptEnabled: config?.ptEnabled ?? true,
        };
    }

    static calculate(input: PayrollInput, config: StatutorySettings): PayrollBreakdown {
        const {
            basicSalary, hra, conveyance, medical, specialAllowance, otherAllowances,
            lwpDays, daysInMonth
        } = input;

        // 1. Calculate Gross Earnings before deductions
        const totalGrossFixed = basicSalary + hra + conveyance + medical + specialAllowance + otherAllowances;

        // 2. Adjust for Loss of Pay (LOP)
        let lwpDeduction = 0;
        if (lwpDays > 0) {
            lwpDeduction = (totalGrossFixed / daysInMonth) * lwpDays;
        }

        // Adjusted earnings values
        const ratio = (totalGrossFixed - lwpDeduction) / totalGrossFixed;
        const adjBasic = basicSalary * ratio;
        const adjHRA = hra * ratio;
        const adjConveyance = conveyance * ratio;
        const adjMedical = medical * ratio;
        const adjSpecial = specialAllowance * ratio;
        const adjOthers = otherAllowances * ratio;
        const adjustedGross = adjBasic + adjHRA + adjConveyance + adjMedical + adjSpecial + adjOthers;

        // 3. Deductions

        // PF Calculation (Typically 12% of Basic, capped at ceiling)
        const pfBasis = Math.min(adjBasic, config.pfCeilingAmount);
        const pfEmployee = (pfBasis * config.pfEmployeeRate) / 100;
        const pfEmployer = (pfBasis * config.pfEmployerRate) / 100;

        // ESIC Calculation (Only if Gross <= Limit)
        let esicEmployee = 0;
        let esicEmployer = 0;
        if (adjustedGross <= config.esicLimitAmount) {
            esicEmployee = Math.ceil(adjustedGross * (config.esicEmployeeRate / 100));
            esicEmployer = Math.ceil(adjustedGross * (config.esicEmployerRate / 100));
        }

        // PT (Professional Tax) - Simplified slab for Indian states (e.g. MH Type)
        let pt = 0;
        if (config.ptEnabled) {
            if (adjustedGross > 10000) pt = 200;
            else if (adjustedGross > 7500) pt = 175;
        }

        // TDS (Tax Deducted at Source) - Placeholder for now
        // A full implementation requires projecting annual income and applying tax slabs.
        const tds = 0;

        const totalDeductions = pfEmployee + esicEmployee + pt + tds;
        const arrears = input.arrears || 0;
        const netPayable = adjustedGross - totalDeductions + arrears;
        const ctc = adjustedGross + pfEmployer + esicEmployer + arrears;

        return {
            earnings: {
                basic: adjBasic,
                hra: adjHRA,
                conveyance: adjConveyance,
                medical: adjMedical,
                specialAllowance: adjSpecial,
                otherAllowances: adjOthers,
                gross: adjustedGross
            },
            deductions: {
                pfEmployee,
                esicEmployee,
                professionalTax: pt,
                lwpDeduction,
                tds,
                total: totalDeductions
            },
            employerContribution: {
                pfEmployer,
                esicEmployer
            },
            arrears,
            netPayable,
            costToCompany: ctc
        };
    }
}
