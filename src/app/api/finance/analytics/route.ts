import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export const GET = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE_ADMIN'],
    async (req: NextRequest, user) => {
        try {
            const companyId = user.companyId;
            const now = new Date();
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(now.getMonth() - 11);
            twelveMonthsAgo.setDate(1);

            // 1. Fetch Actuals for last 12 months
            const actuals = await prisma.financialRecord.findMany({
                where: {
                    companyId: companyId || undefined,
                    date: { gte: twelveMonthsAgo },
                    status: 'COMPLETED'
                },
                orderBy: { date: 'asc' }
            });

            // 2. Fetch Revenue from Payments (if not already logged in FinancialRecord)
            // Note: In a real system, we might want to sync these. 
            // For this implementation, we aggregate both.
            const payments = await prisma.payment.findMany({
                where: {
                    companyId: companyId || undefined,
                    paymentDate: { gte: twelveMonthsAgo },
                    status: 'captured'
                }
            });

            // 3. Aggregate Monthly Data
            const monthlyData: Record<string, { month: string, revenue: number, expense: number, counts: number }> = {};

            // Initialize 12 months
            for (let i = 0; i < 12; i++) {
                const d = new Date(twelveMonthsAgo);
                d.setMonth(twelveMonthsAgo.getMonth() + i);
                const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                monthlyData[key] = {
                    month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
                    revenue: 0,
                    expense: 0,
                    counts: 0
                };
            }

            // Process FinancialRecords
            actuals.forEach(rec => {
                const key = `${rec.date.getFullYear()}-${(rec.date.getMonth() + 1).toString().padStart(2, '0')}`;
                if (monthlyData[key]) {
                    if (rec.type === 'REVENUE') monthlyData[key].revenue += rec.amount;
                    else monthlyData[key].expense += rec.amount;
                    monthlyData[key].counts++;
                }
            });

            // Process Payments as Revenue
            payments.forEach(pay => {
                const key = `${pay.paymentDate.getFullYear()}-${(pay.paymentDate.getMonth() + 1).toString().padStart(2, '0')}`;
                if (monthlyData[key]) {
                    monthlyData[key].revenue += pay.amount;
                }
            });

            const dataArray = Object.values(monthlyData);

            // 4. Simple Forecasting (Average growth/Linear regression simplified)
            // We'll use the last 3-6 months average to project
            const last3Months = dataArray.slice(-3);
            const avgRev = last3Months.reduce((a, b) => a + b.revenue, 0) / 3;
            const avgExp = last3Months.reduce((a, b) => a + b.expense, 0) / 3;

            const forecast = [];
            for (let i = 1; i <= 3; i++) {
                const d = new Date();
                d.setMonth(now.getMonth() + i);
                forecast.push({
                    month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
                    projectedRevenue: Number((avgRev * (1 + (i * 0.05))).toFixed(2)), // assuming 5% growth estimate
                    projectedExpense: Number((avgExp * (1 + (i * 0.02))).toFixed(2)), // assuming 2% growth estimate
                    isForecast: true
                });
            }

            // 5. Category Breakdown
            const categories = await prisma.financialRecord.groupBy({
                by: ['category', 'type'],
                where: { companyId: companyId || undefined },
                _sum: { amount: true }
            });

            return NextResponse.json({
                actuals: dataArray,
                forecast,
                categories: categories.map(c => ({
                    name: c.category,
                    type: c.type,
                    value: c._sum.amount
                }))
            });

        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
