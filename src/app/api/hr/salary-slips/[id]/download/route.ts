import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-legacy';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const user = await getAuthenticatedUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = params;

        const slip = await prisma.salarySlip.findUnique({
            where: { id },
            include: {
                employee: {
                    include: {
                        user: {
                            include: {
                                company: true
                            }
                        }
                    }
                }
            }
        });

        if (!slip) {
            return NextResponse.json({ error: 'Salary slip not found' }, { status: 404 });
        }

        // Authorization check
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'FINANCE_ADMIN') {
            const employeeProfile = await prisma.employeeProfile.findUnique({
                where: { userId: user.id }
            });
            if (slip.employeeId !== employeeProfile?.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // Generate PDF
        const doc = new jsPDF();
        const company = slip.employee.user.company;
        const employee = slip.employee;
        const userDetails = slip.employee.user;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text(company?.name || 'STM Journal Solutions', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(company?.address || 'Company Address', 105, 26, { align: 'center' });
        doc.text(`Email: ${company?.email || 'hr@company.com'} | Phone: ${company?.phone || 'N/A'}`, 105, 31, { align: 'center' });

        doc.setLineWidth(0.5);
        doc.line(15, 35, 195, 35);

        // Title
        doc.setFontSize(16);
        doc.text('SALARY SLIP', 105, 45, { align: 'center' });
        doc.setFontSize(12);
        const monthName = new Date(slip.year, slip.month - 1).toLocaleString('default', { month: 'long' });
        doc.text(`${monthName} ${slip.year}`, 105, 52, { align: 'center' });

        // Employee Details
        doc.setFontSize(10);
        doc.text('Employee Details:', 15, 65);

        const detailsData = [
            ['Name', userDetails.email.split('@')[0].toUpperCase(), 'Employee ID', employee.employeeId || 'N/A'],
            ['Designation', employee.designation || 'N/A', 'Bank Name', employee.bankName || 'N/A'],
            ['Department', userDetails.departmentId || 'General', 'Account No', employee.accountNumber || 'N/A'],
            ['Date of Joining', employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A', 'PAN', employee.panNumber || 'N/A']
        ];

        autoTable(doc, {
            startY: 68,
            head: [],
            body: detailsData,
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 2 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 30 },
                1: { cellWidth: 60 },
                2: { fontStyle: 'bold', cellWidth: 30 },
                3: { cellWidth: 60 }
            }
        });

        // Earnings
        doc.text('Earnings & Deductions:', 15, (doc as any).lastAutoTable.finalY + 10);

        const earningsData = [
            ['Description', 'Amount'],
            ['Basic Salary', slip.amountPaid.toFixed(2)],
            ['HRA', '0.00'],
            ['Special Allowance', '0.00'],
            ['Total Earnings', slip.amountPaid.toFixed(2)]
        ];

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 13,
            head: [['Earnings', 'Amount (INR)']],
            body: [
                ['Basic Salary', slip.amountPaid.toFixed(2)],
                ['House Rent Allowance', '0.00'],
                ['Special Allowance', '0.00'],
                ['Bonus', '0.00'],
                ['Total Earnings', slip.amountPaid.toFixed(2)]
            ],
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [66, 66, 66] }
        });

        // Net Pay
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Net Pay: INR ${slip.amountPaid.toFixed(2)}`, 150, finalY, { align: 'right' });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text('Amount in words: ' + ' Rupees Only', 15, finalY);

        // Footer
        doc.text('This is a computer-generated document and does not require a signature.', 105, 270, { align: 'center' });

        const pdfBuffer = doc.output('arraybuffer');

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Salary_Slip_${monthName}_${slip.year}.pdf"`
            }
        });

    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
