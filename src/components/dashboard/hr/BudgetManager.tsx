'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    PieChart, BarChart, DollarSign,
    ArrowUpRight, ArrowDownRight,
    TrendingUp, Plus, Search, Filter
} from 'lucide-react';
import { fetchJson } from '@/lib/api-utils';

export default function BudgetManager() {
    const queryClient = useQueryClient();
    const [fiscalYear] = useState(new Date().getFullYear());

    const { data: budgets, isLoading } = useQuery<any[]>({
        queryKey: ['department-budgets', fiscalYear],
        queryFn: () => fetchJson(`/api/hr/payroll/budgets?fiscalYear=${fiscalYear}`)
    });

    const { data: departments } = useQuery<any[]>({
        queryKey: ['departments'],
        queryFn: () => fetchJson('/api/hr/departments')
    });

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        departmentId: '',
        allocated: '',
        category: 'SALARY',
        fiscalYear: fiscalYear.toString()
    });

    const saveBudget = useMutation({
        mutationFn: (data: any) => fetchJson('/api/hr/payroll/budgets', 'POST', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['department-budgets'] });
            setShowModal(false);
        }
    });

    if (isLoading) return <div className="p-10 text-center font-bold text-secondary-400">Loading budgets...</div>;

    const totalAllocated = budgets?.reduce((acc, b) => acc + b.allocated, 0) || 0;
    const totalSpent = budgets?.reduce((acc, b) => acc + b.spent, 0) || 0;
    const variance = totalAllocated - totalSpent;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Budget Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-premium p-8 bg-secondary-900 border-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-2">Total Fiscal Allocation</p>
                    <div className="flex items-end gap-2">
                        <p className="text-4xl font-black text-white">₹{totalAllocated.toLocaleString()}</p>
                        <span className="text-secondary-400 text-xs font-bold mb-1">FY {fiscalYear}</span>
                    </div>
                </div>

                <div className="card-premium p-8 border-l-4 border-success-500">
                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-2">Current Utilization</p>
                    <div className="flex items-center justify-between">
                        <p className="text-3xl font-black text-secondary-900">₹{totalSpent.toLocaleString()}</p>
                        <div className="flex items-center text-success-600 font-bold text-sm">
                            <ArrowUpRight size={16} /> {((totalSpent / (totalAllocated || 1)) * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div className="card-premium p-8 border-l-4 border-primary-500">
                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-2">Remaining Runway</p>
                    <p className="text-3xl font-black text-secondary-900">₹{variance.toLocaleString()}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-2xl font-black text-secondary-900 tracking-tight">Departmental Budgets</h3>
                    <p className="text-secondary-500 font-medium">Variance analysis and expenditure tracking.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn bg-secondary-900 text-white px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl"
                >
                    <Plus size={16} /> Allocate Budget
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {budgets?.map((budget) => {
                    const usagePercent = Math.min((budget.spent / budget.allocated) * 100, 100);
                    return (
                        <div key={budget.id} className="card-premium p-8 group hover:border-primary-200 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-secondary-50 flex items-center justify-center text-xl shadow-inner">
                                        🏢
                                    </div>
                                    <div>
                                        <h4 className="font-black text-secondary-900 text-lg">{budget.department.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-[8px] font-black uppercase rounded">{budget.category}</span>
                                            <span className="text-[10px] text-secondary-400 font-bold">FY {budget.fiscalYear}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-secondary-900">₹{budget.allocated.toLocaleString()}</p>
                                    <p className="text-[9px] font-bold text-secondary-400 uppercase">Allocated</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-secondary-500 mb-1">
                                    <span>Spent: ₹{budget.spent.toLocaleString()}</span>
                                    <span className={usagePercent > 90 ? 'text-danger-600' : 'text-primary-600'}>{usagePercent.toFixed(1)}%</span>
                                </div>
                                <div className="w-full h-3 bg-secondary-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${usagePercent > 90 ? 'bg-danger-500' : 'bg-primary-500'}`}
                                        style={{ width: `${usagePercent}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {budgets?.length === 0 && (
                    <div className="col-span-full py-40 text-center card-premium border-dashed border-4 border-secondary-100 bg-secondary-50/20">
                        <TrendingUp size={64} className="mx-auto text-secondary-200 mb-6" />
                        <h3 className="text-2xl font-black text-secondary-900 tracking-tight">No budgets defined for {fiscalYear}</h3>
                        <p className="text-secondary-500 font-medium mt-2">Start allocating department-wise funds to track expenditure.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-secondary-50 flex justify-between items-center bg-secondary-50/30">
                            <h3 className="text-xl font-black text-secondary-900 uppercase tracking-tight">Budget Allocation</h3>
                            <button onClick={() => setShowModal(false)} className="text-secondary-400 hover:text-secondary-900 text-2xl">×</button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Department</label>
                                <select
                                    className="w-full bg-secondary-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary-500"
                                    value={formData.departmentId}
                                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                >
                                    <option value="">Select Department</option>
                                    {departments?.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Allocated Amount</label>
                                    <input
                                        type="number"
                                        className="w-full bg-secondary-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary-500"
                                        placeholder="e.g. 5000000"
                                        value={formData.allocated}
                                        onChange={(e) => setFormData({ ...formData, allocated: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Category</label>
                                    <select
                                        className="w-full bg-secondary-50 border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-primary-500"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="SALARY">Salary</option>
                                        <option value="TRAINING">Training</option>
                                        <option value="OPERATIONS">Operations</option>
                                        <option value="MARKETING">Marketing</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={() => saveBudget.mutate(formData)}
                                disabled={!formData.departmentId || !formData.allocated}
                                className="w-full btn bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary-100 transition-all mt-4 disabled:opacity-50"
                            >
                                Confirm Allocation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
