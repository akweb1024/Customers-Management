'use client';

import { useState, useEffect } from 'react';
import { useEmployees, useSalaryStructures } from '@/hooks/useHR';
import { IndianRupee, PieChart, Users, ArrowRight, Calculator } from 'lucide-react';

export default function SalaryStructureManager() {
    const { data: employees } = useEmployees();
    const { data: structures, upsert } = useSalaryStructures();
    const [selectedEmp, setSelectedEmp] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        basicSalary: 0,
        hra: 0,
        conveyance: 0,
        medical: 0,
        specialAllowance: 0,
        otherAllowances: 0,
        pfEmployee: 0,
        esicEmployee: 0,
        professionalTax: 0,
        tds: 0,
        pfEmployer: 0,
        esicEmployer: 0
    });

    useEffect(() => {
        if (selectedEmp && structures) {
            const struct = structures.find((s: any) => s.employeeId === selectedEmp.id);
            if (struct) {
                setFormData(struct);
            } else {
                setFormData({
                    basicSalary: 0,
                    hra: 0,
                    conveyance: 0,
                    medical: 0,
                    specialAllowance: 0,
                    otherAllowances: 0,
                    pfEmployee: 0,
                    esicEmployee: 0,
                    professionalTax: 0,
                    tds: 0,
                    pfEmployer: 0,
                    esicEmployer: 0
                });
            }
        }
    }, [selectedEmp, structures]);

    const calculateTotals = () => {
        const earnings = (formData.basicSalary || 0) + (formData.hra || 0) + (formData.conveyance || 0) + (formData.medical || 0) + (formData.specialAllowance || 0) + (formData.otherAllowances || 0);
        const deductions = (formData.pfEmployee || 0) + (formData.esicEmployee || 0) + (formData.professionalTax || 0) + (formData.tds || 0);
        const employerContrib = (formData.pfEmployer || 0) + (formData.esicEmployer || 0);

        return {
            gross: earnings,
            deductions,
            net: earnings - deductions,
            ctc: earnings + employerContrib
        };
    };

    const totals = calculateTotals();

    const handleSave = async () => {
        if (!selectedEmp) return;
        try {
            await upsert.mutateAsync({ ...formData, employeeId: selectedEmp.id });
            alert('Salary structure saved!');
        } catch (err) {
            alert('Failed to save structure');
        }
    };

    const autoPopulate = () => {
        const gross = parseFloat(prompt("Enter Target Monthly Gross Amount:") || "0");
        if (gross > 0) {
            // Standard Indian breakdown: 40-50% Basic, 50% of Basic as HRA, etc.
            const basic = Math.round(gross * 0.4);
            const hra = Math.round(basic * 0.5);
            const special = gross - basic - hra;

            // Deductions
            const pf = Math.min(basic, 15000) * 0.12;
            let esic = 0;
            if (gross <= 21000) esic = Math.ceil(gross * 0.0075);

            setFormData({
                ...formData,
                basicSalary: basic,
                hra,
                specialAllowance: special,
                conveyance: 0,
                medical: 0,
                otherAllowances: 0,
                pfEmployee: pf,
                pfEmployer: pf,
                esicEmployee: esic,
                esicEmployer: Math.ceil(gross * 0.0325),
                professionalTax: gross > 10000 ? 200 : 0
            });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
            {/* Employee Sidebar */}
            <div className="lg:col-span-1 card-premium p-0 overflow-hidden flex flex-col h-[700px]">
                <div className="p-6 border-b border-secondary-100 bg-secondary-50/50">
                    <h3 className="flex items-center gap-2 font-black text-secondary-900 uppercase tracking-tighter text-lg">
                        <Users className="text-primary-600" size={20} />
                        Select Staff
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 p-2">
                    {employees?.map((emp: any) => (
                        <button
                            key={emp.id}
                            onClick={() => setSelectedEmp(emp)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${selectedEmp?.id === emp.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' : 'hover:bg-secondary-50 text-secondary-600'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${selectedEmp?.id === emp.id ? 'bg-white/20' : 'bg-secondary-100 text-secondary-400'}`}>
                                {emp.user?.name?.[0] || emp.user?.email?.[0].toUpperCase()}
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="font-bold truncate text-sm">{emp.user?.name || emp.user?.email.split('@')[0]}</p>
                                <p className={`text-[10px] uppercase font-bold tracking-widest ${selectedEmp?.id === emp.id ? 'text-primary-100' : 'text-secondary-400'}`}>{emp.designation}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Structure Editor */}
            <div className="lg:col-span-2 space-y-6">
                {selectedEmp ? (
                    <>
                        <div className="card-premium p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                                <PieChart size={140} />
                            </div>
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-secondary-900 tracking-tight">Salary Structure</h2>
                                    <p className="text-secondary-500 font-medium text-sm">Define components for <span className="text-primary-600 font-bold">{selectedEmp.user?.name || selectedEmp.user?.email}</span></p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={autoPopulate} className="btn bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-bold text-xs uppercase tracking-widest px-6 rounded-xl flex items-center gap-2 transition-all">
                                        <Calculator size={16} /> Auto-Breakdown
                                    </button>
                                    <button onClick={handleSave} className="btn bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-widest px-8 rounded-xl shadow-lg shadow-primary-200 transition-all flex items-center gap-2">
                                        Save Changes <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Monthly Earnings */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] border-b border-primary-100 pb-2">Monthly Earnings</h4>
                                    <div className="space-y-4">
                                        <div className="form-control">
                                            <label className="label-text mb-1 block text-[10px] font-bold text-secondary-400 uppercase">Basic Salary</label>
                                            <div className="relative">
                                                <input type="number" value={formData.basicSalary} onChange={e => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })} className="input w-full bg-secondary-50 border-secondary-100 font-bold text-secondary-900 focus:ring-primary-500" />
                                                <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-300" size={14} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label-text mb-1 block text-[10px] font-bold text-secondary-400 uppercase">HRA</label>
                                                <input type="number" value={formData.hra} onChange={e => setFormData({ ...formData, hra: parseFloat(e.target.value) || 0 })} className="input bg-secondary-50 border-secondary-100 font-bold text-secondary-900" />
                                            </div>
                                            <div className="form-control">
                                                <label className="label-text mb-1 block text-[10px] font-bold text-secondary-400 uppercase">Special Allowance</label>
                                                <input type="number" value={formData.specialAllowance} onChange={e => setFormData({ ...formData, specialAllowance: parseFloat(e.target.value) || 0 })} className="input bg-secondary-50 border-secondary-100 font-bold text-secondary-900" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label-text mb-1 block text-[10px] font-bold text-secondary-400 uppercase">Conveyance</label>
                                                <input type="number" value={formData.conveyance} onChange={e => setFormData({ ...formData, conveyance: parseFloat(e.target.value) || 0 })} className="input bg-secondary-50 border-secondary-100 font-bold text-secondary-900" />
                                            </div>
                                            <div className="form-control">
                                                <label className="label-text mb-1 block text-[10px] font-bold text-secondary-400 uppercase">Medical</label>
                                                <input type="number" value={formData.medical} onChange={e => setFormData({ ...formData, medical: parseFloat(e.target.value) || 0 })} className="input bg-secondary-50 border-secondary-100 font-bold text-secondary-900" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Statutory Deductions */}
                                <div className="space-y-6 text-secondary-900">
                                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] border-b border-rose-100 pb-2">Statutory Deductions</h4>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label-text mb-1 block text-[10px] font-bold text-secondary-400 uppercase">PF (Employee)</label>
                                                <input type="number" value={formData.pfEmployee} onChange={e => setFormData({ ...formData, pfEmployee: parseFloat(e.target.value) || 0 })} className="input bg-secondary-50 border-secondary-100 font-bold text-secondary-900" />
                                            </div>
                                            <div className="form-control">
                                                <label className="label-text mb-1 block text-[10px] font-bold text-secondary-400 uppercase">ESIC (Employee)</label>
                                                <input type="number" value={formData.esicEmployee} onChange={e => setFormData({ ...formData, esicEmployee: parseFloat(e.target.value) || 0 })} className="input bg-secondary-50 border-secondary-100 font-bold text-secondary-900" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label-text mb-1 block text-[10px] font-bold text-secondary-400 uppercase">Prof. Tax (PT)</label>
                                                <input type="number" value={formData.professionalTax} onChange={e => setFormData({ ...formData, professionalTax: parseFloat(e.target.value) || 0 })} className="input bg-secondary-50 border-secondary-100 font-bold text-secondary-900" />
                                            </div>
                                            <div className="form-control">
                                                <label className="label-text mb-1 block text-[10px] font-bold text-secondary-400 uppercase">TDS (Est. Monthly)</label>
                                                <input type="number" value={formData.tds} onChange={e => setFormData({ ...formData, tds: parseFloat(e.target.value) || 0 })} className="input bg-secondary-50 border-secondary-100 font-bold text-secondary-900" />
                                            </div>
                                        </div>
                                        <div className="p-4 bg-rose-50 rounded-2xl">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Total Deductions</span>
                                                <span className="text-xl font-black text-rose-700">₹{totals.deductions.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="card-premium p-6 bg-secondary-900 text-white border-0 shadow-2xl">
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Monthly Gross</p>
                                <p className="text-3xl font-black truncate">₹{totals.gross.toLocaleString()}</p>
                            </div>
                            <div className="card-premium p-6 bg-primary-600 text-white border-0 shadow-2xl">
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Net In-Hand</p>
                                <p className="text-3xl font-black truncate">₹{totals.net.toLocaleString()}</p>
                            </div>
                            <div className="card-premium p-6 bg-indigo-600 text-white border-0 shadow-2xl">
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Total CTC</p>
                                <p className="text-3xl font-black truncate">₹{totals.ctc.toLocaleString()}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-secondary-50/50 rounded-[2.5rem] border-4 border-dashed border-secondary-100">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner mb-6 text-secondary-200">
                            <Users size={40} />
                        </div>
                        <h3 className="text-xl font-black text-secondary-900 tracking-tight">Financial Profile Configuration</h3>
                        <p className="text-secondary-400 max-w-xs mt-2 font-medium">Please select a staff member from the left to manage their salary structure and statutory components.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
