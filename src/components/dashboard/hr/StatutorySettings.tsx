'use client';

import { useState, useEffect } from 'react';
import { useStatutoryConfig } from '@/hooks/useHR';
import { ShieldCheck, Percent, IndianRupee, Save, Info } from 'lucide-react';

export default function StatutorySettings() {
    const { data: config, isLoading, update } = useStatutoryConfig();
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (config) setFormData(config);
    }, [config]);

    const handleSave = async () => {
        try {
            await update.mutateAsync(formData);
            alert('Statutory settings updated successfully!');
        } catch (err) {
            alert('Failed to update settings');
        }
    };

    if (isLoading || !formData) return <div className="p-8 text-center animate-pulse text-secondary-400 font-medium">Loading statutory configuration...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-3xl p-8 border border-secondary-100 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <ShieldCheck size={120} />
                </div>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-secondary-900 tracking-tight">Statutory Compliance</h3>
                        <p className="text-secondary-500 text-sm mt-1 font-medium">Configure Indian labor laws and tax deduction rules for your company.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={update.isPending}
                        className="btn bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary-200 transition-all font-bold uppercase tracking-widest text-xs"
                    >
                        <Save size={18} />
                        {update.isPending ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* PF Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-3 border-b border-secondary-50">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                <Percent size={20} />
                            </div>
                            <h4 className="font-bold text-secondary-800 uppercase tracking-wider text-xs">Provident Fund (PF) Settings</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label-text mb-2 block text-[10px] uppercase font-black text-secondary-400 tracking-widest">Employee Rate (%)</label>
                                <input
                                    type="number"
                                    value={formData.pfEmployeeRate}
                                    onChange={e => setFormData({ ...formData, pfEmployeeRate: parseFloat(e.target.value) })}
                                    className="input bg-secondary-50 border-secondary-100 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all font-bold"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label-text mb-2 block text-[10px] uppercase font-black text-secondary-400 tracking-widest">Employer Rate (%)</label>
                                <input
                                    type="number"
                                    value={formData.pfEmployerRate}
                                    onChange={e => setFormData({ ...formData, pfEmployerRate: parseFloat(e.target.value) })}
                                    className="input bg-secondary-50 border-secondary-100 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all font-bold"
                                />
                            </div>
                        </div>
                        <div className="form-control">
                            <label className="label-text mb-2 block text-[10px] uppercase font-black text-secondary-400 tracking-widest">Wage Ceiling (₹)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center text-secondary-400"><IndianRupee size={14} /></div>
                                <input
                                    type="number"
                                    value={formData.pfCeilingAmount}
                                    onChange={e => setFormData({ ...formData, pfCeilingAmount: parseFloat(e.target.value) })}
                                    className="input pl-10 bg-secondary-50 border-secondary-100 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all font-bold"
                                />
                            </div>
                            <p className="mt-2 text-[10px] text-secondary-400 font-medium italic">* Standard threshold is ₹15,000</p>
                        </div>
                    </div>

                    {/* ESI Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-3 border-b border-secondary-50">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <ShieldCheck size={20} />
                            </div>
                            <h4 className="font-bold text-secondary-800 uppercase tracking-wider text-xs">Employee State Insurance (ESIC)</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label-text mb-2 block text-[10px] uppercase font-black text-secondary-400 tracking-widest">Employee Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.esicEmployeeRate}
                                    onChange={e => setFormData({ ...formData, esicEmployeeRate: parseFloat(e.target.value) })}
                                    className="input bg-secondary-50 border-secondary-100 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label-text mb-2 block text-[10px] uppercase font-black text-secondary-400 tracking-widest">Employer Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.esicEmployerRate}
                                    onChange={e => setFormData({ ...formData, esicEmployerRate: parseFloat(e.target.value) })}
                                    className="input bg-secondary-50 border-secondary-100 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                                />
                            </div>
                        </div>
                        <div className="form-control">
                            <label className="label-text mb-2 block text-[10px] uppercase font-black text-secondary-400 tracking-widest">ESIC Limit (Gross ₹)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center text-secondary-400"><IndianRupee size={14} /></div>
                                <input
                                    type="number"
                                    value={formData.esicLimitAmount}
                                    onChange={e => setFormData({ ...formData, esicLimitAmount: parseFloat(e.target.value) })}
                                    className="input pl-10 bg-secondary-50 border-secondary-100 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                                />
                            </div>
                            <p className="mt-2 text-[10px] text-secondary-400 font-medium italic">* Employees with Gross Salary ≤ ₹21,000 are covered</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 p-6 bg-secondary-50 rounded-2xl flex items-start gap-4">
                    <Info className="text-primary-500 mt-1 shrink-0" size={20} />
                    <div>
                        <h5 className="font-bold text-secondary-900 text-sm">Professional Tax (PT) & State Slabs</h5>
                        <p className="text-secondary-600 text-[11px] mt-1 font-medium leading-relaxed">
                            Professional Tax is currently calculated based on standard Maharashtra slabs (₹200 for Gross &gt; ₹10,000).
                            Enabling PT will automatically deduct this from compliant employees.
                        </p>
                        <label className="flex items-center gap-3 mt-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.ptEnabled}
                                onChange={e => setFormData({ ...formData, ptEnabled: e.target.checked })}
                                className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-xs font-black text-secondary-700 uppercase tracking-widest">Enable Professional Tax Deduction</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
